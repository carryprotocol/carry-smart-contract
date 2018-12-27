pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../token/TokenStake.sol";
import "../token/CarryToken.sol";


contract Manager {
    using SafeMath for uint;

    TokenStake public tokenStake;
    CarryToken public carryToken;

    mapping(address => bool) public admins;
    uint public adminNumber = 0;

    event RegisterAdmin(address _newAdmin, uint _adminNumber);
    event RemoveAdmin(address _admin, uint _adminNumber);

    modifier onlyAdmins() {
        require(admins[msg.sender] == true, "Wrong admin");
        _;
    }

    constructor(address[] _admins, address _tokenStake, address _carryToken) public {
        require(_tokenStake != address(0));

        for (uint i = 0; i < _admins.length; i++) {
            admins[_admins[i]] = true;
        }
        adminNumber = _admins.length;
        tokenStake = TokenStake(_tokenStake);
        carryToken = CarryToken(_carryToken);
    }

    function registerAdmin(address _newAdmin) public onlyAdmins {
        require(admins[_newAdmin] == false, "Already exist");
        admins[_newAdmin] = true;
        adminNumber = adminNumber.add(1);
        emit RegisterAdmin(_newAdmin, adminNumber);
    }

    function removeAdmin(address _admin) public onlyAdmins {
        require(adminNumber > 1, "Can not remove all admins");
        require(admins[_admin] == true, "Not registered");
        admins[_admin] = false;
        adminNumber = adminNumber.sub(1);
        emit RemoveAdmin(_admin, adminNumber);
    }

    function withdrawAllStake(address _receiver) public onlyAdmins returns(bool) {
        require(_receiver != address(0), "Zero address is invalid");
        uint amount = tokenStake.stake(address(this));

        return tokenStake.withdrawStake(_receiver, amount);
    }
}
