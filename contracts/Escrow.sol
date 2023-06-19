// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

/**
 * @title General Escrow Smart Contract for tokens
 * @author Nabetse
 * @notice not yet fully tested, needs more tests
 */
contract Escrow is ERC721Holder {
    // libraries
    using SafeMath for uint256;

    // Constants
    uint256 internal constant DECIMALS = 1e18;

    // Type declarations
    enum AssetTypes {
        NATIVE_ZEN,
        ERC20_TOKEN,
        ERC721_NFT
    }

    struct Asset {
        uint256 assetId;
        AssetTypes assetType;
        address assetAddress;
        uint256 amount;
        //uint assetDataId;
    }

    struct Trade {
        uint256 tradeId;
        address owner;
        Asset fromAsset;
        Asset toAsset;
        bool allowPartial;
        uint256 expireTime;
    }

    // State variables
    uint256 public immutable minLockTime;
    uint256 public flat_fee;
    address public administrator;

    bool internal locked;
    // address[] public sellers;
    uint[] public tradesIds;
    // mapping(address => uint256[]) sellersTrades;
    mapping(uint256 => Trade) public trades;
    mapping(uint256 => uint256[]) public nftData; // maps AssetId to nftIds
    uint256 public lastTradeIndex;
    uint256 public lastAssetIndex;

    uint256 public availableFees;
    uint256 public collectedFees;

    // Events
    event TradeCreated(Trade t);
    event TradesMatched(Trade ta, Trade tb);
    event TradesPartialyMatched(Trade ta, Trade tb);
    event TradeRemoved(Trade t);

    // Modifiers

    modifier onlyOwner(address sender) {
        require(sender == administrator, "Only owner is allowed");
        _;
    }

    modifier noReentrant() {
        require(!locked, "No re-entrancy");
        locked = true;
        _;
        locked = false;
    }

    // Functions
    constructor(uint256 unlockTime_, uint256 flat_fees_, address admin_) {
        minLockTime = unlockTime_;
        lastTradeIndex = 0;
        flat_fee = flat_fees_;
        administrator = admin_;
        availableFees = 0;
    }

    function setFee(uint256 flat_fee_) public onlyOwner(msg.sender) {
        flat_fee = flat_fee_;
    }

    function transferOwnership(address newAdmin) public onlyOwner(msg.sender) {
        administrator = newAdmin;
    }

    function withdrawFees(
        address payable to
    ) public onlyOwner(msg.sender) noReentrant {
        collectedFees += availableFees;
        transferNative(to, availableFees);
        availableFees = 0;
    }

    function checkToAssetValid(Asset memory a) public pure {
        require(a.amount > 0, "Invalid Amount must be > 0");
        AssetTypes t = a.assetType;
        if (t == AssetTypes.NATIVE_ZEN) {
            require(
                a.assetAddress == address(0),
                "Invalid asset address for NATIVE ZEN, should be zero address"
            );
            return;
        }
        if (t == AssetTypes.ERC20_TOKEN) {
            require(
                a.assetAddress != address(0),
                "Invalid asset address for ERC20, should NOT be zero address"
            );
            return;
        }

        if (t == AssetTypes.ERC721_NFT) {
            require(
                a.assetAddress != address(0),
                "Invalid asset address for ERC721, should NOT be zero address"
            );
            return;
        }
    }

    function checkFromAssetValid(
        Asset memory a,
        uint256[] calldata fromAssetTokensIds
    ) public pure {
        require(a.amount > 0, "Invalid Amount must be > 0");
        AssetTypes t = a.assetType;
        if (t == AssetTypes.NATIVE_ZEN) {
            require(
                a.assetAddress == address(0),
                "Invalid asset address for NATIVE ZEN, should be zero address"
            );
            require(
                fromAssetTokensIds.length == 0,
                "NATIVE ZEN asset cannot have tokensIds"
            );
            return;
        }
        if (t == AssetTypes.ERC20_TOKEN) {
            require(
                a.assetAddress != address(0),
                "Invalid asset address for ERC20, should NOT be zero address"
            );
            require(
                fromAssetTokensIds.length == 0,
                "ERC20 asset cannot have tokensIds"
            );
            return;
        }

        if (t == AssetTypes.ERC721_NFT) {
            require(
                a.assetAddress != address(0),
                "Invalid asset address for ERC721, should NOT be zero address"
            );
            require(
                fromAssetTokensIds.length == a.amount,
                "ERC721 asset amount must match given tokensIds"
            );
            return;
        }
    }

    function getTrades() public view returns (Trade[] memory) {
        Trade[] memory trs = new Trade[](tradesIds.length);
        Trade memory t;
        for (uint i = 0; i < tradesIds.length; i++) {
            t = trades[tradesIds[i]];
            trs[i] = t;
        }
        return trs;
    }

    function tradesOf(address seller) public view returns (Trade[] memory) {
        uint tradesLenght = 0;
        Trade memory t;
        for (uint i = 0; i < tradesIds.length; i++) {
            t = trades[tradesIds[i]];
            if (t.owner == seller) {
                tradesLenght++;
            }
        }
        Trade[] memory trs = new Trade[](tradesLenght);
        uint j = 0;
        for (uint i = 0; i < tradesIds.length; i++) {
            t = trades[tradesIds[i]];
            if (t.owner == seller) {
                trs[j] = t;
                j++;
            }
        }
        return trs;
    }

    function getNftTokensIds(
        uint256 assetId
    ) public view returns (uint[] memory) {
        return nftData[assetId];
    }

    function withdrawTrades(address seller) public noReentrant {
        for (uint i = tradesIds.length; i > 0; i--) {
            Trade storage t = trades[tradesIds[i - 1]]; // test with memory
            if (t.owner == seller && t.expireTime < block.timestamp) {
                // transfer token
                transferAssetTo(t.fromAsset, seller, t.fromAsset.amount);
                emit TradeRemoved(t);
                // remove trade
                delete trades[tradesIds[i - 1]];
                tradesIds[i - 1] = tradesIds[tradesIds.length - 1];
                tradesIds.pop();
            }
        }
    }

    function createTrade(
        address owner_,
        Asset memory fromAsset_,
        uint256[] calldata fromAssetTokensIds,
        Asset memory toAsset_,
        bool allowPartial_,
        uint256 duration
    ) public payable noReentrant {
        require(duration >= minLockTime, "Trade duration too low");
        require(msg.value >= flat_fee, "Trade flat_fee not met");

        // check correct data
        checkFromAssetValid(fromAsset_, fromAssetTokensIds);
        checkToAssetValid(toAsset_);

        // valid to and from
        require(
            fromAsset_.assetAddress != toAsset_.assetAddress,
            "Cannot exchange asset for the same asset"
        );

        // generate asset ids
        fromAsset_.assetId = getAssetIdIndex();
        toAsset_.assetId = getAssetIdIndex();
        // create trade
        uint256 tradeId_ = getTradeIdIndex();
        Trade storage ta = trades[tradeId_];
        ta.tradeId = tradeId_;
        ta.owner = owner_;
        ta.fromAsset = fromAsset_;
        ta.toAsset = toAsset_;
        ta.allowPartial = allowPartial_;
        ta.expireTime = duration + block.timestamp;

        // flat fee add
        availableFees += flat_fee;
        // transfer Asset from owner
        AssetTypes t = fromAsset_.assetType;
        address assetAddress_ = fromAsset_.assetAddress;

        if (t == AssetTypes.NATIVE_ZEN) {
            require(
                msg.value == fromAsset_.amount.add(flat_fee),
                "Not enought ZEN sent"
            );
        }

        if (t == AssetTypes.ERC20_TOKEN) {
            bool result_ = IERC20(assetAddress_).transferFrom(
                owner_,
                address(this),
                fromAsset_.amount
            );
            require(result_, "failed to transfer ERC20");
        }

        if (t == AssetTypes.ERC721_NFT) {
            for (uint i = 0; i < fromAssetTokensIds.length; i++) {
                IERC721(assetAddress_).safeTransferFrom(
                    owner_,
                    address(this),
                    fromAssetTokensIds[i]
                );
                nftData[fromAsset_.assetId] = fromAssetTokensIds;
            }
        }

        emit TradeCreated(ta);
        matchTrade(ta);
    }

    /**
     * @notice Trade a is only in trade mapping it will only be added if returns true
     * @param a Trade in mapping
     */
    function matchTrade(Trade storage a) internal {
        if (tradesIds.length == 0) {
            // add to trades
            tradesIds.push(a.tradeId);
            return;
        }

        //loop
        for (uint256 i = tradesIds.length; i > 0; i--) {
            Trade storage b = trades[tradesIds[i - 1]];
            if (!(equalAssets(a.fromAsset, b.toAsset))) {
                continue;
            }
            if (!(equalAssets(a.toAsset, b.fromAsset))) {
                continue;
            }

            uint256 aFromAmount = a.fromAsset.amount;
            uint256 bFromAmount = b.fromAsset.amount;

            uint256 aToAmount = a.toAsset.amount;
            uint256 bToAmount = b.toAsset.amount;

            uint256 p1 = aToAmount.mul(DECIMALS).div(aFromAmount);
            uint256 p2 = bFromAmount.mul(DECIMALS).div(bToAmount);

            if (p1 != p2) {
                continue;
            }

            if (aFromAmount == bToAmount) {
                // complete amount
                transferAssetTo(b.fromAsset, a.owner, bFromAmount);
                transferAssetTo(a.fromAsset, b.owner, aFromAmount);
                emit TradesMatched(a, b);
                // remove b from trades
                delete trades[b.tradeId]; // rem this is b !
                tradesIds[i - 1] = tradesIds[tradesIds.length - 1];
                tradesIds.pop();
                //delete a only in mapping
                delete trades[a.tradeId];
                emit TradeRemoved(a);
                emit TradeRemoved(b);
                return;
            }
            if (aFromAmount > bToAmount && a.allowPartial) {
                //partial trade amount
                transferAssetTo(b.fromAsset, a.owner, bFromAmount);
                transferAssetTo(a.fromAsset, b.owner, bToAmount);
                // update a asset to amount
                a.toAsset.amount -= bFromAmount;
                emit TradesPartialyMatched(a, b);
                // remove b from trades
                delete trades[b.tradeId]; // rem this is b !
                tradesIds[i - 1] = tradesIds[tradesIds.length - 1];
                tradesIds.pop();
                emit TradeRemoved(b);
                continue;
            }
            if (aFromAmount < bToAmount && b.allowPartial) {
                //partial trade amount a fullfiled so exit
                transferAssetTo(b.fromAsset, a.owner, aToAmount);
                transferAssetTo(a.fromAsset, b.owner, aFromAmount);
                // update b asset to amount
                b.toAsset.amount -= aFromAmount;
                emit TradesPartialyMatched(b, a);
                //delete a only in mapping
                delete trades[a.tradeId];
                // b updated from transfer
                emit TradeRemoved(a);
                return;
            }
        }
        tradesIds.push(a.tradeId);
    }

    function transferAssetTo(
        Asset storage a,
        address to,
        uint256 amount
    ) internal {
        // require(amount <= a.amount, "Amount to transfer exeeds asset amount");
        AssetTypes t = a.assetType;
        address assetAddress_ = a.assetAddress;
        bool result = false;

        if (t == AssetTypes.NATIVE_ZEN) {
            require(
                a.assetAddress == address(0),
                "Invalid asset address for NATIVE ZEN, should be zero address"
            );
            transferNative(payable(to), amount);
            result = true;
        }

        if (t == AssetTypes.ERC20_TOKEN) {
            require(
                assetAddress_ != address(0),
                "Invalid asset address for ER20, should NOT be zero address"
            );
            transferERC20(assetAddress_, to, amount);
            result = true;
        }

        if (t == AssetTypes.ERC721_NFT) {
            require(
                assetAddress_ != address(0),
                "Invalid asset address for ERC721, should NOT be zero address"
            );
            transferERC721(a.assetId, assetAddress_, to, amount);
            result = true;
        }
        require(result, "Error in transfer wrong Asset type ?");
        // update amount
        a.amount -= amount;
    }

    function transferERC721(
        uint256 assetId,
        address assetAddr,
        address to,
        uint256 amount //uint256[] storage tokensIds
    ) internal {
        uint256[] storage tokensIds = nftData[assetId];
        require(
            tokensIds.length >= amount,
            "Number of NFT to transfer exeeds given token Ids"
        );
        uint256 l = tokensIds.length - amount;
        for (uint i = tokensIds.length; i > l; i--) {
            IERC721(assetAddr).safeTransferFrom(
                address(this),
                to,
                tokensIds[i - 1]
            );
            // remove token
            tokensIds.pop();
        }
    }

    function transferERC20(
        address assetAddr,
        address to,
        uint256 amount
    ) internal {
        IERC20(assetAddr).transfer(to, amount);
    }

    function transferNative(address payable to, uint256 amount) internal {
        to.transfer(amount);
    }

    function equalAssets(
        Asset memory a,
        Asset memory b
    ) internal pure returns (bool) {
        if (a.assetType != b.assetType) {
            return false;
        }

        if (a.assetAddress != b.assetAddress) {
            return false;
        }

        return true;
    }

    function getTradeIdIndex() internal returns (uint256) {
        return lastTradeIndex++;
    }

    function getAssetIdIndex() internal returns (uint256) {
        return lastAssetIndex++;
    }
}
