const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const BrandCouponToken = artifacts.require('BrandCouponToken');

contract('BrandCouponToken', accounts => {
  const [owner, deviceManager1, deviceManager2, userAddress, anyone] = accounts;

  beforeEach(async function() {
    this.brandToken = await BrandToken.new([deviceManager1, deviceManager2], {
      from: owner
    });
  });

  it('should have right owner', async function() {
    (await this.brandToken.owner()).should.be.equal(owner);
  });

  it('should register initial device manager addresses', async function() {
    (await this.brandToken.managerAddresses(deviceManager1)).should.be.equal(
      true
    );
    (await this.brandToken.managerAddresses(deviceManager2)).should.be.equal(
      true
    );
  });

  describe('Creating New CouponToken', function() {
    const _signedBalance = '0x123123'; // bytes
    const _signedSalt = '0x12412134'; // bytes
    const _storeSignedKey = '0x1354634542'; // bytes
    const _userSignedKey = '0x98698631'; // bytes
    const _timestamp = 1513123124; // uint
    const _btKey =
      '0x3121231235000000000000000000000000000000000000000000000000000000'; // bytes32

    describe('#upsertBalance()', function() {
      it('should disallow anyone to create data', async function() {
        await this.brandToken.upsertBalance(
          _signedBalance,
          _signedSalt,
          _storeSignedKey,
          _userSignedKey,
          _timestamp,
          _btKey,
          userAddress,
          { from: anyone }
        ).should.be.rejected;
        await this.brandToken.upsertBalance(
          _signedBalance,
          _signedSalt,
          _storeSignedKey,
          _userSignedKey,
          _timestamp,
          _btKey,
          userAddress,
          { from: owner }
        ).should.be.rejected;
      });
    });
  });
});
