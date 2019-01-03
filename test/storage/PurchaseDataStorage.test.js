const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const PurchaseDataStorage = artifacts.require('PurchaseDataStorage');
const carryToken = artifacts.require('CarryToken');
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

contract('PurchaseDataStorage', function(accounts) {
  const [owner, appManager1, appManager2, userAddress, anyone] = accounts;

  beforeEach(async function() {
    this.carryToken = await carryToken.new({ from: owner });
    this.purchaseDataStorage = await PurchaseDataStorage.new(
      [appManager1, appManager2],
      this.carryToken.address,
      {
        from: owner
      }
    );
    await this.carryToken.transferOwnership(this.purchaseDataStorage.address, {
      from: owner
    }); // carryToken의 ownership모델이 바뀌면 수정해야함.
  });

  describe('upsertData()', async function() {
    const purchaseId = 987654321;
    const userId = 9837243;
    const paymentMethod = 'Cash';
    const createdAt = 1543581053;
    const storeLatitude = 37000000; // 소수점 6째 자리까지 (소수점은 모두 blur 처리)
    const storeLongitude = 127000000;
    const items = '0x9fe687dafe68afe6';
    const sigHash = '0x123';

    it('_userAddress가 ZERO ADDRESS이면 실패합니다', async function() {
      await this.purchaseDataStorage.upsertData(
        purchaseId,
        userId,
        ZERO_ADDRESS,
        paymentMethod,
        createdAt,
        storeLatitude,
        storeLongitude,
        items,
        sigHash,
        { from: appManager1 }
      ).should.be.rejected;
    });

    it('nonce(signature)가 중복되면 실패합니다.', async function() {
      // action
      await this.purchaseDataStorage.upsertData(
        purchaseId,
        userId,
        userAddress,
        paymentMethod,
        createdAt,
        storeLatitude,
        storeLongitude,
        items,
        sigHash,
        { from: appManager1 }
      ).should.be.fulfilled;

      await this.purchaseDataStorage.upsertData(
        purchaseId,
        userId,
        userAddress,
        paymentMethod,
        createdAt,
        storeLatitude,
        storeLongitude,
        items,
        sigHash,
        { from: appManager1 }
      ).should.be.rejected;
    });

    it('manager 아니면 실패합니다.', async function() {
      await this.purchaseDataStorage.upsertData(
        purchaseId,
        userId,
        userAddress,
        paymentMethod,
        createdAt,
        storeLatitude,
        storeLongitude,
        items,
        sigHash,
        { from: anyone }
      ).should.be.rejected;
      await this.purchaseDataStorage.upsertData(
        purchaseId,
        userId,
        userAddress,
        paymentMethod,
        createdAt,
        storeLatitude,
        storeLongitude,
        items,
        sigHash,
        { from: owner }
      ).should.be.rejected;
    });

    // it('위도 경도값 format이 잘못되면 실패합니다.', async function() {
    //   // TODO: 위도 경도값에 대해 decimal이랑 이런거 정해야 할듯. 이거 범위 체크는 할지말지 논의해보자.
    // });

    it('upsertData를 성공합니다', async function() {
      // TODO:UserDataUpserted event 체크

      // action
      await this.purchaseDataStorage.upsertData(
        purchaseId,
        userId,
        userAddress,
        paymentMethod,
        createdAt,
        storeLatitude,
        storeLongitude,
        items,
        sigHash,
        { from: appManager1 }
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
      (await this.purchaseDataStorage.items(purchaseId)).should.be.equal(items);

      //TODO: 보상 제대로 갔는지 확인
      (await this.carryToken.balanceOf(userAddress)).should.be.bignumber.equal(
        5
      );
    });
  });

  describe('calculateCRE()', function() {
    const paymentMethod = 'Cash';
    const createdAt = 1543581053;
    const storeLatitude = 37000000; // 소수점 6째 자리까지 (소수점은 모두 blur 처리)
    const storeLongitude = 127000000;
    const items = '0x9fe687dafe68afe6';
    it('데이터 양에 따라 보상이 계산됩니다.', async function() {
      //1 (모두 다 적었을 때)
      (await this.purchaseDataStorage.calculateCRE(
        paymentMethod,
        createdAt,
        storeLatitude,
        storeLongitude,
        items
      )).should.be.bignumber.equal(5);
    });
  });
});
