pragma solidity ^0.4.23;

contract IPurchaseDataStorage {
    event UserDataUpserted(
        uint _purchaseId,
        uint _userId,
        address _userAddress,
        string _paymentMethod,
        uint _createdAt,
        uint _latitude,
        uint _longitude,
        bytes _items);

    function upsertData(
        uint _purchaseId,
        uint _userId,
        address _userAddress,
        string _paymentMethod,
        uint _createdAt,
        uint _storeLatitude,
        uint _storeLongitude,
        bytes _items) public;

}
