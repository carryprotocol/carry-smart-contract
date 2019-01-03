const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();
const expectEvent = require('openzeppelin-solidity/test/helpers/expectEvent');
const TokenStake = artifacts.require('TokenStake');
const CarryToken = artifacts.require('CarryToken');

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const STAKE_AMOUNT = 100;
contract('TokenStake', accounts => {
  const [owner, depositor, usedDepositor, anyone] = accounts;

  beforeEach(async function() {
    this.carryToken = await CarryToken.new({ from: owner });
    this.carryToken.mint(owner, STAKE_AMOUNT * 100, { from: owner });
    this.tokenStake = await TokenStake.new(this.carryToken.address, {
      from: owner
    });
  });

  describe('depositStake()', function() {
    it('_beneficiary가 ZERO Address가 되면 실패합니다.', async function() {
      await this.tokenStake.depositStake(ZERO_ADDRESS, STAKE_AMOUNT, {
        from: owner
      }).should.be.rejected;
    });

    it('_amount가 0이면 실패합니다.', async function() {
      await this.tokenStake.depositStake(depositor, 0, { from: owner }).should
        .be.rejected;
    });

    it('CarryToken#approve를 TokenStake에 안하면 실패합니다.', async function() {
      await this.tokenStake.depositStake(depositor, STAKE_AMOUNT, {
        from: owner
      }).should.be.rejected;
    });

    it('depositStake를 성공합니다.', async function() {
      await this.carryToken.approve(this.tokenStake.address, STAKE_AMOUNT, {
        from: owner
      }).should.be.fulfilled;
      const { logs } = await this.tokenStake.depositStake(
        depositor,
        STAKE_AMOUNT,
        { from: owner }
      );
      expectEvent.inLogs(logs, 'DepositStake', {
        _beneficiary: depositor,
        _sender: owner,
        _amount: STAKE_AMOUNT
      });
    });
  });

  describe('withdrawStake()', function() {
    beforeEach(async function() {
      await this.carryToken.approve(
        this.tokenStake.address,
        STAKE_AMOUNT * 100,
        { from: owner }
      ).should.be.fulfilled;
      await this.tokenStake.depositStake(depositor, STAKE_AMOUNT, {
        from: owner
      });
    });
    it('스테이크된 토큰 양이 _amount보다 작으면 실패합니다.', async function() {
      await this.tokenStake.withdrawStake(anyone, STAKE_AMOUNT + 1, {
        from: depositor
      }).should.be.rejected;
    });

    it('_receiver가 ZERO Address가 되면 실패합니다.', async function() {
      await this.tokenStake.withdrawStake(ZERO_ADDRESS, STAKE_AMOUNT + 1, {
        from: depositor
      }).should.be.rejected;
    });

    it('_amount가 0이면 실패합니다', async function() {
      await this.tokenStake.withdrawStake(anyone, 0, { from: depositor }).should
        .be.rejected;
    });

    //it('depositStake의 beneficiary가 아닌 주소가 호출하면 실패합니다.', async function() { //_amount 있으면 beneficiary 아닌가?
    //  await this.tokenStake.withdrawStake(depositor, 0, {from:depositor}).should.be.rejected;
    //});

    it('withdrawStake를 성공합니다.', async function() {
      // TODO: event 검출 되는지 체크
      const { logs } = await this.tokenStake.withdrawStake(
        anyone,
        STAKE_AMOUNT,
        { from: depositor }
      );
      expectEvent.inLogs(logs, 'WithdrawStake', {
        _depositor: depositor,
        _receiver: anyone,
        _amount: STAKE_AMOUNT
      });
    });
  });

  describe('decreaseCouponQuota()', function() {
    beforeEach(async function() {
      await this.carryToken.approve(
        this.tokenStake.address,
        STAKE_AMOUNT * 100,
        { from: owner }
      ).should.be.fulfilled;
      await this.tokenStake.depositStake(depositor, STAKE_AMOUNT, {
        from: owner
      });
      await this.tokenStake.depositStake(usedDepositor, 1, { from: owner });
      await this.tokenStake.decreaseCouponQuota(usedDepositor, { from: owner });
    });
    it('spendable quota가 0이면 실패합니다.', async function() {});

    it('decreaseCouponQuota가 성공합니다.', async function() {
      // TODO: event 검출 되는지 체크
    });
  });

  describe('decreasePointQuota()', function() {
    beforeEach(async function() {
      await this.carryToken.approve(
        this.tokenStake.address,
        STAKE_AMOUNT * 100,
        { from: owner }
      ).should.be.fulfilled;
      await this.tokenStake.depositStake(depositor, STAKE_AMOUNT, {
        from: owner
      });
    });
    it('spendable quota가 0이면 실패합니다.', async function() {});

    it('decreasePointQuota가 성공합니다.', async function() {
      // TODO: event 검출 되는지 체크
    });
  });

  describe('resetAllQuotas()', function() {
    it('마지막 호출시점으로 부터 아직 1달이 안됬으면 resetAllQuotas가 실패합니다.', async function() {});

    it('resetAllQuotas가 성공합니다.', async function() {
      // TODO: event 검출 되는지 체크
    });
  });

  describe('getSpendableCouponQuota()', function() {
    beforeEach(async function() {
      await this.carryToken.approve(
        this.tokenStake.address,
        STAKE_AMOUNT * 100,
        { from: owner }
      ).should.be.fulfilled;
      await this.tokenStake.depositStake(depositor, STAKE_AMOUNT, {
        from: owner
      });
    });
    it('_stakeHolder 주소에 예치된 토큰이 없으면 0이 반환됩니다.', async function() {});

    it('_stakeHolder 주소에 예치된 토큰이 있지만 Quota를 다써서 없으면 0이 반환됩니다.', async function() {});

    it('_stakeHolder 주소에 예치된 토큰이 있고 Quota를 다 안썼으면 Quota 값이 반환됩니다.', async function() {});
  });

  describe('getSpendablePointQuota()', function() {
    beforeEach(async function() {
      await this.carryToken.approve(
        this.tokenStake.address,
        STAKE_AMOUNT * 100,
        { from: owner }
      ).should.be.fulfilled;
      await this.tokenStake.depositStake(depositor, STAKE_AMOUNT, {
        from: owner
      });
    });
    it('_stakeHolder 주소에 예치된 토큰이 없으면 0이 반환됩니다.', async function() {});

    it('_stakeHolder 주소에 예치된 토큰이 있지만 Quota를 다써서 없으면 0이 반환됩니다.', async function() {});

    it('_stakeHolder 주소에 예치된 토큰이 있고 Quota를 다 안썼으면 Quota 값이 반환됩니다.', async function() {});
  });
});
