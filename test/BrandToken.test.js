const BigNumber = web3.BigNumber;
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const BrandToken = artifacts.require('BrandToken');

contract('BrandToken', accounts => {
  const [owner, deviceManager, userAddress] = accounts;

  beforeEach(async function() {
    this.brandToken = await BrandToken.new(owner, { from: owner });
  });

  it('should have right owner', async function() {
    (await this.brandToken.deviceManagerAddress()).should.be.equal(owner);
  });

  describe('Creating New BrandToken', function() {
    it('should update new data', async function() {
      const _signedBalance = '0x123123'; // bytes
      const _signedSalt = '0x12412134'; // bytes
      const _storeSignedKey = '0x1354634542'; // bytes
      const _userSignedKey = '0x98698631'; // bytes
      const _deviceManager = deviceManager; // address
      const _timestamp = 1513123124; // uint
      const _btKey = '0x3121231235000000000000000000000000000000000000000000000000000000'; // bytes32

      await this.brandToken.updateBalance(_signedBalance, _signedSalt, _storeSignedKey, _userSignedKey, _deviceManager, _timestamp, _btKey, userAddress).should.be.fulfilled;

      (await this.brandToken.signedBalances(_btKey, userAddress)).should.be.equal(_signedBalance);
      (await this.brandToken.signedSalts(_btKey, userAddress)).should.be.equal(_signedSalt);
      (await this.brandToken.storeSignedKeys(_btKey, userAddress)).should.be.equal(_storeSignedKey);
      (await this.brandToken.userSignedKeys(_btKey, userAddress)).should.be.equal(_userSignedKey);
      (await this.brandToken.timestamps(_btKey, userAddress)).should.be.bignumber.equal(_timestamp);
      (await this.brandToken.creators(_btKey, userAddress)).should.be.equal(_deviceManager);

      (await this.brandToken.btKeys(userAddress, 0)).should.be.equal(_btKey);
    });
  });
});
