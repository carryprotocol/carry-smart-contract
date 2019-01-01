pragma solidity ^0.4.24;

/**
* @dev AppManager와 DeviceManager 컨트랙트들의 부모 컨트랙트. 권한관리등의 공통 작업에 대해 구현
*/
contract IManager {

    event RegisterAdmin(address _newAdmin, uint _adminNumber);
    event RemoveAdmin(address _admin, uint _adminNumber);

    /**
    * @dev Admin을 추가하는 함수
    * @param _newAdmin 새로운 admin의 주소
    */
    function registerAdmin(address _newAdmin) public;

    /**
    * @dev 등록된 admin을 제거하는 함수
    * @param _admin 제거할 admin의 주소
    */
    function removeAdmin(address _admin) public;

    /**
    * @dev 해당 manager의 address로 예치된 담보를 모두 출금하는 함수
    * @param _receiver 출금한 담보를 받을 주소
    */
    function withdrawAllStake(address _receiver) public;
}
