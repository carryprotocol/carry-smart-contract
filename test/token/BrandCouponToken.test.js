const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();
const expectEvent = require('openzeppelin-solidity/test/helpers/expectEvent');
const { shouldBehaveLikeERC721 } = require('./ERC721.behavior');

const BrandCouponToken = artifacts.require('BrandCouponToken');
const CarryToken = artifacts.require('CarryToken');
const TokenStake = artifacts.require('TokenStake');

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const MINIMUM_STAKE = 100;

contract('BrandCouponToken', accounts => {
  const [owner, staker1, staker2, userAddress, anyone] = accounts;

  beforeEach(async function() {
    this.carryToken = await CarryToken.new({ from: owner });
    this.tokenStake = await TokenStake.new(this.carryToken.address, {
      from: owner
    });
    this.brandCouponToken = await BrandCouponToken.new(
      'test token',
      'TEST',
      this.tokenStake.address,
      MINIMUM_STAKE,
      {
        from: owner
      }
    );
  });
  // ERC721 behavior 가져오기
  shouldBehaveLikeERC721(owner, owner, accounts);

  describe('Initialize', function() {
    it('should have right owner', async function() {
      (await this.brandCouponToken.owner()).should.be.equal(owner);
    });
  });
  describe('setTokenStake()', function() {
    const NEW_TOKENSTAKE = '0x0000000000000000000000000000000000004321';
    it('ZERO ADDRESS 를 입력으로 받을 없습니다', async function() {
      await this.brandCouponToken.setTokenStake(ZERO_ADDRESS, { from: owner })
        .should.be.rejected;
    });
    it('owner 가 아닌 address로 호출하면 실패합니다', async function() {
      await this.brandCouponToken.setTokenStake(this.tokenStake.address, {
        from: anyone
      }).should.be.rejected;
    });
    it('TokenStakeChanged event를 발생시킵니다', async function() {
      const { logs } = await this.brandCouponToken.setTokenStake(
        NEW_TOKENSTAKE,
        {
          from: owner
        }
      );

      expectEvent.inLogs(logs, 'TokenStakeChanged', {
        newTokenStake: NEW_TOKENSTAKE
      });
    });
  });
  describe('setMinStakeBalance()', function() {
    it('owner 가 아닌 address로 호출하면 실패합니다', async function() {
      await this.brandCouponToken.setMinStakeBalance(200, {
        from: anyone
      }).should.be.rejected;
    });
    it('정상적으로 MinStakeBalanceChanged event 를 발생합니다', async function() {
      const { logs } = await this.brandCouponToken.setMinStakeBalance(200, {
        from: owner
      });
      expectEvent.inLogs(logs, 'MinStakeBalanceChanged', {
        newMinStakeBalance: 200
      });
    });
  });
  describe('mint()', function() {
    beforeEach(async function() {
      const DEPOSIT_AMOUNT = 1000000;
      await this.carryToken.mint(owner, DEPOSIT_AMOUNT, {
        from: owner
      }).should.be.fulfilled;
      await this.carryToken.approve(this.tokenStake.address, DEPOSIT_AMOUNT, {
        from: owner
      }).should.be.fulfilled;
      await this.tokenStake.depositStake(staker1, MINIMUM_STAKE - 1, {
        from: owner
      }).should.be.fulfilled;
      await this.tokenStake.depositStake(staker2, MINIMUM_STAKE + 1, {
        from: owner
      }).should.be.fulfilled;
    });
    const TOKEN_ID_1 = 1;
    const TOKEN_ID_2 = 2;
    const TOKEN_URI_1 = 1234;
    const TOKEN_URI_2 = 5678;
    it('stakeBalance 가 minStakeBalance 보다 작은 경우 실패합니다', async function() {
      await this.brandCouponToken.mint(userAddress, TOKEN_ID_1, TOKEN_URI_1, {
        from: staker1
      }).should.be.rejected;
    });

    it('TOKEN ID 가 중복된 경우 실패 합니다 ', async function() {
      await this.brandCouponToken.mint(userAddress, TOKEN_ID_1, TOKEN_URI_2, {
        from: staker2
      }).should.be.fulfilled;
      await this.brandCouponToken.mint(userAddress, TOKEN_ID_1, TOKEN_URI_1, {
        from: staker2
      }).should.be.rejected;
    });

    it('Transfer event를 발생 시킵니다', async function() {
      const { logs } = await this.brandCouponToken.mint(
        userAddress,
        TOKEN_ID_2,
        TOKEN_URI_2,
        {
          from: staker2
        }
      ).should.be.fulfilled;

      expectEvent.inLogs(logs, 'Transfer', {
        from: ZERO_ADDRESS,
        to: userAddress,
        tokenId: TOKEN_ID_2
      });
    });
  });
});
