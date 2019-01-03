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

    /**
    * @dev 구매 정보를 블록체인에 올리기 위한 함수
    * @param _purchaseId 구매 id
    * @param _userId 사용자 id
    * @param _paymentMethod 결제 수단
    * @param _createdAt 결제시간
    * @param _storeLatitude 상점의 위도
    * @param _storeLongitude 상점의 경도
    * @param _items 구매한 상품들
    * @param _sigHash hash(signature)
    * @notice onlyManagers modifier
    */
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
        ) public;

    /**
    * @dev 제공 정보에 따라 받을 수 있는 보상을 계산하는 함수
    * @param _paymentMethod 결제 수단
    * @param _createdAt 결제시간
    * @param _storeLatitude 상점의 위도
    * @param _storeLongitude 상점의 경도
    * @param _items 구매한 상품들
    * @return amount 보상 정도
    */
    function calculateCRE(
         string _paymentMethod,
         uint _createdAt,
         uint _storeLatitude,
         uint _storeLongitude,
         bytes _items
    ) public view returns(uint amount);

}
