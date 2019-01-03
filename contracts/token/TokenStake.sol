pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./CarryToken.sol";
import "./ITokenStake.sol";


contract TokenStake is ITokenStake {
    using SafeMath for uint;

    mapping(address => uint) public stake;
    // stakeHolder => pointQuota mapping
    mapping(address => uint) public pointQuota;
    mapping(address => uint) public couponQuota;
    CarryToken public carryToken;
    
    //Reset 관련 variables
    uint resetPeriod = 4 weeks;
    uint lastReset;
    //Point & Coupon 비율
    uint carryToPoint = 10;
    uint carryToCoupon = 10;

    constructor(address _carryToken) public {
        require(_carryToken != address(0), "Zero address is invalid");
        carryToken = CarryToken(_carryToken);
        lastReset = now;
    }

    function depositStake(address _depositor, uint _amount) public returns(bool) {
        require(_depositor != address(0), "Zero address is invalid");
        require(_amount > 0, "You cannot stake 0 token");

        carryToken.transferFrom(msg.sender, address(this), _amount);
        stake[_depositor] = stake[_depositor].add(_amount);
        //기존 Quota에 추가
        pointQuota[_depositor] = pointQuota[_depositor].add(_amount.mul(carryToPoint));
        couponQuota[_depositor] = couponQuota[_depositor].add(_amount.mul(carryToCoupon));

        emit DepositStake(_depositor, msg.sender, _amount);

        return true;
    }

    function withdrawStake(address _receiver, uint _amount) public returns(bool) {
        require(stake[msg.sender] >= _amount, "There is not enough staked token");
        require(_receiver != address(0), "Zero address is invalid");
        require(_amount > 0, "Zero amount is invalid");

        stake[msg.sender] = stake[msg.sender].sub(_amount);
        carryToken.transfer(_receiver, _amount);

        emit WithdrawStake(msg.sender, _receiver, _amount);

        return true;
    }

    function decreaseCouponQuota(address _stakeHolder) public returns(bool){
        require(couponQuota[_stakeHolder] >0,"No coupon quota left");
        couponQuota[_stakeHolder] = couponQuota[_stakeHolder].sub(1);

        emit DecreaseCouponQuota(_stakeHolder);

        return false;
    }

    function decreasePointQuota(address _stakeHolder) public returns(bool){
        require(pointQuota[_stakeHolder]>0,"No point quota left");
        pointQuota[_stakeHolder] = pointQuota[_stakeHolder].sub(1);
        
        emit DecreasePointQuota(_stakeHolder);
        
        return true;
    }

    function resetAllQuotas() public returns(bool){
        require(now-lastReset > resetPeriod);
        lastReset = now;
        return true;
    }

    function getSpendableCouponQuota(address _stakeHolder) public view returns(uint){
        return couponQuota[_stakeHolder];
    }

    function getSpendablePointQuota(address _stakeHolder) public view returns(uint){
        return pointQuota[_stakeHolder];
    }
}
