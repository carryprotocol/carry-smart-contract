pragma solidity ^0.4.23;

import "./libs/ECVerify.sol";
import "./libs/Ownable.sol";


contract BrandToken is Ownable {
    // bytes32: btKeys, keccak256(storeAddress, btId)
    // address: userAddress
    // bytes: hash
    mapping(bytes32 => mapping(address => bytes)) public signedBalances;
    mapping(bytes32 => mapping(address => bytes)) public signedSalts;
    mapping(bytes32 => mapping(address => bytes)) public storeSignedKeys;
    mapping(bytes32 => mapping(address => bytes)) public userSignedKeys;
    mapping(bytes32 => mapping(address => uint)) public timestamps;
    // BrandToken의 메타데이터(이미지, url 등)를 단말기 사업자로부터 가져오기 위해서 단말기 사업자의 정보를 저장
    mapping(bytes32 => address) public creators;

    // key: userAddress
    mapping(address => bytes32[]) public btKeys;
    mapping(address => bool) public deviceManagerAddresses;

    event BrandTokenUpserted(bytes32 _btKey, address _userAddress, uint _timestamp);
    event AddDeviceManager(address _newDeviceManagerAddress);
    event RemoveDeviceManger(address _deviceManagerAddress);

    modifier onlyManagers() {
        require(deviceManagerAddresses[msg.sender] == true, "Not registered Manager");
        _;
    }

    constructor(address[] _deviceManagerAddresses) public {
        setOwner(msg.sender);
        for (uint i = 0; i < _deviceManagerAddresses.length; i++) {
            deviceManagerAddresses[_deviceManagerAddresses[i]] = true;
        }
    }

    function addDeviceManager(address _newDeviceManagerAddress) public onlyOwner {
        deviceManagerAddresses[_newDeviceManagerAddress] = true;
        emit AddDeviceManager(_newDeviceManagerAddress);
    }

    function removeDeviceManager(address _deviceManagerAddress) public onlyOwner {
        deviceManagerAddresses[_deviceManagerAddress] = false;
        emit RemoveDeviceManger(_deviceManagerAddress);
    }

    function upsertBalance(
        bytes _signedBalance,
        bytes _signedSalt,
        bytes _storeSignedKey,
        bytes _userSignedKey,
        uint _timestamp,
        bytes32 _btKey,
        address _userAddress
        ) public onlyManagers
	{
        if (creators[_btKey] != address(0)) {
            require(creators[_btKey] == msg.sender, "Cannot access to other device manager's brand token");
        }

		if (timestamps[_btKey][_userAddress] == 0) {
			btKeys[_userAddress].push(_btKey);
		}

        signedBalances[_btKey][_userAddress] = _signedBalance;
        signedSalts[_btKey][_userAddress] = _signedSalt;
        storeSignedKeys[_btKey][_userAddress] = _storeSignedKey;
        userSignedKeys[_btKey][_userAddress] = _userSignedKey;
        timestamps[_btKey][_userAddress] = _timestamp;
        creators[_btKey] = msg.sender;

        emit BrandTokenUpserted(_btKey, _userAddress, _timestamp);
    }

    function getAllBTKeys(address _user) public view returns(bytes32[]) {
        return btKeys[_user];
    }
}
