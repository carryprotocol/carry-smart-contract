pragma solidity ^0.4.23;

import "./StoreDataStorage.sol";
import "./libs/ECVerify.sol";
import "./libs/SafeMath.sol";
import "./BrandToken.sol";


contract DeviceManager {
    using SafeMath for uint;

    BrandToken public brandToken;
    StoreDataStorage public storeDataStorage;

    mapping(address => bool) public admins;
    uint public adminNumber = 0;

    event RegisterAdmin(address _newAdmin, uint _adminNumber);
    event RemoveAdmin(address _admin, uint _adminNumber);
    event RegisterStoreDataStorage(address _storeDataStorage);
    event RegisterBrandToken(address _brandToken);

    modifier onlyAdmins() {
        require(admins[msg.sender] == true, "Wrong admin");
        _;
    }

    constructor(address[] _admins) public {
        for (uint i = 0; i < _admins.length; i++) {
            admins[_admins[i]] = true;
        }
        adminNumber = _admins.length;
    }

    function registerAdmin(address _newAdmin) public onlyAdmins {
        require(admins[_newAdmin] == false, "Already exist");
        admins[_newAdmin] = true;
        adminNumber = adminNumber.add(1);
        emit RegisterAdmin(_newAdmin, adminNumber);
    }

    function removeAdmin(address _admin) public onlyAdmins {
        require(adminNumber > 1, "Can not remove all admins");
        require(admins[_admin] == true, "Not registered");
        admins[_admin] = false;
        adminNumber = adminNumber.sub(1);
        emit RemoveAdmin(_admin, adminNumber);
    }

    function initialize(address _storeDataStorage, address _brandToken) public onlyAdmins {
        registerStoreDataStorage(_storeDataStorage);
        registerBrandToken(_brandToken);
    }

    // TODO: If upgradeable, it goes to the constructor
    function registerStoreDataStorage(address _storeDataStorage) public onlyAdmins {
        storeDataStorage = StoreDataStorage(_storeDataStorage);
        emit RegisterStoreDataStorage(_storeDataStorage);
    }

    // TODO: If upgradeable, it goes to the constructor
    function registerBrandToken(address _brandToken) public onlyAdmins {
        brandToken = BrandToken(_brandToken);
        emit RegisterBrandToken(_brandToken);
    }

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
        ) public onlyAdmins
	{

        bytes memory message = abi.encodePacked(
			_signedBalance,
			_signedSalt,
			_storeSignedSymKey,
			_userSignedSymKey,
			_timestamp,
			_btKey,
			_userAddress
        );
        ECVerify.ecverify(message, _storeSignature, _storeAddress);

        brandToken.upsertBalance(
			_signedBalance,
			_signedSalt,
			_storeSignedSymKey,
			_userSignedSymKey,
			_timestamp,
			_btKey,
			_userAddress
        );
    }

//    function upsertStoreData(
//        uint _storeId,
//        address _storeAddress,
//        string _storeName,
//        uint _storeLatitude,
//        uint _storeLongitude,
//        string _storeCategory,
//        bytes _signature
//        ) public onlyAdmins {
//        // verifying
//
//        storeDataStorage.upsertData(...);
//    }

}
