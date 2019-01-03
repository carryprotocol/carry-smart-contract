pragma solidity ^0.4.23;


contract ICarryToken {
    /**
    @dev cap을 반환하는 함수
    TODO: cap도 필요 없나?
    */
    function cap() public view;
    /**
    @dev 토큰 전송 pause를 해제하는 함수
    */
    function unpause() public view;
    /**
    @dev 토큰을 새로 발행하는 함수
    @param _to 토큰이 입금되는 주소
    @param _amount 새로 발행할 토큰의 수
    @notice TODO: 이거 최대 발행량 제한 없애야 할듯?
    */
    function mint(address _to, uint256 _amount) public;
}
