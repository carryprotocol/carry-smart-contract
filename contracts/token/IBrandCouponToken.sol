pragma solidity ^0.4.23;

import "./ITokenStake.sol";

contract IBrandCouponToken {
    function setTokenStake(ITokenStake _tokenStake) public;
    // TODO: mint
}
