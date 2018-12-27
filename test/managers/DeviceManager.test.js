import createSignature, { encodePacked } from '../utils/createSignature';

const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const CarryToken = artifacts.require('CarryToken');
const TokenStake = artifacts.require('TokenStake');
const DeviceManager = artifacts.require('DeviceManager');
const BrandPointToken = artifacts.require('BrandPointToken');
const StoreDataStorage = artifacts.require('StoreDataStorage');

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

contract('DeviceManager', accounts => {
  const [owner, storeAddress, userAddress, anyone] = accounts;
  const STORE_PRIVATE_KEY =
    '0xb178cf12d4126ea1db48ca32e3ce6743580ca6646391996032fc76652d699973';

  beforeEach(async function() {
    this.carryToken = await CarryToken.new({ from: owner });
    await this.carryToken.mint(owner, 10000000000, { from: owner });
    this.tokenStake = await TokenStake.new(this.carryToken.address, {
      from: owner
    });

    this.deviceManager = await DeviceManager.new(
      [owner],
      this.tokenStake.address,
      this.carryToken.address,
      { from: owner }
    );

    this.brandPointToken = await BrandPointToken.new(
      [this.deviceManager.address],
      this.tokenStake.address,
      {
        from: owner
      }
    );
    this.storeDataStorage = await StoreDataStorage.new(
      [this.deviceManager.address],
      { from: owner }
    );
  });

  describe('Initialize', function() {
    it('should have right initial admin', async function() {
      (await this.deviceManager.admins(owner)).should.be.equal(true);
      (await this.deviceManager.admins(anyone)).should.be.equal(false);

      (await this.deviceManager.adminNumber()).should.be.bignumber.equal(1);
    });

    it('should have right token contract address', async function() {
      (await this.deviceManager.carryToken()).should.be.equal(
        this.carryToken.address
      );
    });

    it('should have right token stake contract address', async function() {
      (await this.deviceManager.tokenStake()).should.be.equal(
        this.tokenStake.address
      );
    });

    it('should register address of StoreDataStorage', async function() {
      // pre-condition
      (await this.deviceManager.storeDataStorage()).should.be.equal(
        ZERO_ADDRESS
      );
      await this.deviceManager.registerStoreDataStorage(
        this.storeDataStorage.address,
        { from: anyone }
      ).should.be.rejected;

      // action
      await this.deviceManager.registerStoreDataStorage(
        this.storeDataStorage.address,
        { from: owner }
      ).should.be.fulfilled;

      // post-condition
      (await this.deviceManager.storeDataStorage()).should.be.equal(
        this.storeDataStorage.address
      );
    });

    it('should register address of BrandToken', async function() {
      // pre-condition
      (await this.deviceManager.brandPointToken()).should.be.equal(
        ZERO_ADDRESS
      );
      await this.deviceManager.registerBrandPointToken(
        this.brandPointToken.address,
        {
          from: anyone
        }
      ).should.be.rejected;

      // action
      await this.deviceManager.registerBrandPointToken(
        this.brandPointToken.address,
        {
          from: owner
        }
      ).should.be.fulfilled;

      // post-condition
      (await this.deviceManager.brandPointToken()).should.be.equal(
        this.brandPointToken.address
      );
    });

    it('should initialize properly', async function() {
      // pre-condition
      (await this.deviceManager.storeDataStorage()).should.be.equal(
        ZERO_ADDRESS
      );
      (await this.deviceManager.brandPointToken()).should.be.equal(
        ZERO_ADDRESS
      );
      await this.deviceManager.initialize(
        this.storeDataStorage.address,
        this.brandPointToken.address,
        { from: anyone }
      ).should.be.rejected;

      // action
      await this.deviceManager.initialize(
        this.storeDataStorage.address,
        this.brandPointToken.address,
        { from: owner }
      ).should.be.fulfilled;

      // post-condition
      (await this.deviceManager.storeDataStorage()).should.be.equal(
        this.storeDataStorage.address
      );
      (await this.deviceManager.brandPointToken()).should.be.equal(
        this.brandPointToken.address
      );
    });
  });

  describe('StoreDataStorage', function() {
    describe('#upsertStoreData()', function() {
      const storeId = 987654321;
      const storeLatitude = 37000000; // 소수점 6째 자리까지 (소수점은 모두 blur 처리)
      const storeLongitude = 127000000;
      const storeCategory = '제과, 제빵, 보안';
      const message = encodePacked(
        storeId,
        storeLatitude,
        storeLongitude,
        storeCategory
      );

      const wrongKey =
        '0xb178cf12d4126ea1db48ca32e3ce6743580ca6646391996032fc76652d699935';

      beforeEach(async function() {
        await this.deviceManager.registerStoreDataStorage(
          this.storeDataStorage.address,
          { from: owner }
        ).should.be.fulfilled;
      });

      it('should disallow anyone to register store data', async function() {
        await this.deviceManager.upsertStoreData(
          storeId,
          storeLatitude,
          storeLongitude,
          storeCategory,
          storeAddress,
          createSignature(message, STORE_PRIVATE_KEY),
          { from: anyone }
        ).should.be.rejected;
      });

      it('should disallow to register store data with wrong signature', async function() {
        await this.deviceManager.upsertStoreData(
          storeId,
          storeLatitude,
          storeLongitude,
          storeCategory,
          storeAddress,
          createSignature(message, wrongKey),
          { from: owner }
        ).should.be.rejected;
      });

      it('should disallow to register store data with wrong signer', async function() {
        await this.deviceManager.upsertStoreData(
          storeId,
          storeLatitude,
          storeLongitude,
          storeCategory,
          userAddress,
          createSignature(message, STORE_PRIVATE_KEY),
          { from: owner }
        ).should.be.rejected;
      });

      it('should disallow to register store data with wrong origin data', async function() {
        await this.deviceManager.upsertStoreData(
          storeId,
          storeLatitude,
          storeLongitude,
          '코인, 토큰, 다단계',
          storeAddress,
          createSignature(message, STORE_PRIVATE_KEY),
          { from: owner }
        ).should.be.rejected;
      });

      it('should register store data', async function() {
        await this.deviceManager.upsertStoreData(
          storeId,
          storeLatitude,
          storeLongitude,
          storeCategory,
          storeAddress,
          createSignature(message, STORE_PRIVATE_KEY),
          { from: owner }
        ).should.be.fulfilled;

        (await this.storeDataStorage.storeAddresses(storeId)).should.be.equal(
          storeAddress
        );
        (await this.storeDataStorage.storeLatitudes(
          storeId
        )).should.be.bignumber.equal(storeLatitude);
        (await this.storeDataStorage.storeLongitudes(
          storeId
        )).should.be.bignumber.equal(storeLongitude);
        (await this.storeDataStorage.storeCategories(storeId)).should.be.equal(
          storeCategory
        );
      });
    });
  });

  describe('BrandPointToken', function() {
    describe('#upsertBalance()', function() {
      const _signedBalance = '0x123123'; // bytes
      const _signedSalt = '0x12412134'; // bytes
      const _storeSignedSymKey = '0x1354634542'; // bytes
      const _userSignedSymKey = '0x98698631'; // bytes
      const _timestamp = 1513123124; // uint
      const _btKey =
        '0x3121231235000000000000000000000000000000000000000000000000000000'; // bytes32
      const message = encodePacked(
        _signedBalance,
        _signedSalt,
        _storeSignedSymKey,
        _userSignedSymKey,
        _timestamp,
        _btKey,
        userAddress
      );

      const wrongKey =
        '0xb178cf12d4126ea1db48ca32e3ce6743580ca6646391996032fc76652d699935';
      const dummyBytes = '0x8488484';
      const DEPOSIT_AMOUNT = 150;

      beforeEach(async function() {
        await this.deviceManager.registerBrandPointToken(
          this.brandPointToken.address,
          {
            from: owner
          }
        ).should.be.fulfilled;
        await this.carryToken.approve(this.tokenStake.address, DEPOSIT_AMOUNT, {
          from: owner
        }).should.be.fulfilled;
        await this.tokenStake.depositStake(
          this.deviceManager.address,
          DEPOSIT_AMOUNT,
          {
            from: owner
          }
        ).should.be.fulfilled;
      });

      it('should reject wrong admin', async function() {
        await this.deviceManager.upsertBalance(
          _signedBalance,
          _signedSalt,
          _storeSignedSymKey,
          _userSignedSymKey,
          _timestamp,
          _btKey,
          userAddress,
          storeAddress,
          createSignature(message, STORE_PRIVATE_KEY),
          { from: anyone }
        ).should.be.rejected;
      });

      it('should reject if manager has not enough stake', async function() {
        await this.deviceManager.withdrawAllStake(owner, { from: owner }).should
          .be.fulfilled;
        await this.deviceManager.upsertBalance(
          _signedBalance,
          _signedSalt,
          _storeSignedSymKey,
          _userSignedSymKey,
          _timestamp,
          _btKey,
          userAddress,
          storeAddress,
          createSignature(message, STORE_PRIVATE_KEY),
          { from: owner }
        ).should.be.rejected;
      });

      it('should reject wrong signature', async function() {
        await this.deviceManager.upsertBalance(
          _signedBalance,
          _signedSalt,
          _storeSignedSymKey,
          _userSignedSymKey,
          _timestamp,
          _btKey,
          userAddress,
          storeAddress,
          createSignature(message, wrongKey),
          { from: owner }
        ).should.be.rejected;
      });

      it('should reject wrong signer', async function() {
        await this.deviceManager.upsertBalance(
          _signedBalance,
          _signedSalt,
          _storeSignedSymKey,
          _userSignedSymKey,
          _timestamp,
          _btKey,
          userAddress,
          anyone,
          createSignature(message, STORE_PRIVATE_KEY),
          { from: owner }
        ).should.be.rejected;
      });

      it('should reject wrong origin data', async function() {
        await this.deviceManager.upsertBalance(
          _signedBalance,
          dummyBytes,
          _storeSignedSymKey,
          _userSignedSymKey,
          _timestamp,
          _btKey,
          userAddress,
          storeAddress,
          createSignature(message, STORE_PRIVATE_KEY),
          { from: owner }
        ).should.be.rejected;
      });

      it('should upsert new balance of user', async function() {
        // action
        await this.deviceManager.upsertBalance(
          _signedBalance,
          _signedSalt,
          _storeSignedSymKey,
          _userSignedSymKey,
          _timestamp,
          _btKey,
          userAddress,
          storeAddress,
          createSignature(message, STORE_PRIVATE_KEY),
          { from: owner }
        ).should.be.fulfilled;

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
        )).should.be.equal(_storeSignedSymKey);
        (await this.brandPointToken.userSignedKeys(
          _btKey,
          userAddress
        )).should.be.equal(_userSignedSymKey);
        (await this.brandPointToken.timestamps(
          _btKey,
          userAddress
        )).should.be.bignumber.equal(_timestamp);
        (await this.brandPointToken.creators(_btKey)).should.be.equal(
          this.deviceManager.address
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
