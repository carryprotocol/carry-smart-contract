pragma solidity ^0.4.23;

import "../storage/StoreDataStorage.sol";
import "../libs/ECVerify.sol";
import "../token/BrandPointToken.sol";
import "../ownable/Manager.sol";

/**
* @dev Device Provider가 관리하는 컨트랙트, BT를 발행하고 store 정보를 기록
*/
contract IDeviceManager {

    event RegisterStoreDataStorage(address _storeDataStorage);
    event RegisterBrandPointToken(address _brandPointToken);

    /**
    * @dev StoreDataStorage의 주소를 등록하는 함수
    * @param _storeDataStorage 등록할 StoreDataStorage의 주소
    */
    function registerStoreDataStorage(address _storeDataStorage) public;

    /**
    * @dev BrandPointToken의 주소를 등록하는 함수
    * @param _brandPointToken 등록할 BrandPointToken의 주소
    */
    function registerBrandPointToken(address _brandPointToken) public;

    /**
    * @dev registerStoreDataStorage와 registerBrandPointToken을 같이 실행하는 초기화 함수
    * @param _storeDataStorage 등록할 StoreDataStorage의 주소
    * @param _brandPointToken 등록할 BrandPointToken의 주소
    */
    function initialize(address _storeDataStorage, address _brandPointToken) public;

    /**
    * @dev Brand Point Token을 발행하는 함수
    * @param _signedBalance 동형키로 암호화된 user의 현재 BT 수량
    * @param _signedSalt 동형키로 암호화된 salt 값
    * @param _storeSignedSymKey store의 비밀키로 암호화된 동형 암호 키
    * @param _userSignedSymKey user의 비밀키로 암호화된 동형 암호 키
    * @param _timestamp BT 발행 시각
    * @param _btKey BT의 고유 id
    * @param _userAddress user의 주소
    * @param _storeAddress store의 주소
    * @param _storeSignature store가 생성한 사인
    */
    function upsertBalance(
        bytes _signedBalance,
        bytes _signedSalt,
        bytes _storeSignedSymKey,
        bytes _userSignedSymKey,
        uint _timestamp,
        bytes32 _btKey,
        address _userAddress,
        address _storeAddress,
        bytes _storeSignature
        ) public;

    /**
    * @dev 상점 정보를 기록하는 함수
    * @param _storeId 상점 id
    * @param _storeLatitude blur한 상점의 위도
    * @param _storeLongitude blur한 상점의 경도
    * @param _storeCategory 상점의 카테고리
    * @param _storeAddress 상점의 이더리움 주소
    * @param _storeSignature 상점이 생성한 사인
    */
    function upsertStoreData(
        uint _storeId,
        uint _storeLatitude,
        uint _storeLongitude,
        string _storeCategory,
        address _storeAddress,
        bytes _storeSignature
        ) public;
}
