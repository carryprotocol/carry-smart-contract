pragma solidity ^0.4.23;

contract StoreData {
	// key: storeId
	mapping(uint => address) public storeAddress;
	mapping(uint => string) public storeName;
	mapping(uint => uint) public storeLatitude;
	mapping(uint => uint) public storeLongitude;
	mapping(uint => string) public storeCategory;

	address public managerAddress;

	constructor(address _managerAddress) public {}

	function upsertData(
		uint _storeId,
		address _storeAddress,
		string _storeName,
		uint _storeLatitude,
		uint _storeLongitude,
		string _storeCategory
		) public onlyManager {}

	// + 각각에 대한 setter
}