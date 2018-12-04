pragma solidity ^0.4.23;

import './ECVerify.sol';

contract BrandTokenInterface {
	// bytes32: keccak256(storeAddress, btId)
	// address: userAddress
	// bytes: hash
	mapping(bytes32 => mapping(address => bytes)) public balances;
	mapping(bytes32 => mapping(address => bytes)) public salts;
	mapping(bytes32 => mapping(address => bytes)) public storeSignedKeys;
	mapping(bytes32 => mapping(address => bytes)) public userSignedKeys;

	mapping(address => bytes32[]) public btIds;

	constructor(address _managerAddress) public {} // terminal manager

	// TODO: Choose modifier
	function updateBalance(
		bytes _balance,
		bytes _salt,
		bytes _storeSignedKey,
		bytes _userSignedKey,
		uint _uuid,
		uint _timestamp,
		bytes32 _btId
		) public onlyManager {}

}