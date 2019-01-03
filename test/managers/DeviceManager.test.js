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

  describe('admins()', function() {
    it('admin 여부를 판단하는데 성공합니다.', async function() {
      (await this.deviceManager.admins(owner)).should.be.equal(true);
      (await this.deviceManager.admins(anyone)).should.be.equal(false);
    });
  });

  describe('adminNumber()', function() {
    it('올바른 admin의 수를 가져오는데 성공합니다.', async function() {
      (await this.deviceManager.adminNumber()).should.be.bignumber.equal(1);
    });
  });

  describe('carryToken()', function() {
    it('올바른 carry token의 주소를 가져오는데 성공합니다.', async function() {
      (await this.deviceManager.carryToken()).should.be.equal(
        this.carryToken.address
      );
    });
  });

  describe('tokenStake()', function() {
    it('올바른 tokenStake의 주소를 가져오는데 성공합니다.', async function() {
      (await this.deviceManager.tokenStake()).should.be.equal(
        this.tokenStake.address
      );
    });
  });

  describe('registerStoreDataStorage()', function() {
    it('허가되지 않은 주소가 등록을 시도할 경우 실패합니다.', async function() {
      await this.deviceManager.registerStoreDataStorage(
        this.storeDataStorage.address,
        { from: anyone }
      ).should.be.rejected;
    });

    it('StoreDataStorage 주소 등록을 성공합니다.', async function() {
      // pre-condition
      (await this.deviceManager.storeDataStorage()).should.be.equal(
        ZERO_ADDRESS
      );

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
  });

  describe('storeDataStorage()', function() {
    it('올바른 StoreDataStorage 주소를 가져오는데 성공합니다.', async function() {
      await this.deviceManager.registerStoreDataStorage(
        this.storeDataStorage.address,
        { from: owner }
      ).should.be.fulfilled;

      (await this.deviceManager.storeDataStorage()).should.be.equal(
        this.storeDataStorage.address
      );
    });
  });

  describe('registerBrandPointToken()', function() {
    it('허가되지 않은 주소가 등록을 시도할 경우 실패합니다.', async function() {
      await this.deviceManager.registerBrandPointToken(
        this.brandPointToken.address,
        {
          from: anyone
        }
      ).should.be.rejected;
    });

    it('BrandPointToken 주소 등록을 성공합니다.', async function() {
      // pre-condition
      (await this.deviceManager.brandPointToken()).should.be.equal(
        ZERO_ADDRESS
      );

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
  });

  describe('brandPointToken()', function() {
    it('올바른 BrandPointToken 주소를 가져오는데 성공합니다.', async function() {
      await this.deviceManager.registerBrandPointToken(
        this.brandPointToken.address,
        {
          from: owner
        }
      ).should.be.fulfilled;

      (await this.deviceManager.brandPointToken()).should.be.equal(
        this.brandPointToken.address
      );
    });
  });

  describe('initialize()', function() {
    it('허가되지 않은 주소가 초기화를 시도할 경우 실패합니다.', async function() {
      await this.deviceManager.initialize(
        this.storeDataStorage.address,
        this.brandPointToken.address,
        { from: anyone }
      ).should.be.rejected;
    });

    it('초기화를 성공합니다.', async function() {
      // pre-condition
      (await this.deviceManager.storeDataStorage()).should.be.equal(
        ZERO_ADDRESS
      );
      (await this.deviceManager.brandPointToken()).should.be.equal(
        ZERO_ADDRESS
      );

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

  describe('upsertStoreData()', function() {
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

    it('허가되지 않은 주소일 경우 실패합니다.', async function() {
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

    it('잘못된 비밀 키가 서명에 사용된 경우 실패합니다.', async function() {
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

    it('잘못된 서명자 주소를 받았을 경우 실패합니다.', async function() {
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

    it('서명 내용과 다른 정보를 받았을 경우 실패합니다.', async function() {
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

    it('상점 정보 등록을 성공합니다.', async function() {
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

  describe('upsertBalance()', function() {
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

    it('허가되지 않은 주소일 경우 실패합니다.', async function() {
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

    it('예치된 Device manager의 담보에 따라 허가된 발행 횟수보다 많이 발행하는 경우 담보금을 차감합니다.', async function() {
      // TODO: check after merging with Brand Point Token implementation
      // pre-condition
      const initialStake = (await this.tokenStake.stake(
        this.deviceManager.address
      )).toNumber();

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
      ).should.be.fulfilled; // TODO: repeat calling this function

      // post-condition
      (
        (await this.tokenStake.stake(this.deviceManager.address)).toNumber() <
        initialStake
      ).should.be.equal(true);
    });

    it('차감될 담보금이 부족할 경우 Brand Point Token 발행을 실패합니다.', async function() {
      // TODO: check after merging with Brand Point Token implementation
      await this.deviceManager.withdrawAllStake(owner).should.be.fulfilled;

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

    it('잘못된 비밀 키가 서명에 사용된 경우 실패합니다.', async function() {
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

    it('잘못된 서명자 주소를 받았을 경우 실패합니다.', async function() {
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

    it('서명 내용과 다른 정보를 받았을 경우 실패합니다.', async function() {
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

    it('Brand Point Token 발행을 성공합니다.', async function() {
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
