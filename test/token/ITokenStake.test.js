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

  describe('depositStake()', function() {
    it('_beneficiary가 ZERO Address가 되면 실패합니다.', async function() {});

    it('_amount가 0보다 작으면 실패합니다.', async function() {});

    it('CarryToken#approve를 TokenStake에 안하면 실패합니다.', async function() {});

    it('depositStake를 성공합니다.', async function() {
      // TODO: event 검출 되는지 체크
    });
  });

  describe('withdrawStake()', function() {
    it('_receiver가 ZERO Address가 되면 실패합니다.', async function() {});

    it('_amount가 0보다 작으면 실패합니다.', async function() {});

    it('depositStake의 beneficiary가 아닌 주소가 호출하면 실패합니다.', async function() {});

    it('스테이크된 토큰 양이 _amount보다 작으면 실패합니다.', async function() {});

    it('withdrawStake를 성공합니다.', async function() {
      // TODO: event 검출 되는지 체크
    });
  });

  describe('decreaseCouponQuota()', function() {
    it('spendable quota가 0이면 실패합니다.', async function() {});

    it('decreaseCouponQuota가 성공합니다.', async function() {
      // TODO: event 검출 되는지 체크
    });
  });

  describe('decreasePointQuota()', function() {
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
    it('_stakeHolder 주소에 예치된 토큰이 없으면 0이 반환됩니다.', async function() {});

    it('_stakeHolder 주소에 예치된 토큰이 있지만 Quota를 다써서 없으면 0이 반환됩니다.', async function() {});

    it('_stakeHolder 주소에 예치된 토큰이 있고 Quota를 다 안썼으면 Quota 값이 반환됩니다.', async function() {});
  });

  describe('getSpendablePointQuota()', function() {
    it('_stakeHolder 주소에 예치된 토큰이 없으면 0이 반환됩니다.', async function() {});

    it('_stakeHolder 주소에 예치된 토큰이 있지만 Quota를 다써서 없으면 0이 반환됩니다.', async function() {});

    it('_stakeHolder 주소에 예치된 토큰이 있고 Quota를 다 안썼으면 Quota 값이 반환됩니다.', async function() {});
  });
});
