// The Carry token and the tokensale contracts
// Copyright (C) 2018 Carry Protocol
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
import assertEq from '../utils/assertEq';
import assertFail from '../utils/assertFail';

const CarryToken = artifacts.require('CarryToken');

contract('CarryToken', accounts => {
  const [sender, receiver] = accounts;
  let instance;
  let decimals;

  function fromCre(cre) {
    const minUnitInCre = new web3.BigNumber(10).pow(decimals);
    return minUnitInCre.mul(cre);
  }

  before(async () => {
    assert.notEqual(sender, receiver, 'sender and receiver has to be distinct');
    instance = await CarryToken.new();
    decimals = await instance.decimals();
    await instance.mint(sender, fromCre('10000'), { from: sender });
  });

  it('cannot be minted more than TOTAL_CAP', async () => {
    const totalSupply = await instance.totalSupply();
    await assertFail(
      instance.mint(
        sender,
        fromCre('10000000000')
          .minus(totalSupply)
          .plus(1),
        { from: sender }
      ),
      'Mint should be failed'
    );
    assertEq(
      totalSupply,
      await instance.totalSupply(),
      "Total supply shouldn't be changed"
    );
  });

  it('should transfer token correctly', async () => {
    const senderPrevBalance = await instance.balanceOf.call(sender);
    const receiverPrevBalance = await instance.balanceOf.call(receiver);
    const amount = fromCre(10);
    await instance.transfer(receiver, amount, { from: sender });
    assertEq(
      senderPrevBalance.minus(amount),
      await instance.balanceOf.call(sender),
      "Amount wasn't correctly taken from the sender"
    );
    assertEq(
      receiverPrevBalance.plus(amount),
      await instance.balanceOf.call(receiver),
      "Amount wasn't correctly sent to the receiver"
    );
  });

  it('should fail to transfer if sender has not enough balance', async () => {
    const senderPrevBalance = await instance.balanceOf.call(sender);
    const receiverPrevBalance = await instance.balanceOf.call(receiver);
    const amount = senderPrevBalance.plus(1);
    await assertFail(
      instance.transfer(receiver, amount, { from: sender }),
      'Transfer should be failed'
    );
    assertEq(
      senderPrevBalance,
      await instance.balanceOf.call(sender),
      'Amount must not be taken from the sender'
    );
    assertEq(
      receiverPrevBalance,
      await instance.balanceOf.call(receiver),
      'Amount must not be sent to the receiver'
    );
  });

  it('can be burned by token owners', async () => {
    const owner = sender;
    const prevTotal = await instance.totalSupply.call();
    const prevBalance = await instance.balanceOf.call(owner);
    await assertFail(
      instance.burn(prevBalance.plus(1), { from: owner }),
      'One can burn the only amount they own at most.'
    );
    assertEq(
      prevTotal,
      await instance.totalSupply.call(),
      'Total supply should not be changed.'
    );
    assertEq(
      prevBalance,
      await instance.balanceOf.call(owner),
      'The balance should not be changed.'
    );
    const burningAmount = prevBalance.div(2);
    await instance.burn(burningAmount, { from: owner });
    assertEq(
      prevTotal.minus(burningAmount),
      await instance.totalSupply.call(),
      'The burned amount should be substracted from the total supply.'
    );
    assertEq(
      prevBalance.minus(burningAmount),
      await instance.balanceOf.call(owner),
      'The burned amount should be subtracted from the balance.'
    );
  });
});
