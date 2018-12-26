const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const Manager = artifacts.require('Manager');

contract('Manager', accounts => {
  const [owner, admin, anyone] = accounts;

  beforeEach(async function() {
    this.deviceManager = await Manager.new([owner], { from: owner });
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
  });
});
