pragma solidity ^0.4.23;

contract UserData {
	// key: userId
	mapping(uint => address) public userAddress;
	mapping(uint => string) public userGender;
	mapping(uint => uint) public userBirthYear; // timestamp
	mapping(uint => uint) public userBirthMonth; // timestamp
	mapping(uint => uint) public userBirthDay; // timestamp
	mapping(uint => string) public userCountry; // 거주 지역
	mapping(uint => string) public userJob;

	address public managerAddress;

	constructor(address _managerAddress) public {}

	function upsertData(
		uint _userId,
		address _userAddress,
		string _userGender,
		uint _userBirthYear,
		uint _userBirthMonth,
		uint _userBirthDay,
		string _userCountry
		) public onlyManager {}

	// + 각각에 대한 setter
}