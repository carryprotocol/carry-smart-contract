pragma solidity ^0.4.23;

import "./ITokenStake.sol";

contract IBrandCouponTokenStake is ITokenStake {


    /**
    * @dev BT를 발행하기 위해서 CRE를 스테이크 하는 함수
    * @param _beneficiary CRE 예치의 수혜자 주소
    * @param _amount 예치하는 CRE 토큰의 양
    * @return bool deposit 이 올바르게 됬는지 bool 반환
    */
    function depositStake(address _beneficiary, uint _amount) public returns(bool);
}
