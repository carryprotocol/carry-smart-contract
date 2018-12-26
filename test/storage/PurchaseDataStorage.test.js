const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const PurchaseDataStorage = artifacts.require('PurchaseDataStorage');

contract('PurchaseDataStorage', accounts => {
  const [owner, appManager1, appManager2, userAddress, anyone] = accounts;

  beforeEach(async function() {
    this.purchaseDataStorage = await PurchaseDataStorage.new(
      [appManager1, appManager2],
      {
        from: owner
      }
    );
  });

  it('should have right owner', async function() {
    (await this.purchaseDataStorage.owner()).should.be.equal(owner);
  });

  it('should register initial app manager addresses', async function() {
    (await this.purchaseDataStorage.managerAddresses(
      appManager1
    )).should.be.equal(true);
    (await this.purchaseDataStorage.managerAddresses(
      appManager2
    )).should.be.equal(true);
  });

  describe('Creating new purchase data', function() {
    const purchaseId = 987654321;
    const userId = 9837243;
    const paymentMethod = 'Cash';
    const createdAt = 1543581053;
    const storeLatitude = 37000000; // 소수점 6째 자리까지 (소수점은 모두 blur 처리)
    const storeLongitude = 127000000;
    const items = '0x9fe687dafe68afe6';

    describe('#upsertData()', function() {
      it('should disallow anyone to create data', async function() {
        await this.purchaseDataStorage.upsertData(
          purchaseId,
          userId,
          userAddress,
          paymentMethod,
          createdAt,
          storeLatitude,
          storeLongitude,
          items,
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
          { from: owner }
        ).should.be.rejected;
      });

      it('should create purchase data', async function() {
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
        (await this.purchaseDataStorage.items(purchaseId)).should.be.equal(
          items
        );
      });
    });
  });
});
