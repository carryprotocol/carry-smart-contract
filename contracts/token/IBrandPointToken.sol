pragma solidity ^0.4.23;

contract IBrandPointToken {
    event BrandPointTokenUpserted(bytes32 _btKey, address _userAddress, uint _timestamp);
    event MinStakeBalanceChanged(uint newMinStakeBalance);

    function setMinStakeBalance(uint _minStakeBalance) public;

    function upsertBalance(
        bytes _signedBalance,
        bytes _signedSalt,
        bytes _storeSignedKey,
        bytes _userSignedKey,
        uint _timestamp,
        bytes32 _btKey,
        address _userAddress
    ) public;

    function getAllBTKeys(address _user) public view returns(bytes32[]);
}
