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

  describe('admins()', function() {
    it('admin 여부를 판단하는데 성공합니다.', async function() {
      (await this.manager.admins(owner)).should.be.equal(true);
      (await this.manager.admins(anyone)).should.be.equal(false);
    });
  });

  describe('adminNumber()', function() {
    it('올바른 admin의 수를 가져오는데 성공합니다.', async function() {
      (await this.manager.adminNumber()).should.be.bignumber.equal(1);
    });
  });

  describe('carryToken()', function() {
    it('올바른 carry token의 주소를 가져오는데 성공합니다.', async function() {
      (await this.manager.carryToken()).should.be.equal(
        this.carryToken.address
      );
    });
  });

  describe('tokenStake()', function() {
    it('올바른 tokenStake의 주소를 가져오는데 성공합니다.', async function() {
      (await this.manager.tokenStake()).should.be.equal(
        this.tokenStake.address
      );
    });
  });

  describe('registerAdmin()', function() {
    it('허가되지 않은 주소가 새로운 admin 등록을 시도하면 실패합니다.', async function() {
      await this.manager.registerAdmin(admin, { from: anyone }).should.be
        .rejected;
    });

    it('이미 등록된 주소를 새로운 admin으로 등록을 시도하면 실패합니다.', async function() {
      await this.manager.registerAdmin(owner, { from: owner }).should.be
        .rejected;
    });

    it('새로운 admin 등록을 성공합니다.', async function() {
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

  describe('removeAdmin()', function() {
    beforeEach(async function() {
      await this.manager.registerAdmin(admin, {
        from: owner
      }).should.be.fulfilled;
    });

    it('허가되지 않은 주소가 admin 삭제를 시도하면 실패합니다.', async function() {
      await this.manager.removeAdmin(admin, { from: anyone }).should.be
        .rejected;
    });

    it('등록되지 않은 admin 삭제를 시도하면 실패합니다.', async function() {
      await this.manager.removeAdmin(anyone, { from: owner }).should.be
        .rejected;
    });

    it('남은 admin의 수가 한 명일 때 admin 삭제를 시도하면 실패합니다.', async function() {
      // pre-condition
      await this.manager.removeAdmin(admin, { from: owner }).should.be
        .fulfilled;
      (await this.manager.adminNumber()).should.be.bignumber.equal(1);

      // action
      await this.manager.removeAdmin(owner, { from: owner }).should.be.rejected;
    });

    it('admin 삭제를 성공합니다.', async function() {
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

  describe('withdrawAllStake()', function() {
    const DEPOSIT_AMOUNT = 50;

    beforeEach(async function() {
      await this.carryToken.approve(this.tokenStake.address, DEPOSIT_AMOUNT, {
        from: owner
      }).should.be.fulfilled;
      await this.tokenStake.depositStake(this.manager.address, DEPOSIT_AMOUNT, {
        from: owner
      }).should.be.fulfilled;
    });

    it('receiver의 주소가 zero address일 경우 실패합니다.', async function() {
      await this.manager.withdrawAllStake(ZERO_ADDRESS, { from: owner }).should
        .be.rejected;
    });

    it('허가되지 않은 주소일 경우 실패합니다.', async function() {
      await this.manager.withdrawAllStake(owner, { from: anyone }).should.be
        .rejected;
    });

    it('모든 담보 인출을 성공합니다.', async function() {
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
