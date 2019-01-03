pragma solidity ^0.4.23;

import "../ownable/ManagedStorage.sol";
import "./IPurchaseDataStorage.sol";
import "../token/CarryToken.sol";


contract PurchaseDataStorage is ManagedStorage, IPurchaseDataStorage {
    // key: purchaseId
    mapping(uint => uint) public userIds;
    mapping(uint => address) public userAddresses;

    // 결제 정보들
    mapping(uint => string) public paymentMethods;
    mapping(uint => uint) public createdAts;
    mapping(uint => uint) public storeLatitudes;
    mapping(uint => uint) public storeLongitudes;
    mapping(uint => bytes) public items;

    // signiture hash
    mapping(bytes32 => bool) public sigHash;

    CarryToken public carryToken;

    event UserDataUpserted(uint _purchaseId, uint _userId,
    address _userAddress, string _paymentMethod, uint _createdAt, uint _latitude, uint _longitude, bytes _items);

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
    constructor(address[] _appManagerAddress, address _carryToken) public ManagedStorage(_appManagerAddress) {
        carryToken = CarryToken(_carryToken);
    }

    function upsertData(
        uint _purchaseId,
        uint _userId,
        address _userAddress,
        string _paymentMethod,
        uint _createdAt,
        uint _storeLatitude,
        uint _storeLongitude,
        bytes _items,
        bytes32 _sigHash
    ) public onlyManagers
    {
        require(_userAddress != address(0), "user address should be non zero address");
        require(sigHash[_sigHash] != true, "sigHash must be unique");

        userIds[_purchaseId] = _userId;
        userAddresses[_purchaseId] = _userAddress;
        paymentMethods[_purchaseId] = _paymentMethod;
        createdAts[_purchaseId] = _createdAt;
        storeLatitudes[_purchaseId] = _storeLatitude;
        storeLongitudes[_purchaseId] = _storeLongitude;
        items[_purchaseId] = _items;

        carryToken.mint(_userAddress, calculateCRE(
            _paymentMethod,
            _createdAt,
            _storeLatitude,
            _storeLongitude,
            _items));

        sigHash[_sigHash] = true;

        emit UserDataUpserted(
            _purchaseId,
            _userId,
            _userAddress,
            _paymentMethod,
            _createdAt,
            _storeLatitude,
            _storeLongitude,
            _items);
    }

    function calculateCRE(
        string _paymentMethod,
        uint _createdAt,
        uint _storeLatitude,
        uint _storeLongitude,
        bytes _items
    ) public view returns (uint)
    {
        return 5; // TODO modify it to more graceful logic
    }
}
