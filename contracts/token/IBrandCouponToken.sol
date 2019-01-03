pragma solidity ^0.4.23;

import "./ITokenStake.sol";

contract IBrandCouponToken {
    /**
    * @dev setTokenStake tokenStake contract address setter
    * @param _tokenStake tokenStake contract address
    */
    function setTokenStake(ITokenStake _tokenStake) public;
    /**
    * @dev setMinStakeBalance 최소 stake balance를 설정하는 setter
    * @param _minStakeBalance 설정할 최소 stake balance
    */
    function setMinStakeBalance(uint _minStakeBalance) public;
    /**
    * @dev mint 토큰 발행 함수
    * @param _to 토큰 받을 address
    * @param _tokenId 발행할 token id
    * @param uri token id에 매칭 될 uri
    */
    function mint(address _to, uint256 _tokenId, string uri) public returns (bool);
}
