pragma solidity ^0.4.23;

import './ECVerify.sol';

contract BrandTokenInterface {
	// bytes32: btKeys, keccak256(storeAddress, btId)
	// address: userAddress
	// bytes: hash
	mapping(bytes32 => mapping(address => bytes)) public signedBalances;
	mapping(bytes32 => mapping(address => bytes)) public signedSalts;
	mapping(bytes32 => mapping(address => bytes)) public storeSignedKeys;
	mapping(bytes32 => mapping(address => bytes)) public userSignedKeys;

	// key: userAddress
	mapping(address => bytes32[]) public btKeys;

	constructor(address _managerAddress) public {} // terminal manager

	// TODO: Choose modifier
	function updateBalance(
		bytes _signedBalance,
		bytes _signedSalt,
		bytes _storeSignedKey,
		bytes _userSignedKey,
		uint _uuid,
		uint _timestamp,
		bytes32 _btId
		) public onlyManager {}

}
