pragma solidity ^0.4.23;

import "../ownable/ManagedStorage.sol";
import "./IStoreDataStorage.sol";


contract StoreDataStorage is ManagedStorage, IStoreDataStorage {
    // key: storeId
    mapping(uint => address) public storeAddresses;
    mapping(uint => uint) public storeLatitudes;
    mapping(uint => uint) public storeLongitudes;
    mapping(uint => string) public storeCategories;

    constructor(address[] _deviceManagerAddresses) public ManagedStorage(_deviceManagerAddresses) {
    }

    function upsertData(
        uint _storeId,
        address _storeAddress,
        uint _storeLatitude,
        uint _storeLongitude,
        string _storeCategory
    ) public onlyManagers
    {

        storeAddresses[_storeId] = _storeAddress;
        storeLatitudes[_storeId] = _storeLatitude;
        storeLongitudes[_storeId] = _storeLongitude;
        storeCategories[_storeId] = _storeCategory;

        emit StoreDataUpserted(_storeId, _storeAddress, _storeLatitude, _storeLongitude, _storeCategory);
    }

    // TODO: remove를 따로 둘 것인가?
    // gas_remove: 15000, gas_sstore: 20000
    // TODO: 저장할 때 같으면 넣지 않는 filtering (gas optimization)
}
