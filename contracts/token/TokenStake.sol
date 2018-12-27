pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./CarryToken.sol";


contract TokenStake {
    using SafeMath for uint;

    mapping(address => uint) public stake;
    CarryToken public carryToken;

    event DepositStake(address _depositor, address _sender, uint _amount);
    event WithdrawStake(address _depositor, address _receiver, uint _amount);

    constructor(address _carryToken) public {
        require(_carryToken != address(0), "Zero address is invalid");
        carryToken = CarryToken(_carryToken);
    }

    function depositStake(address _depositor, uint _amount) public returns(bool) {
        require(_depositor != address(0), "Zero address is invalid");
        require(_amount > 0, "You cannot stake 0 token");

        carryToken.transferFrom(msg.sender, address(this), _amount);
        stake[_depositor] = stake[_depositor].add(_amount);

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
}
