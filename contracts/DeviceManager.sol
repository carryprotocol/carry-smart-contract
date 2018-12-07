pragma solidity ^0.4.23;

import './StoreDataStorage.sol';
import './libs/ECVerify.sol';
import './BrandToken.sol';

contract DeviceManager {
	BrandToken public brandToken;
	StoreDataStorage public storeDataStorage;

	mapping(address => bool) public admins;

	event BrandTokenCreated(bytes32 _btKey, address _user, uint _timestamp); // TODO: have to finalize events

	modifier onlyAdmins() {
		require(admins[msg.sender] == true);
		_;
	}

	constructor(address[] _admins) public {
		for (uint i = 0; i < _admins.length; i++) {
			admins[_admins[i]] = true;
		}
	}

	function registerAdmin(address _newAdmin) public onlyAdmins {
		admins[_newAdmin] = true;
	} // TODO: Multi-sig 형식으로 할까? 서로의 권한 관리를 어떻게 할 것인가?

	// TODO: If upgradeable, it goes to the constructor
	function registerStoreDataStorage(address _storeDataStorage) public onlyAdmins {
		storeDataStorage = StoreDataStorage(_storeDataStorage);
	}

	// TODO: If upgradeable, it goes to the constructor
	function registerBrandToken(address _brandToken) public onlyAdmins {
		brandToken = BrandToken(_brandToken);
	}

	function updateBalance( // TODO: gas가 적다면 signature 다 붙여서 하는걸로
		bytes _signedBalanceSig,
		bytes _signedSaltSig,
		bytes _storeSignedKeySig,
		bytes _userSignedKeySig,
		bytes _signedBalance,
		bytes _signedSalt,
		bytes _storeSignedKey,
		bytes _userSignedKey,
		address _storeAddress,
		uint _timestamp, // TODO: timestamp랑 btKey에는 사인이 필요없을까?
		bytes32 _btKey,
		address _userAddress // TODO: userAddress store가 알고 있으니 sign해서 보내는게 맞지 않을까?
		) public onlyAdmins {

		// TODO: verifying
		ECVerify.ecverify(_signedBalance, _signedBalanceSig, _storeAddress);
		ECVerify.ecverify(_signedSalt, _signedSaltSig, _storeAddress);
		ECVerify.ecverify(_storeSignedKey, _storeSignedKeySig, _storeAddress);
		ECVerify.ecverify(_userSignedKey, _userSignedKeySig, _storeAddress);

		// TODO: storing
		brandToken.updateBalance(_signedBalance, _signedSalt, _storeSignedKey, _userSignedKey, msg.sender, _timestamp, _btKey, _userAddress);

		emit BrandTokenCreated(_btKey, _userAddress, _timestamp);
	}

//	function upsertStoreData(
//		uint _storeId,
//		address _storeAddress,
//		string _storeName,
//		uint _storeLatitude,
//		uint _storeLongitude,
//		string _storeCategory,
//		bytes _signature
//		) public onlyAdmins {
//		// verifying
//
//		storeDataStorage.upsertData(...);
//	}

}
