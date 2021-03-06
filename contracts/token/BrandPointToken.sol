pragma solidity ^0.4.23;

import "../libs/ECVerify.sol";
import "../ownable/ManagedStorage.sol";
import "./TokenStake.sol";


contract BrandPointToken is ManagedStorage {
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

    TokenStake public tokenStake;
    uint public minStakeBalance = 100; // TODO: should be fixed

    event BrandPointTokenUpserted(bytes32 _btKey, address _userAddress, uint _timestamp);
    event MinStakeBalanceChanged(uint newMinStakeBalance);

    constructor(address[] _deviceManagerAddresses, address _tokenStake) public ManagedStorage(_deviceManagerAddresses) {
        require(_tokenStake != address(0));
        tokenStake = TokenStake(_tokenStake);
    }

    function setMinStakeBalance(uint _minStakeBalance) public onlyOwner {
        require(_minStakeBalance >= 0);
        minStakeBalance = _minStakeBalance;
        emit MinStakeBalanceChanged(minStakeBalance);
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
        require(tokenStake.stake(msg.sender) >= minStakeBalance);
        require(creators[_btKey] == address(0) || creators[_btKey] == msg.sender, "Cannot access to other device manager's brand point token");

        // 처음 생성시만 byKeys에 추가한다.
        if (timestamps[_btKey][_userAddress] == 0) {
            btKeys[_userAddress].push(_btKey);
        }

        signedBalances[_btKey][_userAddress] = _signedBalance;
        signedSalts[_btKey][_userAddress] = _signedSalt;
        storeSignedKeys[_btKey][_userAddress] = _storeSignedKey;
        userSignedKeys[_btKey][_userAddress] = _userSignedKey;
        timestamps[_btKey][_userAddress] = _timestamp;
        creators[_btKey] = msg.sender;

        emit BrandPointTokenUpserted(_btKey, _userAddress, _timestamp);
    }

    function getAllBTKeys(address _user) public view returns(bytes32[]) {
        return btKeys[_user];
    }
}
