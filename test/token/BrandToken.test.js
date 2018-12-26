const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const BrandToken = artifacts.require('BrandToken');

contract('BrandToken', accounts => {
  const [owner, deviceManager1, deviceManager2, userAddress, anyone] = accounts;

  beforeEach(async function() {
    this.brandToken = await BrandToken.new([deviceManager1, deviceManager2], {
      from: owner
    });
  });

  it('should have right owner', async function() {
    (await this.brandToken.owner()).should.be.equal(owner);
  });

  it('should register initial device manager addresses', async function() {
    (await this.brandToken.managerAddresses(deviceManager1)).should.be.equal(
      true
    );
    (await this.brandToken.managerAddresses(deviceManager2)).should.be.equal(
      true
    );
  });

  describe('Creating New BrandToken', function() {
    const _signedBalance = '0x123123'; // bytes
    const _signedSalt = '0x12412134'; // bytes
    const _storeSignedKey = '0x1354634542'; // bytes
    const _userSignedKey = '0x98698631'; // bytes
    const _timestamp = 1513123124; // uint
    const _btKey =
      '0x3121231235000000000000000000000000000000000000000000000000000000'; // bytes32

    describe('#upsertBalance()', function() {
      it('should disallow anyone to create data', async function() {
        await this.brandToken.upsertBalance(
          _signedBalance,
          _signedSalt,
          _storeSignedKey,
          _userSignedKey,
          _timestamp,
          _btKey,
          userAddress,
          { from: anyone }
        ).should.be.rejected;
        await this.brandToken.upsertBalance(
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

      it('should create data', async function() {
        // action
        await this.brandToken.upsertBalance(
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
        (await this.brandToken.signedBalances(
          _btKey,
          userAddress
        )).should.be.equal(_signedBalance);
        (await this.brandToken.signedSalts(
          _btKey,
          userAddress
        )).should.be.equal(_signedSalt);
        (await this.brandToken.storeSignedKeys(
          _btKey,
          userAddress
        )).should.be.equal(_storeSignedKey);
        (await this.brandToken.userSignedKeys(
          _btKey,
          userAddress
        )).should.be.equal(_userSignedKey);
        (await this.brandToken.timestamps(
          _btKey,
          userAddress
        )).should.be.bignumber.equal(_timestamp);
        (await this.brandToken.creators(_btKey)).should.be.equal(
          deviceManager1
        );

        (await this.brandToken.btKeys(userAddress, 0)).should.be.equal(_btKey);
        const btKeys = await this.brandToken.getAllBTKeys(userAddress);
        btKeys.should.have.lengthOf(1);
        btKeys[0].should.be.equal(_btKey);
      });

      it("should disallow to update other device manager's brand token data", async function() {
        // pre-condition
        await this.brandToken.upsertBalance(
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
        await this.brandToken.upsertBalance(
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
        await this.brandToken.upsertBalance(
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
        await this.brandToken.upsertBalance(
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
        (await this.brandToken.signedBalances(
          _btKey,
          userAddress
        )).should.be.equal(newSignedBalance);
        (await this.brandToken.signedSalts(
          _btKey,
          userAddress
        )).should.be.equal(_signedSalt);
        (await this.brandToken.storeSignedKeys(
          _btKey,
          userAddress
        )).should.be.equal(_storeSignedKey);
        (await this.brandToken.userSignedKeys(
          _btKey,
          userAddress
        )).should.be.equal(_userSignedKey);
        (await this.brandToken.timestamps(
          _btKey,
          userAddress
        )).should.be.bignumber.equal(_timestamp);
        (await this.brandToken.creators(_btKey)).should.be.equal(
          deviceManager1
        );

        (await this.brandToken.btKeys(userAddress, 0)).should.be.equal(_btKey);
        const btKeys = await this.brandToken.getAllBTKeys(userAddress);
        btKeys.should.have.lengthOf(1);
        btKeys[0].should.be.equal(_btKey);
      });
    });
  });
});
