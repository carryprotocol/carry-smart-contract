pragma solidity ^0.4.23;

import './libs/ECVerify.sol';

contract BrandToken {
	// bytes32: btKeys, keccak256(storeAddress, btId)
	// address: userAddress
	// bytes: hash
	mapping(bytes32 => mapping(address => bytes)) public signedBalances;
	mapping(bytes32 => mapping(address => bytes)) public signedSalts;
	mapping(bytes32 => mapping(address => bytes)) public storeSignedKeys;
	mapping(bytes32 => mapping(address => bytes)) public userSignedKeys;
	mapping(bytes32 => mapping(address => uint)) public timestamps; // TODO: timestamps랑 creators fix하자
	mapping(bytes32 => mapping(address => address)) public creators;

	// key: userAddress
	mapping(address => bytes32[]) public btKeys;

	address public deviceManagerAddress;

	modifier onlyManager() {
		require(msg.sender == deviceManagerAddress);
		_;
	}

	constructor(address _deviceManagerAddress) public {
		deviceManagerAddress = _deviceManagerAddress;
	} // TODO: upgradeable이면 상관 없긴한데 그래도 권한 갈아치우는 건 필요하려나?

	// TODO: Choose modifier
	function updateBalance(
		bytes _signedBalance,
		bytes _signedSalt,
		bytes _storeSignedKey,
		bytes _userSignedKey,
		address _deviceManager,
		uint _timestamp,
		bytes32 _btKey,
		address _userAddress
		) public onlyManager {

		signedBalances[_btKey][_userAddress] = _signedBalance;
		signedSalts[_btKey][_userAddress] = _signedSalt;
		storeSignedKeys[_btKey][_userAddress] = _storeSignedKey;
		userSignedKeys[_btKey][_userAddress] = _userSignedKey;
		timestamps[_btKey][_userAddress] = _timestamp; // TODO: timestamp 이렇게 할 것인가?
		creators[_btKey][_userAddress] = _deviceManager; // TODO: timestamp 이렇게 할 것인가?

		btKeys[_userAddress].push(_btKey); // TODO: update 되면 이전 bt는 필요하지 않는데 삭제할 것인가?
	}
}
