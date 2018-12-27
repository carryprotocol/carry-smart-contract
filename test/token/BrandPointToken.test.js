const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const BrandPointToken = artifacts.require('BrandPointToken');
const CarryToken = artifacts.require('CarryToken');
const TokenStake = artifacts.require('TokenStake');

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const MINIMUM_STAKE = 100;

contract('BrandPointToken', accounts => {
  const [owner, deviceManager1, deviceManager2, userAddress, anyone] = accounts;

  beforeEach(async function() {
    this.carryToken = await CarryToken.new({ from: owner });
    await this.carryToken.mint(owner, 10000000000, { from: owner });
    this.tokenStake = await TokenStake.new(this.carryToken.address, {
      from: owner
    });
    this.brandPointToken = await BrandPointToken.new(
      [deviceManager1, deviceManager2],
      this.tokenStake.address,
      {
        from: owner
      }
    );
  });

  describe('Initialize', function() {
    it('should have right owner', async function() {
      (await this.brandPointToken.owner()).should.be.equal(owner);
    });

    it('should register initial device manager addresses', async function() {
      (await this.brandPointToken.managerAddresses(
        deviceManager1
      )).should.be.equal(true);
      (await this.brandPointToken.managerAddresses(
        deviceManager2
      )).should.be.equal(true);
    });

    it('should disallow to receive zero address token stake contract at constructor', async function() {
      await BrandPointToken.new(
        [deviceManager1, deviceManager2],
        ZERO_ADDRESS,
        {
          from: owner
        }
      ).should.be.rejected;
    });

    it('should have right token stake contract address', async function() {
      (await this.brandPointToken.tokenStake()).should.be.equal(
        this.tokenStake.address
      );
    });

    it('should have right minimum stake to create data', async function() {
      (await this.brandPointToken.minStakeBalance()).should.be.bignumber.equal(
        MINIMUM_STAKE
      );
    });
  });

  describe('Global Variable', function() {
    describe('#setMinStakeBalance()', function() {
      const newMinStakeBalance = 4000;
      it('should disallow anyone to change minStakeBalance', async function() {
        await this.brandPointToken.setMinStakeBalance(newMinStakeBalance, {
          from: anyone
        }).should.be.rejected;
      });

      it('should change minStakeBalance', async function() {
        await this.brandPointToken.setMinStakeBalance(newMinStakeBalance).should
          .be.fulfilled;
        (await this.brandPointToken.minStakeBalance()).should.be.bignumber.equal(
          newMinStakeBalance
        );
      });
    });
  });

  describe('Creating New BrandToken', function() {
    const _signedBalance = '0x123123'; // bytes
    const _signedSalt = '0x12412134'; // bytes
    const _storeSignedKey = '0x1354634542'; // bytes
    const _userSignedKey = '0x98698631'; // bytes
    const _timestamp = 1513123124; // uint
    const _btKey =
      '0x3121231235000000000000000000000000000000000000000000000000000000'; // bytes32

    const DEPOSIT_AMOUNT = 150;

    describe('#upsertBalance()', function() {
      beforeEach(async function() {
        await this.carryToken.approve(this.tokenStake.address, DEPOSIT_AMOUNT, {
          from: owner
        }).should.be.fulfilled;
        await this.tokenStake.depositStake(deviceManager1, DEPOSIT_AMOUNT, {
          from: owner
        }).should.be.fulfilled;
      });

      it('should disallow anyone to create data', async function() {
        await this.brandPointToken.upsertBalance(
          _signedBalance,
          _signedSalt,
          _storeSignedKey,
          _userSignedKey,
          _timestamp,
          _btKey,
          userAddress,
          { from: anyone }
        ).should.be.rejected;
        await this.brandPointToken.upsertBalance(
          _signedBalance,
          _signedSalt,
          _storeSignedKey,
          _userSignedKey,
          _timestamp,
          _btKey,
          userAddress,
          { from: owner }
        ).should.be.rejected;
      });

      it('should disallow to create data if manager has not enough stake', async function() {
        await this.tokenStake.withdrawStake(
          deviceManager1,
          DEPOSIT_AMOUNT - MINIMUM_STAKE + 1,
          { from: deviceManager1 }
        ).should.be.fulfilled;
        await this.brandPointToken.upsertBalance(
          _signedBalance,
          _signedSalt,
          _storeSignedKey,
          _userSignedKey,
          _timestamp,
          _btKey,
          userAddress,
          { from: deviceManager1 }
        ).should.be.rejected;
      });

      it('should create data', async function() {
        // action
        await this.brandPointToken.upsertBalance(
          _signedBalance,
          _signedSalt,
          _storeSignedKey,
          _userSignedKey,
          _timestamp,
          _btKey,
          userAddress,
          { from: deviceManager1 }
        ).should.be.fulfilled;

        // post-condition
        (await this.brandPointToken.signedBalances(
          _btKey,
          userAddress
        )).should.be.equal(_signedBalance);
        (await this.brandPointToken.signedSalts(
          _btKey,
          userAddress
        )).should.be.equal(_signedSalt);
        (await this.brandPointToken.storeSignedKeys(
          _btKey,
          userAddress
        )).should.be.equal(_storeSignedKey);
        (await this.brandPointToken.userSignedKeys(
          _btKey,
          userAddress
        )).should.be.equal(_userSignedKey);
        (await this.brandPointToken.timestamps(
          _btKey,
          userAddress
        )).should.be.bignumber.equal(_timestamp);
        (await this.brandPointToken.creators(_btKey)).should.be.equal(
          deviceManager1
        );

        (await this.brandPointToken.btKeys(userAddress, 0)).should.be.equal(
          _btKey
        );
        const btKeys = await this.brandPointToken.getAllBTKeys(userAddress);
        btKeys.should.have.lengthOf(1);
        btKeys[0].should.be.equal(_btKey);
      });

      it("should disallow to update other device manager's brand token data", async function() {
        // pre-condition
        await this.brandPointToken.upsertBalance(
          _signedBalance,
          _signedSalt,
          _storeSignedKey,
          _userSignedKey,
          _timestamp,
          _btKey,
          userAddress,
          { from: deviceManager1 }
        ).should.be.fulfilled;

        // action
        await this.brandPointToken.upsertBalance(
          _signedBalance,
          _signedSalt,
          _storeSignedKey,
          _userSignedKey,
          _timestamp,
          _btKey,
          userAddress,
          { from: deviceManager2 }
        ).should.be.rejected;
      });

      it("should update user's token data", async function() {
        // pre-condition
        await this.brandPointToken.upsertBalance(
          _signedBalance,
          _signedSalt,
          _storeSignedKey,
          _userSignedKey,
          _timestamp,
          _btKey,
          userAddress,
          { from: deviceManager1 }
        ).should.be.fulfilled;

        const newSignedBalance = '0x87663912';
        // action
        await this.brandPointToken.upsertBalance(
          newSignedBalance,
          _signedSalt,
          _storeSignedKey,
          _userSignedKey,
          _timestamp,
          _btKey,
          userAddress,
          { from: deviceManager1 }
        ).should.be.fulfilled;

        // post-condition
        (await this.brandPointToken.signedBalances(
          _btKey,
          userAddress
        )).should.be.equal(newSignedBalance);
        (await this.brandPointToken.signedSalts(
          _btKey,
          userAddress
        )).should.be.equal(_signedSalt);
        (await this.brandPointToken.storeSignedKeys(
          _btKey,
          userAddress
        )).should.be.equal(_storeSignedKey);
        (await this.brandPointToken.userSignedKeys(
          _btKey,
          userAddress
        )).should.be.equal(_userSignedKey);
        (await this.brandPointToken.timestamps(
          _btKey,
          userAddress
        )).should.be.bignumber.equal(_timestamp);
        (await this.brandPointToken.creators(_btKey)).should.be.equal(
          deviceManager1
        );

        (await this.brandPointToken.btKeys(userAddress, 0)).should.be.equal(
          _btKey
        );
        const btKeys = await this.brandPointToken.getAllBTKeys(userAddress);
        btKeys.should.have.lengthOf(1);
        btKeys[0].should.be.equal(_btKey);
      });
    });
  });
});
