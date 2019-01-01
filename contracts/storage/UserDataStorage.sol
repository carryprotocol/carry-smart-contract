pragma solidity ^0.4.23;

import "../ownable/ManagedStorage.sol";
import "./IUserDataStorage.sol";


contract UserDataStorage is ManagedStorage, IUserDataStorage {
    // key: userId
    mapping(uint => address) public userAddresses;
    mapping(uint => string) public userGenders;
    mapping(uint => uint) public userBirthYears; // timestamp
    mapping(uint => uint) public userBirthMonths; // timestamp
    mapping(uint => uint) public userBirthDays; // timestamp
    mapping(uint => string) public userCountries; // 거주 지역
    mapping(uint => string) public userJobs; // 직장

    constructor(address[] _appManagerAddress) public ManagedStorage(_appManagerAddress) {}

    function upsertData(
        uint _userId,
        address _userAddress,
        string _userGender,
        uint _userBirthYear,
        uint _userBirthMonth,
        uint _userBirthDay,
        string _userCountry,
        string _userJob
    ) public onlyManagers
    {
        userAddresses[_userId] = _userAddress;
        userGenders[_userId] = _userGender;
        userBirthYears[_userId] = _userBirthYear;
        userBirthMonths[_userId] = _userBirthMonth;
        userBirthDays[_userId] = _userBirthDay;
        userCountries[_userId] = _userCountry;
        userJobs[_userId] = _userJob;

        emit UserDataUpserted(_userId, _userAddress, _userGender, _userBirthYear, _userBirthMonth, _userBirthDay, _userCountry, _userJob);
    }
}
