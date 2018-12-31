pragma solidity ^0.4.23;

contract IStoreDataStorage {
    event StoreDataUpserted(
        uint _storeId,
        address _storeAddress,
        uint _storeLatitude,
        uint _storeLongitude,
        string _storeCategory);

    function upsertData(
        uint _storeId,
        address _storeAddress,
        uint _storeLatitude,
        uint _storeLongitude,
        string _storeCategory
    ) public;
}
