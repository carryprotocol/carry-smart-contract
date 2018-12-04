pragma solidity ^0.4.23;

import './StoreData.sol';
import './ECVerify.sol';
import './BrandTokenInterface.sol';

contract TerminalManager {
	BrandTokenInterface public brandToken;
	StoreData public storeDataStorage;

	mapping(address => bool) public admins;
	mapping(address => uint) public uuids;

	constructor(address[] _admins, uint[] _uuids) public {}

	function registerAdmin(address _newAdmin, uint _uuid) public onlyAdmins {}

	// if upgradeable, it goes to the constructor
	function registerStorage(address _storeData) public onlyAdmins {}

	function updateBalance(
		bytes _balanceSig,
		bytes _saltSig,
		bytes _storeSignedKeySig,
		bytes _userSignedKeySig,
		bytes _balance,
		bytes _salt,
		bytes _storeSignedKey,
		bytes _userSignedKey,
		address _storeAddress,
		uint _uuid,
		uint _timestamp,
		bytes32 _btId
		) public onlyAdmins {
		// verifying
		// storing
		brandToken.updateBalance(_balance, _salt, _storeSignedKey, _userSignedKey, _uuid, _timestamp, _btId);
	}

	function upsertStoreData(
		uint _storeId,
		// store datas...
		bytes _signature
		) public onlyAdmins {
		// verifying

		storeDataStorage.upsertData(...)
	}

}