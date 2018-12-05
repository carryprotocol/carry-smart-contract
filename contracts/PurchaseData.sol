//pragma solidity ^0.4.23;
//
//contract PurchaseData {
//	// key: purchaseId
//	mapping(uint => uint) public userIds;
//	mapping(uint => address) public userAddresses;
//
//	// 결제 정보들
//	mapping(uint => string) public paymentMethods;
//	mapping(uint => uint) public createdAts;
//	mapping(uint => uint) public storeLatitudes;
//	mapping(uint => uint) public storeLongitudes;
//	mapping(uint => bytes) public items;
//
//	address public managerAddress;
//
///*
//	json
//	Item: [{ // convention을 정해야함
//		string name,
//		float price,
//		string currency,
//		int quantity
//	}, {
//
//	},
//	...
//	]을 serialize한 정보
//*/
//	constructor(address _managerAddress) public {}
//
//	function upsertData(
//		uint _purchaseId,
//		uint _userId,
//		address _userAddress,
//		string _paymentMethod,
//		uint _createdAt,
//		uint _latitude,
//		uint _longitude,
//		bytes _items
//		) public onlyManager {}
//
//	// + 각각에 대한 setter
//}
