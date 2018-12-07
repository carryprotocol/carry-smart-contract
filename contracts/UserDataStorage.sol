//pragma solidity ^0.4.23;
//
//contract UserDataStorage {
//	// key: userId
//	mapping(uint => address) public userAddresses;
//	mapping(uint => string) public userGenders;
//	mapping(uint => uint) public userBirthYears; // timestamp
//	mapping(uint => uint) public userBirthMonths; // timestamp
//	mapping(uint => uint) public userBirthDays; // timestamp
//	mapping(uint => string) public userCountries; // 거주 지역
//	mapping(uint => string) public userJobs; // 직장
//
//	address public managerAddress;
//
//	constructor(address _managerAddress) public {}
//
//	function upsertData(
//		uint _userId,
//		address _userAddress,
//		string _userGender,
//		uint _userBirthYear,
//		uint _userBirthMonth,
//		uint _userBirthDay,
//		string _userCountry
//		) public onlyManager {}
//
//	// + 각각에 대한 setter
//}
