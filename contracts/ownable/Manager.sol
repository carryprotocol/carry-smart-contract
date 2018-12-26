pragma solidity ^0.4.24;

import "../libs/SafeMath.sol";


contract Manager {
    using SafeMath for uint;

    mapping(address => bool) public admins;
    uint public adminNumber = 0;

    event RegisterAdmin(address _newAdmin, uint _adminNumber);
    event RemoveAdmin(address _admin, uint _adminNumber);

    modifier onlyAdmins() {
        require(admins[msg.sender] == true, "Wrong admin");
        _;
    }

    constructor(address[] _admins) public {
        for (uint i = 0; i < _admins.length; i++) {
            admins[_admins[i]] = true;
        }
        adminNumber = _admins.length;
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
}
