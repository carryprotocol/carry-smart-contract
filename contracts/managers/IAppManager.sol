pragma solidity ^0.4.23;


contract IAppManager {

    event RegisterPurchaseDataStorage(address _purchaseDataStorage);
    event RegisterUserDataStorage(address _userDataStorage);
    event RewardTokenForPurchaseData(address _receiver, uint _amount);

    /**
    * @dev PurchageDataStorage 컨트랙트 주소를 등록하는 함수
    * @param _purchaseDataStorage purchaseDataStorage의 주소
    */
    function registerPurchaseDataStorage(address _purchaseDataStorage) public;

    /**
    * @dev RegisterUserDataStorag 컨트랙트 주소를 등록하는 함수
    * @param _userDataStorage registerUserDataStorage의 주소
    */
    function registerUserDataStorage(address _userDataStorage) public;

    /**
    * @dev USCF에서 초기화를 위한 함수, registerPurchaseDataStorage와 registerUserDataStorage를 수행
    * @param _purchaseDataStorage purchaseDataStorage의 주소
    * @param _userDataStorage registerUserDataStorage의 주소
    */
    function initialize(address _purchaseDataStorage, address _userDataStorage) public;

    /**
    * @dev 구매 정보를 블록체인에 올리기 위한 함수
    * @param _purchaseId 구매 id
    * @param _userId 사용자 id
    * @param _paymentMethod 결제 수단
    * @param _createdAt 결제시간
    * @param _storeLatitude 상점의 위도
    * @param _storeLongitude 상점의 경도
    * @param _items 구매한 상품들
    * @param _userAddress 사용자의 이더리움 주소
    * @param _userSignature 사용자의 서명
    */
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
        ) public;

    /**
    * @dev 사용자 정보를 블록체인에 올리기 위한 함수
    * @param _userId 사용자 id
    * @param _userGender 사용자의 성별
    * @param _userBirthYear 사용자의 생년
    * @param _userBirthMonth 사용자의 생월
    * @param _userBirthDay 사용자의 생일
    * @param _userCountry 사용자의 국적
    * @param _userJob 사용자의 직업
    * @param _userAddress 사용자의 이더리움 주소
    * @param _userSignature 사용자의 서명
    */
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
        ) public;
}
