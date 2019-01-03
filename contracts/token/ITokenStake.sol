pragma solidity ^0.4.23;

/**
* @dev Coupon BT, Point BT, AD 를 위해 CRE 토큰을 스테이킹 하는 컨트랙트.
*/
contract ITokenStake {
    event DepositStake(address _beneficiary, uint _amount);
    event WithdrawStake(address _receiver, uint _amount);
    event DecreaseCouponQuota(address _stakeHolder);
    event DecreasePointQuota(address _stakeHolder);
    event ResetAllQuotas();

    /**
    * @dev BT를 발행하기 위해서 CRE를 스테이크 하는 함수
    * @param _beneficiary CRE 예치의 수혜자 주소
    * @param _amount 예치하는 CRE 토큰의 양
    * @return bool deposit 이 올바르게 됬는지 bool 반환
    */
    function depositStake(address _beneficiary, uint _amount) public returns(bool);

    /**
    * @dev 스테이크한 CRE를 출금하는 함수
    * @param _receiver 출금하는 CRE 토큰을 받을 주소
    * @param _amount 출금할 CRE 토큰의 양
    * @return bool withdraw 가 올바르게 됬는지 bool 반환
    */
    function withdrawStake(address _receiver, uint _amount) public returns(bool);

//    /**
//    * @dev Coupon Brand Token을 발행했을 때 Quota 를 1개 차감하는 함수.
//    * @param _stakeHolder 스테이크 홀더의 주소
//    * @return bool decreaseCouponQuota 가 올바르게 됬는지 bool 반환
//    */
//    function decreaseCouponQuota(address _stakeHolder) public returns(bool);
//
//    /**
//    * @dev Point Brand Token을 발행했을 때 Quota 를 1개 차감하는 함수.
//    * @param _stakeHolder 스테이크 홀더의 주소
//    * @return bool decreasePointQuota 가 올바르게 됬는지 bool 반환
//    */
//    function decreasePointQuota(address _stakeHolder) public returns(bool);
//
//    /**
//    * @dev 1달 마다 모든 스테이크 홀더의 모든 Quota 를 초기화 하는 함수.
//    * @return bool resetAllQuotas 가 올바르게 됬는지 bool 반환
//    */
//    function resetAllQuotas() public returns(bool);
//
//    /**
//    * @dev 1달 동안 Coupon Brand Token을 발행할 수 있는 총량을 반환하는 함수
//    * @param _stakeHolder 스테이크 홀더의 주소
//    * @return uint 1달 동안 Coupon Brand Token을 발행할 수 있는 총량
//    */
//    function getSpendableCouponQuota(address _stakeHolder) public view returns(uint);
//
//    /**
//    * @dev 1달 동안 Point Brand Token을 발행할 수 있는 총량을 반환하는 함수
//    * @param _stakeHolder 스테이크 홀더의 주소
//    * @return uint 1달 동안 Point Brand Token을 발행할 수 있는 총량
//    */
//    function getSpendablePointQuota(address _stakeHolder) public view returns(uint);
}
