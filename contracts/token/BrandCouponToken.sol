pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Metadata.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./IBrandCouponToken.sol";
import "../libs/Ownable.sol";


contract BrandCouponToken is ERC721Metadata, Ownable, IBrandCouponToken{
    using SafeMath for uint;

    ITokenStake public tokenStake;
    uint public minStakeBalance;

    event TokenStakeChanged(address newTokenStake);
    event MinStakeBalanceChanged(uint newMinStakeBalance);

    constructor(string _name, string _symbol, ITokenStake _tokenStake, uint _minStakeBalance)
        public ERC721Metadata(_name, _symbol) {
        setOwner(msg.sender);
        setTokenStake(_tokenStake);
        setMinStakeBalance(_minStakeBalance);
    }

    function setTokenStake(ITokenStake _tokenStake) public onlyOwner {
        require(_tokenStake != address(0));
        tokenStake = _tokenStake;
        emit TokenStakeChanged(address(tokenStake));
    }

    function setMinStakeBalance(uint _minStakeBalance) public onlyOwner {
        require(_minStakeBalance >= 0);
        minStakeBalance = _minStakeBalance;
        emit MinStakeBalanceChanged(minStakeBalance);
    }

    function mint(address _to, uint256 _tokenId, string _uri) public returns (bool) {
        uint stakeBalance = tokenStake.stake(msg.sender); //TODO Interface 에 stake variable 없음 getter function 한개 달면됨
        require(stakeBalance >= minStakeBalance);
        
        // TODO tokenStake.decreaseCouponQuota(msg.sender)

        _mint(_to, _tokenId);

        _setTokenURI(_tokenId, _uri);
        return true;
    }
}
