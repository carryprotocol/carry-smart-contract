import createSignature, { encodePacked } from './utils/createSignature';

const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const DeviceManager = artifacts.require('DeviceManager');
const BrandToken = artifacts.require('BrandToken');
const StoreDataStorage = artifacts.require('StoreDataStorage');

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

contract('DeviceManager', accounts => {
  const [owner, admin, storeAddress, userAddress, anyone] = accounts;
  const STORE_PRIVATE_KEY =
    '0xb178cf12d4126ea1db48ca32e3ce6743580ca6646391996032fc76652d699974';

  beforeEach(async function() {
    this.deviceManager = await DeviceManager.new([owner], { from: owner });
    this.brandToken = await BrandToken.new([this.deviceManager.address], {
      from: owner
    });
    this.storeDataStorage = await StoreDataStorage.new(
      [this.deviceManager.address],
      { from: owner }
    );
  });

  describe('Ownership', function() {
    it('should have right initial admin', async function() {
      (await this.deviceManager.admins(owner)).should.be.equal(true);
      (await this.deviceManager.admins(anyone)).should.be.equal(false);

      (await this.deviceManager.adminNumber()).should.be.bignumber.equal(1);
    });

    describe('#registerAdmin()', function() {
      it('should disallow anyone to register new admin', async function() {
        await this.deviceManager.registerAdmin(admin, { from: anyone }).should
          .be.rejected;
      });

      it('should disallow to register duplicated admin', async function() {
        await this.deviceManager.registerAdmin(owner, { from: owner }).should.be
          .rejected;
      });

      it('should register new admin', async function() {
        // pre-condition
        (await this.deviceManager.admins(admin)).should.be.equal(false);

        // action
        await this.deviceManager.registerAdmin(admin, { from: owner }).should.be
          .fulfilled;

        // post-condition
        (await this.deviceManager.admins(admin)).should.be.equal(true);
        (await this.deviceManager.adminNumber()).should.be.bignumber.equal(2);
      });
    });

    describe('#removeAdmin()', function() {
      beforeEach(async function() {
        await this.deviceManager.registerAdmin(admin, {
          from: owner
        }).should.be.fulfilled;
      });

      it('should disallow anyone to remove admin', async function() {
        await this.deviceManager.removeAdmin(admin, { from: anyone }).should.be
          .rejected;
      });

      it('should disallow to remove nonexistent admin', async function() {
        await this.deviceManager.removeAdmin(anyone, { from: owner }).should.be
          .rejected;
      });

      it('should disallow all admins', async function() {
        // pre-condition
        await this.deviceManager.removeAdmin(admin, { from: owner }).should.be
          .fulfilled;
        (await this.deviceManager.adminNumber()).should.be.bignumber.equal(1);

        // action
        await this.deviceManager.removeAdmin(owner, { from: owner }).should.be
          .rejected;
      });

      it('should remove admin', async function() {
        // pre-condition
        (await this.deviceManager.admins(admin)).should.be.equal(true);
        (await this.deviceManager.adminNumber()).should.be.bignumber.equal(2);

        // action
        await this.deviceManager.removeAdmin(admin, { from: owner }).should.be
          .fulfilled;

        // post-condition
        (await this.deviceManager.admins(admin)).should.be.equal(false);
        (await this.deviceManager.adminNumber()).should.be.bignumber.equal(1);
      });
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
      (await this.deviceManager.brandToken()).should.be.equal(ZERO_ADDRESS);
      await this.deviceManager.registerBrandToken(this.brandToken.address, {
        from: anyone
      }).should.be.rejected;

      // action
      await this.deviceManager.registerBrandToken(this.brandToken.address, {
        from: owner
      }).should.be.fulfilled;

      // post-condition
      (await this.deviceManager.brandToken()).should.be.equal(
        this.brandToken.address
      );
    });
  });

  describe('StoreDataStorage', function() {
    beforeEach(async function() {
      await this.deviceManager.registerStoreDataStorage(
        this.storeDataStorage.address,
        { from: owner }
      ).should.be.fulfilled;
    });
  });

  describe('BrandToken', function() {
    describe('#upsertBalance()', function() {
      const _signedBalance = '0x123123'; // bytes
      const _signedSalt = '0x12412134'; // bytes
      const _storeSignedSymKey = '0x1354634542'; // bytes
      const _userSignedSymKey = '0x98698631'; // bytes
      const _timestamp = 1513123124; // uint
      const _btKey =
        '0x3121231235000000000000000000000000000000000000000000000000000000'; // bytes32

      const wrongKey =
        '0xb178cf12d4126ea1db48ca32e3ce6743580ca6646391996032fc76652d699935';
      const dummyBytes = '0x8488484';

      beforeEach(async function() {
        await this.deviceManager.registerBrandToken(this.brandToken.address, {
          from: owner
        }).should.be.fulfilled;
      });

      it('should reject wrong admin', async function() {
        const message = encodePacked(
          _signedBalance,
          _signedSalt,
          _storeSignedSymKey,
          _userSignedSymKey,
          _timestamp,
          _btKey,
          userAddress
        );
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

      it('should reject wrong signature', async function() {
        const message = encodePacked(
          _signedBalance,
          _signedSalt,
          _storeSignedSymKey,
          _userSignedSymKey,
          _timestamp,
          _btKey,
          userAddress
        );
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
        const message = encodePacked(
          _signedBalance,
          _signedSalt,
          _storeSignedSymKey,
          _userSignedSymKey,
          _timestamp,
          _btKey,
          userAddress
        );
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
        const message = encodePacked(
          _signedBalance,
          _signedSalt,
          _storeSignedSymKey,
          _userSignedSymKey,
          _timestamp,
          _btKey,
          userAddress
        );
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
        const message = encodePacked(
          _signedBalance,
          _signedSalt,
          _storeSignedSymKey,
          _userSignedSymKey,
          _timestamp,
          _btKey,
          userAddress
        );
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
        )).should.be.equal(_storeSignedSymKey);
        (await this.brandToken.userSignedKeys(
          _btKey,
          userAddress
        )).should.be.equal(_userSignedSymKey);
        (await this.brandToken.timestamps(
          _btKey,
          userAddress
        )).should.be.bignumber.equal(_timestamp);
        (await this.brandToken.creators(_btKey)).should.be.equal(
          this.deviceManager.address
        );

        (await this.brandToken.btKeys(userAddress, 0)).should.be.equal(_btKey);
        const btKeys = await this.brandToken.getAllBTKeys(userAddress);
        btKeys.should.have.lengthOf(1);
        btKeys[0].should.be.equal(_btKey);
      });
    });
  });
});
