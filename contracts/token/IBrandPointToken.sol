pragma solidity ^0.4.23;

contract IBrandPointToken {
    event BrandPointTokenUpserted(bytes32 _btKey, address _userAddress, uint _timestamp);
    event MinStakeBalanceChanged(uint newMinStakeBalance);

    /**
    * @dev setMinStakeBalance 최소 stake 설정하는 함수
    * @param _minStakeBalance 설정하고자 하는 최소값
    */
    function setMinStakeBalance(uint _minStakeBalance) public;
    
    /**
    * @dev upsertBalance balance 설정 함수
    * @param _signedBalance sign 된 balance 값
    * @param _signedSalt sign 된 salt 값
    * @param _storeSignedKey 대칭 키를 store의 public key로 sign 한 값 
    * @param _userSignedKey 대칭 키를 user의 public key로 sign 한 값
    * @param _timestamp message 가 발급된 시간
    * @param _btKey brand token key
    * @param _userAddress 사용자 address
    */
    function upsertBalance(
        bytes _signedBalance,
        bytes _signedSalt,
        bytes _storeSignedKey,
        bytes _userSignedKey,
        uint _timestamp,
        bytes32 _btKey,
        address _userAddress
    ) public;

    /**
    * @dev _user 에 할당된 모든 BTKey를 반환하는 함수
    * @param _user BTKey를 찾을 user address
    */
    function getAllBTKeys(address _user) public view returns(bytes32[]);
}
