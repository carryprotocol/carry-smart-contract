const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const ManagedStorage = artifacts.require('ManagedStorage');

contract('ManagedStorage', accounts => {
  const [owner, manager1, manager2, manager3, anyone] = accounts;

  beforeEach(async function() {
    this.managedStorage = await ManagedStorage.new([manager1, manager2], {
      from: owner
    });
  });

  describe('owner()', function() {
    it('올바른 owner 정보를 가져오는데 성공합니다.', async function() {
      (await this.managedStorage.owner()).should.be.equal(owner);
    });
  });

  describe('managerAddresses()', function() {
    it('올바른 device manager address를 가져오는데 성공합니다.', async function() {
      (await this.managedStorage.managerAddresses(manager1)).should.be.equal(
        true
      );
      (await this.managedStorage.managerAddresses(manager2)).should.be.equal(
        true
      );
    });
  });

  describe('addManager()', function() {
    it('허가되지 않은 주소일 경우 실패합니다.', async function() {
      await this.managedStorage.addManager(manager3, { from: anyone }).should.be
        .rejected;
      await this.managedStorage.addManager(manager3, {
        from: manager1
      }).should.be.rejected;
    });

    it('새로운 manager 주소 등록을 성공합니다.', async function() {
      // pre-condition
      (await this.managedStorage.managerAddresses(manager1)).should.be.equal(
        true
      );
      (await this.managedStorage.managerAddresses(manager2)).should.be.equal(
        true
      );
      (await this.managedStorage.managerAddresses(manager3)).should.be.equal(
        false
      );

      // action
      await this.managedStorage.addManager(manager3, { from: owner }).should.be
        .fulfilled;

      // post-condition
      (await this.managedStorage.managerAddresses(manager3)).should.be.equal(
        true
      );
    });
  });

  describe('removeManager()', function() {
    it('허가되지 않은 주소일 경우 실패합니다.', async function() {
      await this.managedStorage.removeManager(manager2, {
        from: anyone
      }).should.be.rejected;
      await this.managedStorage.removeManager(manager2, {
        from: manager1
      }).should.be.rejected;
    });

    it('등록된 manager 주소 삭제를 성공합니다.', async function() {
      // pre-condition
      (await this.managedStorage.managerAddresses(manager1)).should.be.equal(
        true
      );
      (await this.managedStorage.managerAddresses(manager2)).should.be.equal(
        true
      );

      // action
      await this.managedStorage.removeManager(manager2, {
        from: owner
      }).should.be.fulfilled;

      // post-condition
      (await this.managedStorage.managerAddresses(manager2)).should.be.equal(
        false
      );
    });
  });
});
