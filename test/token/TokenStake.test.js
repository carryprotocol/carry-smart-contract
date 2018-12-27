const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const TokenStake = artifacts.require('TokenStake');
const CarryToken = artifacts.require('CarryToken');

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

contract('TokenStake', accounts => {
  const [owner, anyone] = accounts;

  beforeEach(async function() {
    this.carryToken = await CarryToken.new({ from: owner });
    this.tokenStake = await TokenStake.new(this.carryToken.address, {
      from: owner
    });
  });

  describe('#constructor()', function() {
    it('should disallow zero address at token address argument', async function() {
      await TokenStake.new(ZERO_ADDRESS, { from: owner }).should.be.rejected;
    });
  });

  describe('Initialize', function() {
    it('should have right token address', async function() {
      (await this.tokenStake.carryToken()).should.be.equal(
        this.carryToken.address
      );
    });
  });

  describe('Stake Control', function() {
    const DEPOSIT_AMOUNT = 50;

    beforeEach(async function() {
      await this.carryToken.mint(owner, 100000, {
        from: owner
      }).should.be.fulfilled;
    });

    describe('#depositStake()', function() {
      it('should disallow zero address at depositor address argument', async function() {
        await this.tokenStake.depositStake(ZERO_ADDRESS, 500, { from: owner })
          .should.be.rejected;
      });

      it('should disallow zero deposit amount', async function() {
        await this.tokenStake.depositStake(owner, 0, { from: owner }).should.be
          .rejected;
      });

      it('should disallow before approving tokens to contract', async function() {
        await this.tokenStake.depositStake(owner, DEPOSIT_AMOUNT, {
          from: owner
        }).should.be.rejected;
      });

      it('should receive deposits', async function() {
        // pre-condition
        await this.carryToken.approve(this.tokenStake.address, DEPOSIT_AMOUNT, {
          from: owner
        }).should.be.fulfilled;
        (await this.carryToken.allowance(
          owner,
          this.tokenStake.address
        )).should.be.bignumber.equal(DEPOSIT_AMOUNT);

        await this.tokenStake.depositStake(owner, DEPOSIT_AMOUNT, {
          from: owner
        }).should.be.fulfilled;

        // post-condition
        (await this.carryToken.allowance(
          owner,
          this.tokenStake.address
        )).should.be.bignumber.equal(0);
        (await this.tokenStake.stake(owner)).should.be.bignumber.equal(
          DEPOSIT_AMOUNT
        );
        (await this.carryToken.balanceOf(
          this.tokenStake.address
        )).should.be.bignumber.equal(DEPOSIT_AMOUNT);
      });
    });

    describe('#withdrawStake', function() {
      const WITHDRAW_AMOUNT = DEPOSIT_AMOUNT / 2;

      beforeEach(async function() {
        await this.carryToken.approve(this.tokenStake.address, DEPOSIT_AMOUNT, {
          from: owner
        }).should.be.fulfilled;
        await this.tokenStake.depositStake(owner, DEPOSIT_AMOUNT, {
          from: owner
        }).should.be.fulfilled;
      });

      it('should disallow to withdraw zero amounts', async function() {
        await this.tokenStake.withdrawStake(owner, 0, { from: anyone }).should
          .be.rejected;
      });

      it('should disallow to withdraw for zero address', async function() {
        await this.tokenStake.withdrawStake(ZERO_ADDRESS, WITHDRAW_AMOUNT, {
          from: owner
        }).should.be.rejected;
      });

      it('should disallow to withdraw too much tokens', async function() {
        await this.tokenStake.withdrawStake(ZERO_ADDRESS, DEPOSIT_AMOUNT + 1, {
          from: owner
        }).should.be.rejected;
      });

      it('should withdraw stake', async function() {
        // pre-condition
        (await this.tokenStake.stake(owner)).should.be.bignumber.equal(
          DEPOSIT_AMOUNT
        );
        (await this.carryToken.balanceOf(
          this.tokenStake.address
        )).should.be.bignumber.equal(DEPOSIT_AMOUNT);
        const initialBalance = (await this.carryToken.balanceOf(
          owner
        )).toNumber();

        await this.tokenStake.withdrawStake(owner, WITHDRAW_AMOUNT, {
          from: owner
        }).should.be.fulfilled;

        // post-condition
        (await this.tokenStake.stake(owner)).should.be.bignumber.equal(
          DEPOSIT_AMOUNT - WITHDRAW_AMOUNT
        );
        (await this.carryToken.balanceOf(
          this.tokenStake.address
        )).should.be.bignumber.equal(DEPOSIT_AMOUNT - WITHDRAW_AMOUNT);
        (await this.carryToken.balanceOf(owner)).should.be.bignumber.equal(
          initialBalance + WITHDRAW_AMOUNT
        );
      });
    });
  });
});
