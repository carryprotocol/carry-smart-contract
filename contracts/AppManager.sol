//pragma solidity ^0.4.23;
//
//import './PurchaseDataStorage.sol';
//import './UserDataStorage.sol';
//import './ECVerify.sol';
//
//contract AppManager {
//
//	PurchaseDataStorage public purchaseDataStorage;
//	UserDataStorage public userDataStorage;
//
//	// 해당 address가 승인된 App Manager인가?
//	mapping(address => bool) public admins;
//
//	constructor(address[] _admins) public {}
//
//	function registerAdmin(address _newAdmin) public onlyAdmins {}
//
//	// if upgradeable, it goes to the constructor
//	function registerPurchaseDataStorage(address _purchaseDataStorage) public onlyAdmins {}
//	function registerUserDataStorage(address _userDataStorage) public onlyAdmins {}
//
//	function upsertPurchaseData(
//		uint _purchaseId,
//		// datas...
//		bytes _signature
//		) public onlyAdmins {
//
//		// verify signature with information
//
//		purchaseDataStorage.upsertData(datas...);
//
//		uint amount = _calculateCRE(datas...);
//		_transferCRE(amount, userAddress); //
//	}
//
//	function upsertUserData(
//		uint _userId,
//		// datas...
//		bytes _signature // signature 어떻게 뽑을 것이고 어떻게 검증할 것인가 => bytes로 다 바꿔서 concate해서 sing한걸 쓰자
//		) public onlyAdmins {
//
//		// verify
//
//		userDataStorage.upsertData(datas...);
//	}
//
//	function _calculateCRE(
//		uint _userId,
//		address _userAddress,
//		string _paymentMethod,
//		uint _createdAt,
//		uint _latitude,
//		uint _longitude,
//		bytes _itemInfo) internal returns(uint amount){}
//
//	function _transferCRE(uint _amount, address _userAddress) internal {}
//
//}
