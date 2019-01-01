const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const UserDataStorage = artifacts.require('UserDataStorage');

contract('UserDataStorage', accounts => {
  const [owner, appManager1, appManager2, userAddress, anyone] = accounts;

  beforeEach(async function() {
    this.userDataStorage = await UserDataStorage.new(
      [appManager1, appManager2],
      {
        from: owner
      }
    );
  });

  describe('owner()', function() {
    it('올바른 owner 정보를 가져오는데 성공합니다.', async function() {
      (await this.userDataStorage.owner()).should.be.equal(owner);
    });
  });

  describe('managerAddresses()', function() {
    it('올바른 app manager address를 가져오는데 성공합니다.', async function() {
      (await this.userDataStorage.managerAddresses(
        appManager1
      )).should.be.equal(true);
      (await this.userDataStorage.managerAddresses(
        appManager2
      )).should.be.equal(true);
    });
  });

  describe('upsertData()', function() {
    const userId = 987654321;
    const userGender = 'M';
    const userBirthYear = 1514764800; // 2018
    const userBirthMonth = 1543536000; // 2018.12
    const userBirthDay = 1545350400; // 2018.12.21
    const userCountry = 'Korea';
    const userJob = 'Developer';

    it('데이터를 기록하려는 주소가 manager 이외의 주소이면 실패합니다.', async function() {
      await this.userDataStorage.upsertData(
        userId,
        userAddress,
        userGender,
        userBirthYear,
        userBirthMonth,
        userBirthDay,
        userCountry,
        userJob,
        { from: anyone }
      ).should.be.rejected;
      await this.userDataStorage.upsertData(
        userId,
        userAddress,
        userGender,
        userBirthYear,
        userBirthMonth,
        userBirthDay,
        userCountry,
        userJob,
        { from: owner }
      ).should.be.rejected;
    });

    it('데이터 기록을 성공합니다.', async function() {
      // action
      await this.userDataStorage.upsertData(
        userId,
        userAddress,
        userGender,
        userBirthYear,
        userBirthMonth,
        userBirthDay,
        userCountry,
        userJob,
        { from: appManager1 }
      ).should.be.fulfilled;

      // post-condition
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

    it('데이터 업데이트를 성공합니다.', async function() {
      // pre-condition
      await this.userDataStorage.upsertData(
        userId,
        userAddress,
        userGender,
        userBirthYear,
        userBirthMonth,
        userBirthDay,
        userCountry,
        userJob,
        { from: appManager1 }
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

      const newJob = 'Teacher';

      // action
      await this.userDataStorage.upsertData(
        userId,
        userAddress,
        userGender,
        userBirthYear,
        userBirthMonth,
        userBirthDay,
        userCountry,
        newJob,
        { from: appManager1 }
      ).should.be.fulfilled;

      // post-condition
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
      (await this.userDataStorage.userJobs(userId)).should.be.equal(newJob);
    });
  });
});
