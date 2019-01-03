import createSignature, { encodePacked } from '../utils/createSignature';

const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const AppManager = artifacts.require('AppManager');
const CarryToken = artifacts.require('CarryToken');
const TokenStake = artifacts.require('TokenStake');
const PurchaseDataStorage = artifacts.require('PurchaseDataStorage');
const UserDataStorage = artifacts.require('UserDataStorage');

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

contract('AppManager', accounts => {
  const [owner, storeAddress, userAddress, anyone] = accounts;
  const USER_PRIVATE_KEY =
    '0xb178cf12d4126ea1db48ca32e3ce6743580ca6646391996032fc76652d699974';

  beforeEach(async function() {
    this.carryToken = await CarryToken.new({ from: owner });
    await this.carryToken.mint(owner, 10000000000, { from: owner });
    this.tokenStake = await TokenStake.new(this.carryToken.address, {
      from: owner
    });

    this.appManager = await AppManager.new(
      [owner],
      this.tokenStake.address,
      this.carryToken.address,
      { from: owner }
    );
    this.purchaseDataStorage = await PurchaseDataStorage.new(
      [this.appManager.address],
      this.carryToken.address,
      { from: owner }
    );
    this.userDataStorage = await UserDataStorage.new(
      [this.appManager.address],
      { from: owner }
    );

    await this.carryToken.transferOwnership(this.purchaseDataStorage.address, {
      from: owner
    }); //TODO 나중에 ownership모델 바뀌면 수정해야함.
  });

  describe('purchaseDataStorage()', function() {
    it('올바른 PurchaseDataStorage 주소를 가져오는데 성공합니다.', async function() {
      await this.appManager.registerPurchaseDataStorage(
        this.purchaseDataStorage.address,
        { from: owner }
      ).should.be.fulfilled;

      (await this.appManager.purchaseDataStorage()).should.be.equal(
        this.purchaseDataStorage.address
      );
    });
  });

  describe('userDataStorage()', function() {
    it('올바른 UserDataStorage 주소를 가져오는데 성공합니다', async function() {
      await this.appManager.registerUserDataStorage(
        this.userDataStorage.address,
        {
          from: owner
        }
      ).should.be.fulfilled;

      (await this.appManager.userDataStorage()).should.be.equal(
        this.userDataStorage.address
      );
    });
  });

  describe('initialize()', function() {
    it('허가되지 않은 주소가 초기화를 시도할 경우 실패합니다.', async function() {
      await this.appManager.initialize(
        this.purchaseDataStorage.address,
        this.userDataStorage.address,
        { from: anyone }
      ).should.be.rejected;
    });

    it('초기화를 성공합니다.', async function() {
      // pre-condition
      (await this.appManager.purchaseDataStorage()).should.be.equal(
        ZERO_ADDRESS
      );
      (await this.appManager.userDataStorage()).should.be.equal(ZERO_ADDRESS);

      // action
      await this.appManager.initialize(
        this.purchaseDataStorage.address,
        this.userDataStorage.address,
        { from: owner }
      ).should.be.fulfilled;

      // post-condition
      (await this.appManager.purchaseDataStorage()).should.be.equal(
        this.purchaseDataStorage.address
      );
      (await this.appManager.userDataStorage()).should.be.equal(
        this.userDataStorage.address
      );
    });
  });

  describe('registerPurchaseDataStorage()', function() {
    it('_purchaseDataStorage가 ZERO ADDRESS이면 실패합니다.', async function() {
      await this.appManager.registerPurchaseDataStorage(ZERO_ADDRESS).should.be
        .rejected;
    });

    it('admin이 아니면 실패합니다.', async function() {
      await this.appManager.registerPurchaseDataStorage(
        this.purchaseDataStorage.address,
        { from: anyone }
      ).should.be.rejected;
    });

    it('registerPurchaseDataStorage를 성공합니다', async function() {
      await this.appManager.registerPurchaseDataStorage(
        this.purchaseDataStorage.address,
        { from: owner }
      ).should.be.fulfilled;
    });
  });

  describe('registerUserDataStorage()', function() {
    it('_userDataStorage가 ZERO ADDRESS이면 실패합니다.', async function() {
      await this.appManager.registerUserDataStorage(ZERO_ADDRESS, {
        from: owner
      }).should.be.rejected;
    });

    it('admin이 아니면 실패합니다.', async function() {
      await this.appManager.registerUserDataStorage(
        this.userDataStorage.address,
        { from: anyone }
      ).should.be.rejected;
    });

    it('registerUserDataStorage를 성공합니다', async function() {
      await this.appManager.registerUserDataStorage(
        this.userDataStorage.address,
        { from: owner }
      ).should.be.fulfilled;
    });
  });

  describe('upsertPurchaseData()', function() {
    const purchaseId = 987654321;
    const userId = 9837243;
    const paymentMethod = 'Cash';
    const createdAt = 1543581053;
    const storeLatitude = 37000000; // 소수점 6째 자리까지 (소수점은 모두 blur 처리)
    const storeLongitude = 127000000;
    const items = '0x9fe687dafe68afe6';
    const message = encodePacked(
      purchaseId,
      userId,
      paymentMethod,
      createdAt,
      storeLatitude,
      storeLongitude,
      items
    );

    const wrongKey =
      '0xb178cf12d4126ea1db48ca32e3ce6743580ca6646391996032fc76652d699935';

    beforeEach(async function() {
      await this.appManager.registerPurchaseDataStorage(
        this.purchaseDataStorage.address,
        {
          from: owner
        }
      ).should.be.fulfilled;
    });

    it('user 서명이 올바르지 않으면 실패합니다.', async function() {
      await this.appManager.upsertPurchaseData(
        purchaseId,
        userId,
        paymentMethod,
        createdAt,
        storeLatitude,
        storeLongitude,
        items,
        userAddress,
        createSignature(message, wrongKey),
        { from: owner }
      ).should.be.rejected;
    });

    it('서명상 주소와 입력받은 주소가 다르면 실패합니다.', async function() {
      await this.appManager.upsertPurchaseData(
        purchaseId,
        userId,
        paymentMethod,
        createdAt,
        storeLatitude,
        storeLongitude,
        items,
        storeAddress,
        createSignature(message, USER_PRIVATE_KEY),
        { from: owner }
      ).should.be.rejected;
    });

    it('owner가 아니면 실패합니다.', async function() {
      await this.appManager.upsertPurchaseData(
        purchaseId,
        userId,
        paymentMethod,
        createdAt,
        storeLatitude,
        storeLongitude,
        items,
        userAddress,
        createSignature(message, USER_PRIVATE_KEY),
        { from: anyone }
      ).should.be.rejected;
    });

    it('upsertPurchaseData를 성공합니다', async function() {
      await this.appManager.upsertPurchaseData(
        purchaseId,
        userId,
        paymentMethod,
        createdAt,
        storeLatitude,
        storeLongitude,
        items,
        userAddress,
        createSignature(message, USER_PRIVATE_KEY),
        { from: owner }
      ).should.be.fulfilled;

      //post condition
      (await this.carryToken.balanceOf(userAddress)).should.be.bignumber.equal(
        5
      ); //TODO: cre 보상 로직 구현하면, 테스트케이스 변경해야함.
    });
  });

  describe('upsertUserData()', function() {
    const userId = 987654321;
    const userGender = 'M';
    const userBirthYear = 1514764800; // 2018
    const userBirthMonth = 1543536000; // 2018.12
    const userBirthDay = 1545350400; // 2018.12.21
    const userCountry = 'Korea';
    const userJob = 'Developer';
    const message = encodePacked(
      userId,
      userGender,
      userBirthYear,
      userBirthMonth,
      userBirthDay,
      userCountry,
      userJob
    );

    const wrongKey =
      '0xb178cf12d4126ea1db48ca32e3ce6743580ca6646391996032fc76652d699935';
    beforeEach(async function() {
      await this.appManager.registerUserDataStorage(
        this.userDataStorage.address,
        { from: owner }
      ).should.be.fulfilled;
    });

    it('user 서명이 올바르지 않으면 실패합니다.', async function() {
      await this.appManager.upsertUserData(
        userId,
        userGender,
        userBirthYear,
        userBirthMonth,
        userBirthDay,
        userCountry,
        userJob,
        userAddress,
        createSignature(message, wrongKey),
        { from: owner }
      ).should.be.rejected;
    });

    it('서명상 주소와 입력받은 주소가 다르면 실패합니다.', async function() {
      await this.appManager.upsertUserData(
        userId,
        userGender,
        userBirthYear,
        userBirthMonth,
        userBirthDay,
        userCountry,
        userJob,
        storeAddress,
        createSignature(message, USER_PRIVATE_KEY),
        { from: owner }
      ).should.be.rejected;
    });

    it('owner가 아니면 실패합니다.', async function() {
      await this.appManager.upsertUserData(
        userId,
        userGender,
        userBirthYear,
        userBirthMonth,
        userBirthDay,
        userCountry,
        userJob,
        userAddress,
        createSignature(message, USER_PRIVATE_KEY),
        { from: anyone }
      ).should.be.rejected;
    });

    it('upsertUserData를 성공합니다', async function() {
      await this.appManager.upsertUserData(
        userId,
        userGender,
        userBirthYear,
        userBirthMonth,
        userBirthDay,
        userCountry,
        userJob,
        userAddress,
        createSignature(message, USER_PRIVATE_KEY),
        { from: owner }
      ).should.be.fulfilled;

      //post condition
      (await this.userDataStorage.userAddresses(userId)).should.be.equal(
        userAddress
      );
      (await this.userDataStorage.userGenders(userId)).should.be.equal(
        userGender
      );
      (await this.userDataStorage.userBirthYears(
        userId
      )).should.be.bignumber.equal(userBirthYear);
      (await this.userDataStorage.userBirthMonths(
        userId
      )).should.be.bignumber.equal(userBirthMonth);
      (await this.userDataStorage.userBirthDays(
        userId
      )).should.be.bignumber.equal(userBirthDay);
      (await this.userDataStorage.userCountries(userId)).should.be.equal(
        userCountry
      );
      (await this.userDataStorage.userJobs(userId)).should.be.equal(userJob);
    });
  });
});
