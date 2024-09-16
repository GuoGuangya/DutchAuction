// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// 荷兰拍卖，价格由高到低
contract DutchAuction is Ownable {
    using SafeERC20 for IERC20;
    event Buy(uint _aid, uint _amount);
    event CancelAuction(uint _aid);
    event AddAuction(
        address _nft,
        uint _nftId,
        address _token,
        uint _startPrice,
        uint _startTimestamp,
        uint _endTimestamp,
        uint _descentRate
    );

    // 拍卖物品NFT
    struct Auction {
        address owner;
        IERC721 nft;
        uint nftId;
        IERC20 token;
        uint startTimestamp;
        uint endTimestamp;
        bool buyed;
        uint startPrice;
        uint descentRate;
    }

    uint public AUCTION_MIN_DURACTION = 3 days;
    uint public AUCTION_MAX_DURACTION = 7 days;

    Auction[] public auctions;
    mapping(uint => mapping(address => uint)) bids;

    constructor() Ownable(_msgSender()) {}

    function getAuctionsLength() external view returns (uint) {
        return auctions.length;
    }

    function getAutionsItems() external view returns (Auction[] memory) {
        return auctions;
    }

    // 添加拍卖交易
    function addAuction(
        address _owner,
        address _nft,
        uint _nftId,
        address _token,
        uint _startPrice,
        uint _startTimestamp,
        uint _endTimestamp,
        uint _descentRate
    ) external onlyOwner {
        require(address(0) != _nft, "nft address invalid");
        require(address(0) != _token, "token address invalid");
        require(_startTimestamp > block.timestamp, "_startTimestamp < now");
        require(
            _endTimestamp - _startTimestamp >= AUCTION_MIN_DURACTION,
            "_startTimestamp < now"
        );
        require(
            _endTimestamp - _startTimestamp <= AUCTION_MAX_DURACTION,
            "_startTimestamp < now"
        );

        require(
            _startPrice - (_endTimestamp - _startTimestamp) * _descentRate >= 0,
            "The starting bid was too low"
        );

        auctions.push(
            Auction({
                owner: _owner,
                nft: IERC721(_nft),
                nftId: _nftId,
                token: IERC20(_token),
                startTimestamp: _startTimestamp,
                endTimestamp: _endTimestamp,
                buyed: false,
                startPrice: _startPrice,
                descentRate: _descentRate
            })
        );

        emit AddAuction(
            _nft,
            _nftId,
            _token,
            _startPrice,
            _startTimestamp,
            _endTimestamp,
            _descentRate
        );
    }

    function getCurrentPrice(uint _aid) public view returns (uint) {
        Auction storage aution = auctions[_aid];
        if (block.timestamp < aution.startTimestamp) {
            return aution.startPrice;
        }

        require(aution.endTimestamp > block.timestamp, "aution end");
        uint timestamp = block.timestamp > aution.endTimestamp
            ? aution.endTimestamp
            : block.timestamp;
        return
            aution.startPrice -
            (timestamp - aution.startTimestamp) *
            aution.descentRate;
    }

    // 撤销拍卖，如果拍卖还没有开始
    function cancelAuction(uint _aid) external onlyOwner {
        Auction storage aution = auctions[_aid];
        require(
            aution.startTimestamp > block.timestamp,
            "_startTimestamp < now"
        );
        aution.endTimestamp = block.timestamp;
        emit CancelAuction(_aid);
    }

    // 取走拍卖物品
    function buy(uint _aid, uint _amount) external {
        Auction storage aution = auctions[_aid];
        require(getCurrentPrice(_aid) <= _amount, "amount not enough");
        require(
            aution.startTimestamp <= block.timestamp,
            "_startTimestamp < now"
        );

        aution.token.safeTransferFrom(msg.sender, aution.owner, _amount);
        aution.nft.transferFrom(aution.owner, msg.sender, aution.nftId);
        aution.buyed = true;
        emit Buy(_aid, _amount);
    }
}
