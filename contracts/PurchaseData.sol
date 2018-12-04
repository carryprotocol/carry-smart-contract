pragma solidity ^0.4.23;

contract PurchaseData {
	// key: purchaseId
	mapping(uint => uint) public userId;
	mapping(uint => address) public userAddress;
	mapping(uint => string) public paymentMethod;
	mapping(uint => uint) public createdAt;
	mapping(uint => uint) public latitude;
	mapping(uint => uint) public longitude;
	mapping(uint => bytes) public itemInfo;

	address public managerAddress;

/*
	Item: [{
		string name;
		uint price; // ISSUE: 달러의 경우 0.5$ 이런게 있는데 string으로 해야하나
		string currency;
		uint quantity;
	}, {
	
	},
	...
	]을 serialize한 정보
*/
	constructor(address _managerAddress) public {}

	function upsertData(
		uint _purchaseId,
		uint _userId,
		address _userAddress,
		string _paymentMethod,
		uint _createdAt,
		uint _latitude,
		uint _longitude,
		bytes _itemInfo
		) public onlyManager {}

	// + 각각에 대한 setter
}