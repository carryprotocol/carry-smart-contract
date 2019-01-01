pragma solidity ^0.4.23;

/**
* @dev 상점 정보를 기록하는 컨트랙트
*/
contract IStoreDataStorage {
    event StoreDataUpserted(
        uint _storeId,
        address _storeAddress,
        uint _storeLatitude,
        uint _storeLongitude,
        string _storeCategory);

    /**
    * @dev 상점 정보를 기록하는 함수
    * @param _storeId 상점 id
    * @param _storeAddress 상점의 이더리움 주소
    * @param _storeLatitude blur한 상점의 위도
    * @param _storeLongitude blur한 상점의 경도
    * @param _storeCategory 상점의 카테고리
    */
    function upsertData(
        uint _storeId,
        address _storeAddress,
        uint _storeLatitude,
        uint _storeLongitude,
        string _storeCategory
    ) public;
}
