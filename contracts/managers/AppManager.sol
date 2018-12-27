pragma solidity ^0.4.23;

import "../storage/PurchaseDataStorage.sol";
import "../storage/UserDataStorage.sol";
import "../libs/ECVerify.sol";
import "../ownable/Manager.sol";


contract AppManager is Manager {
    PurchaseDataStorage public purchaseDataStorage;
    UserDataStorage public userDataStorage;

    event RegisterPurchaseDataStorage(address _purchaseDataStorage);
    event RegisterUserDataStorage(address _userDataStorage);
    event RewardTokenForPurchaseData(address _receiver, uint _amount);

    constructor(address[] _admins, address _tokenStake, address _carryToken) public Manager(_admins, _tokenStake, _carryToken) {
    }

    // TODO: if upgradeable, it goes to the constructor
    function registerPurchaseDataStorage(address _purchaseDataStorage) public onlyAdmins {
        purchaseDataStorage = PurchaseDataStorage(_purchaseDataStorage);
        emit RegisterPurchaseDataStorage(_purchaseDataStorage);
    }

    // TODO: if upgradeable, it goes to the constructor
    function registerUserDataStorage(address _userDataStorage) public onlyAdmins {
        userDataStorage = UserDataStorage(_userDataStorage);
        emit RegisterUserDataStorage(_userDataStorage);
    }

    function initialize(address _purchaseDataStorage, address _userDataStorage) public onlyAdmins {
        registerPurchaseDataStorage(_purchaseDataStorage);
        registerUserDataStorage(_userDataStorage);
    }

    function upsertPurchaseData(
        uint _purchaseId,
        uint _userId,
        string _paymentMethod,
        uint _createdAt,
        uint _storeLatitude,
        uint _storeLongitude,
        bytes _items,
        address _userAddress,
        bytes _userSignature
        ) public onlyAdmins
    {
        uint amount = calculateCRE(
            _purchaseId,
            _userId,
            _userAddress,
            _paymentMethod,
            _createdAt,
            _storeLatitude,
            _storeLongitude,
            _items
        );
        require(tokenStake.stake(address(this)) >= amount, "Not enough stake");

        bytes memory message = abi.encodePacked(
            _purchaseId,
            _userId,
            _paymentMethod,
            _createdAt,
            _storeLatitude,
            _storeLongitude,
            _items
        );
        ECVerify.ecverify(message, _userSignature, _userAddress);

        purchaseDataStorage.upsertData(
            _purchaseId,
            _userId,
            _userAddress,
            _paymentMethod,
            _createdAt,
            _storeLatitude,
            _storeLongitude,
            _items
        );

        if (amount > 0) {
            tokenStake.withdrawStake(_userAddress, amount);
            emit RewardTokenForPurchaseData(_userAddress, amount);
        }
    }

    function upsertUserData(
        uint _userId,
        string _userGender,
        uint _userBirthYear,
        uint _userBirthMonth,
        uint _userBirthDay,
        string _userCountry,
        string _userJob,
        address _userAddress,
        bytes _userSignature
        ) public onlyAdmins
    {
        bytes memory message = abi.encodePacked(
            _userId,
            _userGender,
            _userBirthYear,
            _userBirthMonth,
            _userBirthDay,
            _userCountry,
            _userJob
        );
        ECVerify.ecverify(message, _userSignature, _userAddress);

        userDataStorage.upsertData(
            _userId,
            _userAddress,
            _userGender,
            _userBirthYear,
            _userBirthMonth,
            _userBirthDay,
            _userCountry,
            _userJob
        );
    }

    function calculateCRE(
        uint _purchaseId,
        uint _userId,
        address _userAddress,
        string _paymentMethod,
        uint _createdAt,
        uint _storeLatitude,
        uint _storeLongitude,
        bytes _items
        ) public view returns(uint)
    {
        uint amount;

        // TODO: fill some logic depends on given data
        amount = 10; // 1 token for test
        //

        return amount;
    }
}
