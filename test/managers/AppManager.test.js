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
      { from: owner }
    );
    this.userDataStorage = await UserDataStorage.new(
      [this.appManager.address],
      { from: owner }
    );
  });

  describe('Initialize', function() {
    it('should have right initial admin', async function() {
      (await this.appManager.admins(owner)).should.be.equal(true);
      (await this.appManager.admins(anyone)).should.be.equal(false);

      (await this.appManager.adminNumber()).should.be.bignumber.equal(1);
    });

    it('should have right token contract address', async function() {
      (await this.appManager.carryToken()).should.be.equal(
        this.carryToken.address
      );
    });

    it('should have right token stake contract address', async function() {
      (await this.appManager.tokenStake()).should.be.equal(
        this.tokenStake.address
      );
    });

    it('should register address of PurchaseDataStorage', async function() {
      // pre-condition
      (await this.appManager.purchaseDataStorage()).should.be.equal(
        ZERO_ADDRESS
      );
      await this.appManager.registerPurchaseDataStorage(
        this.purchaseDataStorage.address,
        { from: anyone }
      ).should.be.rejected;

      // action
      await this.appManager.registerPurchaseDataStorage(
        this.purchaseDataStorage.address,
        { from: owner }
      ).should.be.fulfilled;

      // post-condition
      (await this.appManager.purchaseDataStorage()).should.be.equal(
        this.purchaseDataStorage.address
      );
    });

    it('should register address of UserDataStorage', async function() {
      // pre-condition
      (await this.appManager.userDataStorage()).should.be.equal(ZERO_ADDRESS);
      await this.appManager.registerUserDataStorage(
        this.userDataStorage.address,
        { from: anyone }
      ).should.be.rejected;

      // action
      await this.appManager.registerUserDataStorage(
        this.userDataStorage.address,
        { from: owner }
      ).should.be.fulfilled;

      // post-condition
      (await this.appManager.userDataStorage()).should.be.equal(
        this.userDataStorage.address
      );
    });

    it('should initialize properly', async function() {
      // pre-condition
      (await this.appManager.purchaseDataStorage()).should.be.equal(
        ZERO_ADDRESS
      );
      (await this.appManager.userDataStorage()).should.be.equal(ZERO_ADDRESS);
      await this.appManager.initialize(
        this.purchaseDataStorage.address,
        this.userDataStorage.address,
        { from: anyone }
      ).should.be.rejected;

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

  describe('UserDataStorage', function() {
    describe('#upsertUserData()', function() {
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

      it('should disallow anyone to register store data', async function() {
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

      it('should disallow to register store data with wrong signature', async function() {
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

      it('should disallow to register store data with wrong signer', async function() {
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

      it('should disallow to register store data with wrong origin data', async function() {
        await this.appManager.upsertUserData(
          userId,
          userGender,
          userBirthYear,
          userBirthMonth,
          userBirthDay,
          userCountry,
          '사기꾼',
          userAddress,
          createSignature(message, USER_PRIVATE_KEY),
          { from: owner }
        ).should.be.rejected;
      });

      it('should register store data', async function() {
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

  describe('PurchaseDataStorage', function() {
    describe('#upsertPurchaseData()', function() {
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

      const DEPOSIT_AMOUNT = 50;

      beforeEach(async function() {
        await this.appManager.registerPurchaseDataStorage(
          this.purchaseDataStorage.address,
          {
            from: owner
          }
        ).should.be.fulfilled;

        await this.carryToken.approve(this.tokenStake.address, DEPOSIT_AMOUNT, {
          from: owner
        }).should.be.fulfilled;
        await this.tokenStake.depositStake(
          this.appManager.address,
          DEPOSIT_AMOUNT,
          {
            from: owner
          }
        ).should.be.fulfilled;
      });

      it('should reject when stake is not enough', async function() {
        await this.appManager.withdrawAllStake(owner, { from: owner }).should.be
          .fulfilled;
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
        ).should.be.rejected;
      });

      it('should reject wrong admin', async function() {
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

      it('should reject wrong signature', async function() {
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

      it('should reject wrong signer', async function() {
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

      it('should reject wrong origin data', async function() {
        await this.appManager.upsertPurchaseData(
          purchaseId,
          userId,
          '가불',
          createdAt,
          storeLatitude,
          storeLongitude,
          items,
          userAddress,
          createSignature(message, USER_PRIVATE_KEY),
          { from: owner }
        ).should.be.rejected;
      });

      it('should upsert new balance of user', async function() {
        // pre-condition
        const initialUserBalance = await this.carryToken.balanceOf(userAddress);
        const initialManagerContractStake = await this.tokenStake.stake(
          this.appManager.address
        );
        const initialStakeContractBalance = await this.carryToken.balanceOf(
          this.tokenStake.address
        );

        const rewardAmount = await this.appManager.calculateCRE(
          purchaseId,
          userId,
          userAddress,
          paymentMethod,
          createdAt,
          storeLatitude,
          storeLongitude,
          items
        );

        // action
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

        // post-condition
        (await this.purchaseDataStorage.userIds(
          purchaseId
        )).should.be.bignumber.equal(userId);
        (await this.purchaseDataStorage.userAddresses(
          purchaseId
        )).should.be.equal(userAddress);
        (await this.purchaseDataStorage.paymentMethods(
          purchaseId
        )).should.be.equal(paymentMethod);
        (await this.purchaseDataStorage.createdAts(
          purchaseId
        )).should.be.bignumber.equal(createdAt);
        (await this.purchaseDataStorage.storeLatitudes(
          purchaseId
        )).should.be.bignumber.equal(storeLatitude);
        (await this.purchaseDataStorage.storeLongitudes(
          purchaseId
        )).should.be.bignumber.equal(storeLongitude);
        (await this.purchaseDataStorage.items(purchaseId)).should.be.equal(
          items
        );

        (await this.carryToken.balanceOf(
          userAddress
        )).should.be.bignumber.equal(initialUserBalance + rewardAmount);
        (await this.tokenStake.stake(
          this.appManager.address
        )).should.be.bignumber.equal(
          initialManagerContractStake - rewardAmount
        );
        (await this.carryToken.balanceOf(
          this.tokenStake.address
        )).should.be.bignumber.equal(
          initialStakeContractBalance - rewardAmount
        );
      });
    });
  });
});
