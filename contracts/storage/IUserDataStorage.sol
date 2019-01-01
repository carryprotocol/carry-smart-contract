pragma solidity ^0.4.23;

/**
* @dev 사용자 정보를 기록하는 컨트랙트
*/
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

    /**
    * @dev 사용자 정보를 기록하는 함수
    * @param _userId 사용자 id
    * @param _userAddress 사용자의 이더리움 주소
    * @param _userGender 사용자의 성별
    * @param _userBirthYear 사용자의 생년
    * @param _userBirthMonth 사용자의 생월
    * @param _userBirthDay 사용자의 생일
    * @param _userCountry 사용자의 국적
    * @param _userJob 사용자의 직업
    */
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
