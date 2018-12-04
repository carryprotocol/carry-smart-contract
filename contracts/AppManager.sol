pragma solidity ^0.4.23;

import './PurchaseData.sol';
import './UserData.sol';
import './ECVerify.sol';

contract AppManager {
	mapping(address => bool) public admins;
	mapping(address => uint) public uuids;

	PurchaseData public purchaseDataStorage;
	UserData public userDataStorage;

	constructor(address[] _admins, uint[] _uuids) public {}

	function registerAdmin(address _newAdmin, uint _uuid) public onlyAdmins {}

	// if upgradeable, it goes to the constructor
	function registerStorage(address _purchaseData, address _userData) public onlyAdmins {}

	function upsertPurchaseData(
		uint _purchaseId,
		// datas...
		bytes _signature
		) public onlyAdmins {

		// verify signature with information

		purchaseDataStorage.upsertData(...)

		_calculateCRE(...);
	}

	function upsertUserData(
		uint _userId,
		// datas...
		string _userCountry,
		bytes _signature // signature 어떻게 뽑을 것이고 어떻게 검증할 것인가
		) public onlyAdmins {

		// verify

		userDataStorage.upsertData(...)
	}

	function _calculateCRE(
		uint _userId,
		address _userAddress,
		string _paymentMethod,
		uint _createdAt,
		uint _latitude,
		uint _longitude,
		bytes _itemInfo) internal {}


}