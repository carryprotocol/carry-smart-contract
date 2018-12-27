pragma solidity ^0.4.23;

import "../ownable/ManagedStorage.sol";


contract PurchaseDataStorage is ManagedStorage {
    // key: purchaseId
    mapping(uint => uint) public userIds;
    mapping(uint => address) public userAddresses;

    // 결제 정보들
    mapping(uint => string) public paymentMethods;
    mapping(uint => uint) public createdAts;
    mapping(uint => uint) public storeLatitudes;
    mapping(uint => uint) public storeLongitudes;
    mapping(uint => bytes) public items;

    event UserDataUpserted(uint _purchaseId, uint _userId, address _userAddress, string _paymentMethod, uint _createdAt, uint _latitude, uint _longitude, bytes _items);

    /*
        json
        Item: [{ // convention을 정해야함
            string name,
            float price,
            string currency,
            int quantity
        }, {

        },
        ...
        ]을 serialize한 정보
    */
    constructor(address[] _appManagerAddress) public ManagedStorage(_appManagerAddress) {}

    function upsertData(
        uint _purchaseId,
        uint _userId,
        address _userAddress,
        string _paymentMethod,
        uint _createdAt,
        uint _storeLatitude,
        uint _storeLongitude,
        bytes _items
    ) public onlyManagers
    {
        userIds[_purchaseId] = _userId;
        userAddresses[_purchaseId] = _userAddress;
        paymentMethods[_purchaseId] = _paymentMethod;
        createdAts[_purchaseId] = _createdAt;
        storeLatitudes[_purchaseId] = _storeLatitude;
        storeLongitudes[_purchaseId] = _storeLongitude;
        items[_purchaseId] = _items;

        emit UserDataUpserted(_purchaseId, _userId, _userAddress, _paymentMethod, _createdAt, _storeLatitude, _storeLongitude, _items);
    }
}
