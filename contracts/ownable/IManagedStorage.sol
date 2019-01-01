pragma solidity ^0.4.23;

/**
* @dev 컨트랙트 권한을 나눠갖는 Manager들을 관리하는 컨트랙트
*/
contract IManagedStorage {

    event AddManager(address _newManagerAddress);
    event RemoveManager(address _managerAddress);

    /**
    * @dev Manager를 추가하는 함수
    * @param _newManagerAddress 새로운 manager의 주소
    */
    function addManager(address _newManagerAddress) public;

    /**
    * @dev Manager를 제거하는 함수
    * @param _managerAddress 제거할 manager의 주소
    */
    function removeManager(address _managerAddress) public;
}
