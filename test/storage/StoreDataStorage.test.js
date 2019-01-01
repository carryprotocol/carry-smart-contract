const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const StoreDataStorage = artifacts.require('StoreDataStorage');

contract('StoreDataStorage', accounts => {
  const [
    owner,
    deviceManager1,
    deviceManager2,
    storeAddress,
    anyone
  ] = accounts;

  beforeEach(async function() {
    this.storeDataStorage = await StoreDataStorage.new(
      [deviceManager1, deviceManager2],
      {
        from: owner
      }
    );
  });

  describe('owner()', function() {
    it('올바른 owner 정보를 가져오는데 성공합니다.', async function() {
      (await this.storeDataStorage.owner()).should.be.equal(owner);
    });
  });

  describe('managerAddresses()', function() {
    it('올바른 device manager address를 가져오는데 성공합니다.', async function() {
      (await this.storeDataStorage.managerAddresses(
        deviceManager1
      )).should.be.equal(true);
      (await this.storeDataStorage.managerAddresses(
        deviceManager2
      )).should.be.equal(true);
    });
  });

  describe('upsertData()', function() {
    const storeId = 987654321;
    const storeLatitude = 37000000; // 소수점 6째 자리까지 (소수점은 모두 blur 처리)
    const storeLongitude = 127000000;
    const storeCategory = '제과, 제빵, 보안';
    it('데이터를 기록하려는 주소가 manager 이외의 주소이면 실패합니다.', async function() {
      await this.storeDataStorage.upsertData(
        storeId,
        storeAddress,
        storeLatitude,
        storeLongitude,
        storeCategory,
        { from: anyone }
      ).should.be.rejected;
      await this.storeDataStorage.upsertData(
        storeId,
        storeAddress,
        storeLatitude,
        storeLongitude,
        storeCategory,
        { from: owner }
      ).should.be.rejected;
    });

    it('데이터 기록을 성공합니다.', async function() {
      // action
      await this.storeDataStorage.upsertData(
        storeId,
        storeAddress,
        storeLatitude,
        storeLongitude,
        storeCategory,
        { from: deviceManager1 }
      ).should.be.fulfilled;

      // post-condition
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

    it('데이터 업데이트를 성공합니다.', async function() {
      // pre-condition
      await this.storeDataStorage.upsertData(
        storeId,
        storeAddress,
        storeLatitude,
        storeLongitude,
        storeCategory,
        { from: deviceManager1 }
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

      const newCategory = '제과, 철물, 제빵';

      // action
      await this.storeDataStorage.upsertData(
        storeId,
        storeAddress,
        storeLatitude,
        storeLongitude,
        newCategory,
        { from: deviceManager1 }
      ).should.be.fulfilled;

      // post-condition
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
        newCategory
      );
    });
  });
});
