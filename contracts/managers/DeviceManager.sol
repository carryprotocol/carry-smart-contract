pragma solidity ^0.4.23;

import "../storage/StoreDataStorage.sol";
import "../libs/ECVerify.sol";
import "../token/BrandToken.sol";
import "../ownable/Manager.sol";


contract DeviceManager is Manager {
    BrandToken public brandToken;
    StoreDataStorage public storeDataStorage;

    event RegisterStoreDataStorage(address _storeDataStorage);
    event RegisterBrandToken(address _brandToken);

    constructor(address[] _admins) public Manager(_admins) {
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

    function upsertStoreData(
        uint _storeId,
        uint _storeLatitude,
        uint _storeLongitude,
        string _storeCategory,
        address _storeAddress,
        bytes _storeSignature
        ) public onlyAdmins
    {
        bytes memory message = abi.encodePacked(
            _storeId,
            _storeLatitude,
            _storeLongitude,
            _storeCategory
        );
        ECVerify.ecverify(message, _storeSignature, _storeAddress);

        storeDataStorage.upsertData(
            _storeId,
            _storeAddress,
            _storeLatitude,
            _storeLongitude,
            _storeCategory
        );
    }
}
