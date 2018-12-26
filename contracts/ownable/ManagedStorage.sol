pragma solidity ^0.4.23;

import "../libs/Ownable.sol";


contract ManagedStorage is Ownable {

    mapping(address => bool) public managerAddresses;

    event AddManager(address _newManagerAddress);
    event RemoveManager(address _managerAddress);

    modifier onlyManagers() {
        require(managerAddresses[msg.sender] == true, "Not registered Manager");
        _;
    }

    constructor(address[] _managerAddresses) public {
        setOwner(msg.sender);
        for (uint i = 0; i < _managerAddresses.length; i++) {
            managerAddresses[_managerAddresses[i]] = true;
            emit AddManager(_managerAddresses[i]);
        }
    }

    function addManager(address _newManagerAddress) public onlyOwner {
        managerAddresses[_newManagerAddress] = true;
        emit AddManager(_newManagerAddress);
    }

    function removeManager(address _managerAddress) public onlyOwner {
        managerAddresses[_managerAddress] = false;
        emit RemoveManager(_managerAddress);
    }
}
