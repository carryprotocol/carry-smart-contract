pragma solidity ^0.4.23;

contract IUserDataStorage {
    event UserDataUpserted(
        uint _userId,
        address _userAddress,
        string _userGender,
        uint _userBirthYear,
        uint _userBirthMonth,
        uint _userBirthDay,
        string _userCountry,
        string _userJob);

    function upsertData(
        uint _userId,
        address _userAddress,
        string _userGender,
        uint _userBirthYear,
        uint _userBirthMonth,
        uint _userBirthDay,
        string _userCountry,
        string _userJob
    ) public;
}
