const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const Manager = artifacts.require('Manager');
const TokenStake = artifacts.require('TokenStake');
const CarryToken = artifacts.require('CarryToken');

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

contract('Manager', accounts => {
  const [owner, admin, anyone] = accounts;

  beforeEach(async function() {
    this.carryToken = await CarryToken.new({ from: owner });
    await this.carryToken.mint(owner, 10000000000, { from: owner });
    this.tokenStake = await TokenStake.new(this.carryToken.address, {
      from: owner
    });

    this.manager = await Manager.new(
      [owner],
      this.tokenStake.address,
      this.carryToken.address,
      { from: owner }
    );
  });

  describe('Initialize', function() {
    it('should have right initial admin', async function() {
      (await this.manager.admins(owner)).should.be.equal(true);
      (await this.manager.admins(anyone)).should.be.equal(false);

      (await this.manager.adminNumber()).should.be.bignumber.equal(1);
    });

    it('should have right token contract address', async function() {
      (await this.manager.carryToken()).should.be.equal(
        this.carryToken.address
      );
    });

    it('should have right token stake contract address', async function() {
      (await this.manager.tokenStake()).should.be.equal(
        this.tokenStake.address
      );
    });
  });

  describe('Ownership', function() {
    describe('#registerAdmin()', function() {
      it('should disallow anyone to register new admin', async function() {
        await this.manager.registerAdmin(admin, { from: anyone }).should.be
          .rejected;
      });

      it('should disallow to register duplicated admin', async function() {
        await this.manager.registerAdmin(owner, { from: owner }).should.be
          .rejected;
      });

      it('should register new admin', async function() {
        // pre-condition
        (await this.manager.admins(admin)).should.be.equal(false);

        // action
        await this.manager.registerAdmin(admin, { from: owner }).should.be
          .fulfilled;

        // post-condition
        (await this.manager.admins(admin)).should.be.equal(true);
        (await this.manager.adminNumber()).should.be.bignumber.equal(2);
      });
    });

    describe('#removeAdmin()', function() {
      beforeEach(async function() {
        await this.manager.registerAdmin(admin, {
          from: owner
        }).should.be.fulfilled;
      });

      it('should disallow anyone to remove admin', async function() {
        await this.manager.removeAdmin(admin, { from: anyone }).should.be
          .rejected;
      });

      it('should disallow to remove nonexistent admin', async function() {
        await this.manager.removeAdmin(anyone, { from: owner }).should.be
          .rejected;
      });

      it('should disallow all admins', async function() {
        // pre-condition
        await this.manager.removeAdmin(admin, { from: owner }).should.be
          .fulfilled;
        (await this.manager.adminNumber()).should.be.bignumber.equal(1);

        // action
        await this.manager.removeAdmin(owner, { from: owner }).should.be
          .rejected;
      });

      it('should remove admin', async function() {
        // pre-condition
        (await this.manager.admins(admin)).should.be.equal(true);
        (await this.manager.adminNumber()).should.be.bignumber.equal(2);

        // action
        await this.manager.removeAdmin(admin, { from: owner }).should.be
          .fulfilled;

        // post-condition
        (await this.manager.admins(admin)).should.be.equal(false);
        (await this.manager.adminNumber()).should.be.bignumber.equal(1);
      });
    });
  });

  describe('Stake', function() {
    describe('#withdrawStake()', function() {
      const DEPOSIT_AMOUNT = 50;

      beforeEach(async function() {
        await this.carryToken.approve(this.tokenStake.address, DEPOSIT_AMOUNT, {
          from: owner
        }).should.be.fulfilled;
        await this.tokenStake.depositStake(
          this.manager.address,
          DEPOSIT_AMOUNT,
          {
            from: owner
          }
        ).should.be.fulfilled;
      });

      it('should disallow zero address receiver', async function() {
        await this.manager.withdrawAllStake(ZERO_ADDRESS, { from: owner })
          .should.be.rejected;
      });

      it('should disallow anyone to withdraw stake', async function() {
        await this.manager.withdrawAllStake(owner, { from: anyone }).should.be
          .rejected;
      });

      it('should withdraw all stake from stake contract', async function() {
        // pre-condition
        (await this.tokenStake.stake(
          this.manager.address
        )).should.be.bignumber.equal(DEPOSIT_AMOUNT);
        (await this.carryToken.balanceOf(
          this.tokenStake.address
        )).should.be.bignumber.equal(DEPOSIT_AMOUNT);
        const initialBalance = (await this.carryToken.balanceOf(
          owner
        )).toNumber();

        await this.manager.withdrawAllStake(owner, { from: owner }).should.be
          .fulfilled;

        // post-condition
        (await this.tokenStake.stake(
          this.manager.address
        )).should.be.bignumber.equal(0);
        (await this.carryToken.balanceOf(
          this.tokenStake.address
        )).should.be.bignumber.equal(0);
        (await this.carryToken.balanceOf(owner)).should.be.bignumber.equal(
          initialBalance + DEPOSIT_AMOUNT
        );
      });
    });
  });
});
