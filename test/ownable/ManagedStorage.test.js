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

  it('should have right owner', async function() {
    (await this.managedStorage.owner()).should.be.equal(owner);
  });

  it('should register initial manager addresses', async function() {
    (await this.managedStorage.managerAddresses(manager1)).should.be.equal(
      true
    );
    (await this.managedStorage.managerAddresses(manager2)).should.be.equal(
      true
    );
  });

  describe('Control device manager addresses', function() {
    describe('#addManager()', function() {
      it('should disallow anyone to add new manager', async function() {
        await this.managedStorage.addManager(manager3, { from: anyone }).should
          .be.rejected;
        await this.managedStorage.addManager(manager3, {
          from: manager1
        }).should.be.rejected;
      });

      it('should add new manager', async function() {
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
        await this.managedStorage.addManager(manager3, { from: owner }).should
          .be.fulfilled;

        // post-condition
        (await this.managedStorage.managerAddresses(manager3)).should.be.equal(
          true
        );
      });
    });

    describe('#removeManager()', function() {
      it('should disallow anyone to remove manager', async function() {
        await this.managedStorage.removeManager(manager2, {
          from: anyone
        }).should.be.rejected;
        await this.managedStorage.removeManager(manager2, {
          from: manager1
        }).should.be.rejected;
      });

      it('should remove manager', async function() {
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
});
