// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/utils/math/Math.sol";
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
    using Math for uint256;

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
    uint[] public tradesIds;
    mapping(uint256 => Trade) public trades;
    mapping(uint256 => uint256[]) public nftData;
    // maps AssetId to nftIds
    mapping(uint256 => uint256[2]) public virtualTradeData;
    // maps virtual trades to a pair of other trades

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

    /**
     * @notice Function that creates a new trades (from user and virtuals trades if aplicable) and tries to match it.
     * @param owner_ trade owner
     * @param fromAsset_  asset you give
     * @param fromAssetTokensIds  nfts an array of tokenIds (empty if asset is not an nft)
     * @param toAsset_ asset to get
     * @param allowPartial_ Allow partial trades
     * @param duration trade lock duration must be >= minLockTime
     */
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
        fromAsset_.assetId = _getAssetIdIndex();
        toAsset_.assetId = _getAssetIdIndex();
        // create trade
        uint256 tradeId_ = _getTradeIdIndex();
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
                msg.value == (fromAsset_.amount + flat_fee),
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
        cleanTrades();
    }

    /**
     * @notice Trade a is only in trade mapping it will only be added if trade remains after match
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
            if (b.owner == address(0)) {
                // marked to be removed do nothing
                continue;
            }
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

            uint256 p1 = _amount(a.toAsset).mulDiv(
                DECIMALS,
                _amount(a.fromAsset)
            );
            uint256 p2 = _amount(b.fromAsset).mulDiv(
                DECIMALS,
                _amount(b.toAsset)
            );

            if (p1 != p2) {
                continue;
            }

            if (aFromAmount == bToAmount) {
                // complete amount
                executeTrades(a, b, bFromAmount, aFromAmount);
                emit TradesMatched(a, b);
                // remove b from trades
                updateLinkedTrades(a);
                updateLinkedTrades(b);
                removeTrade(b, i - 1);
                removeTrade(a);
                return;
            }
            if (aFromAmount > bToAmount && a.allowPartial) {
                //partial trade amount
                executeTrades(a, b, bFromAmount, bToAmount);
                // update a asset to amount
                a.toAsset.amount -= bFromAmount;
                emit TradesPartialyMatched(a, b);
                updateLinkedTrades(a);
                updateLinkedTrades(b);
                removeTrade(b, i - 1);
                continue;
            }
            if (aFromAmount < bToAmount && b.allowPartial) {
                //partial trade amount a fullfiled so exit
                executeTrades(a, b, aToAmount, aFromAmount);
                // update b asset to amount
                b.toAsset.amount -= aFromAmount;
                emit TradesPartialyMatched(b, a);
                updateLinkedTrades(a);
                updateLinkedTrades(b);
                removeTrade(a);
                return;
            }
        }

        addVirtualTrades(a);
        tradesIds.push(a.tradeId);
    }

    function executeVirtual(Trade storage t, uint256 amountT) internal {
        uint256[2] memory td = virtualTradeData[t.tradeId];
        Trade storage t1 = trades[td[0]];
        Trade storage t2 = trades[td[1]];

        uint256 burnT2From = _amount(t2.fromAsset).mulDiv(
            amountT,
            _amount(t2.toAsset)
        );

        uint256 burnT1From = _amount(t1.toAsset).mulDiv(
            burnT2From,
            _amount(t1.fromAsset)
        );

        if (t2.owner != address(this)) {
            transferAssetTo(t2.toAsset, t2.owner, amountT);
            // update from asset
            t2.fromAsset.amount -= burnT2From;
        } else {
            executeVirtual(t2, amountT);
        }

        if (t1.owner != address(this)) {
            transferAssetTo(t1.toAsset, t1.owner, burnT2From);
            // update from asset
            t1.fromAsset.amount -= burnT1From;
        } else {
            executeVirtual(t1, burnT2From);
        }

        // update virtual trade alreay done when using transfer
        // t.toAsset.amount -= amountT;
        // t.fromAsset.amount -= burnT1From;

        // mark to delete if needed
        if (t.toAsset.amount == 0 || t.fromAsset.amount == 0) {
            // mark to remove
            t.owner = address(0);
        }
        if (t1.toAsset.amount == 0 || t1.fromAsset.amount == 0) {
            // mark to remove
            t1.owner = address(0);
        }
        if (t2.toAsset.amount == 0 || t2.fromAsset.amount == 0) {
            // mark to remove
            t2.owner = address(0);
        }
    }

    function executeTrades(
        Trade storage a,
        Trade storage b,
        uint256 amountA,
        uint256 amountB
    ) internal {
        if (a.owner != address(this)) {
            transferAssetTo(b.fromAsset, a.owner, amountA);
        } else {
            executeVirtual(a, amountA);
        }
        if (b.owner != address(this)) {
            transferAssetTo(a.fromAsset, b.owner, amountB);
        } else {
            executeVirtual(b, amountB);
        }
    }

    function addVirtualTrades(Trade storage a) internal {
        for (uint256 i = tradesIds.length; i > 0; i--) {
            Trade storage b = trades[tradesIds[i - 1]];
            if (
                !(equalAssets(a.fromAsset, b.toAsset)) &&
                equalAssets(a.toAsset, b.fromAsset)
            ) {
                createVirtualTrade(a, b);
                continue;
            }
            if (
                !(equalAssets(a.toAsset, b.fromAsset)) &&
                equalAssets(a.fromAsset, b.toAsset)
            ) {
                createVirtualTrade(b, a);
                continue;
            }
        }
    }

    function cleanTrades() internal {
        // first loop remove trades marked
        for (uint256 i = tradesIds.length; i > 0; i--) {
            Trade storage t = trades[tradesIds[i - 1]];
            if (t.owner == address(0)) {
                removeTrade(t, i - 1);
            }
        }

        // second loop remove related remaining trades
        bool loop = false;
        do {
            loop = false;
            for (uint256 i = tradesIds.length; i > 0; i--) {
                Trade storage t = trades[tradesIds[i - 1]];
                if (t.owner == address(this)) {
                    uint256[2] memory tv = virtualTradeData[t.tradeId];
                    Trade storage t1 = trades[tv[0]];
                    Trade storage t2 = trades[tv[1]];
                    if ((t1.owner == address(0)) || (t2.owner == address(0))) {
                        loop = true;
                        removeTrade(t, i - 1);
                    }
                }
            }
        } while (loop);
    }

    function updateLinkedTrades(Trade storage t) internal {
        if (t.owner == address(0)) {
            // marked to be deleted nothing to do
            return;
        }

        for (uint256 i = tradesIds.length; i > 0; i--) {
            Trade storage b = trades[tradesIds[i - 1]];
            if (b.owner == address(this)) {
                // trade data
                uint256[2] memory td;
                td = virtualTradeData[b.tradeId];
                if ((td[0] == t.tradeId) || (td[1] == t.tradeId)) {
                    updateVirtualTrade(b);
                }
            }
        }
    }

    function updateVirtualTrade(Trade storage t) internal {
        if (t.owner == address(0)) {
            // marked to be deleted nothing to do
            return;
        }

        // trade data
        uint256[2] memory td;
        td = virtualTradeData[t.tradeId];
        require((td[0] != 0) || (td[1] != 0), "invalid virtual trade data");
        Trade storage a = trades[td[0]];
        Trade storage b = trades[td[1]];

        //uint256 aFromAmount = a.fromAsset.amount;
        uint256 bFromAmount = b.fromAsset.amount;

        uint256 aToAmount = a.toAsset.amount;
        // uint256 bToAmount = b.toAsset.amount;

        if (bFromAmount == aToAmount) {
            t.fromAsset.amount = a.fromAsset.amount;
            t.toAsset.amount = b.toAsset.amount;
        }

        if ((bFromAmount > aToAmount) && b.allowPartial) {
            t.fromAsset.amount = a.fromAsset.amount;
            t.toAsset.amount = _amount(b.toAsset).mulDiv(
                aToAmount,
                _amount(b.fromAsset)
            );
        }

        if ((bFromAmount < aToAmount) && a.allowPartial) {
            t.toAsset.amount = b.toAsset.amount;
            t.fromAsset.amount = _amount(a.fromAsset).mulDiv(
                bFromAmount,
                _amount(a.toAsset)
            );
        }

        if ((t.fromAsset.amount == 0) || (t.toAsset.amount == 0)) {
            // mark to delete
            t.owner = address(0);
        }
    }

    function createVirtualTrade(Trade storage a, Trade storage b) internal {
        if (
            (a.toAsset.assetType == AssetTypes.ERC721_NFT) ||
            (a.fromAsset.assetType == AssetTypes.ERC721_NFT)
        ) {
            return;
        }
        if (
            (b.toAsset.assetType == AssetTypes.ERC721_NFT) ||
            (b.fromAsset.assetType == AssetTypes.ERC721_NFT)
        ) {
            return;
        }
        uint256 tradeId_ = _getTradeIdIndex();
        Trade storage t = trades[tradeId_];
        t.tradeId = tradeId_;
        t.owner = address(this);
        t.fromAsset = a.fromAsset;
        t.toAsset = b.toAsset;
        t.allowPartial = true;
        t.expireTime = 0;

        // operate amounts

        //uint256 aFromAmount = a.fromAsset.amount;
        uint256 bFromAmount = b.fromAsset.amount;

        uint256 aToAmount = a.toAsset.amount;
        // uint256 bToAmount = b.toAsset.amount;

        if (bFromAmount == aToAmount) {
            t.fromAsset.amount = a.fromAsset.amount;
            t.toAsset.amount = b.toAsset.amount;
        }

        if ((bFromAmount > aToAmount) && b.allowPartial) {
            t.fromAsset.amount = a.fromAsset.amount;
            t.toAsset.amount = _amount(b.toAsset).mulDiv(
                aToAmount,
                _amount(b.fromAsset)
            );
        }

        if ((bFromAmount < aToAmount) && a.allowPartial) {
            t.toAsset.amount = b.toAsset.amount;
            t.fromAsset.amount = _amount(a.fromAsset).mulDiv(
                bFromAmount,
                _amount(a.toAsset)
            );
        }

        // trade data
        uint256[2] memory td = [a.tradeId, b.tradeId];
        virtualTradeData[t.tradeId] = td;
        // push to array
        tradesIds.push(t.tradeId);
        emit TradeCreated(t);
    }

    // remove from mapping only
    function removeTrade(Trade storage t) internal {
        emit TradeRemoved(t);
        // mark to remove
        t.owner = address(0);
        // remove from mapping
        delete trades[t.tradeId];
    }

    // remove from mapping and array
    function removeTrade(Trade storage t, uint256 index) internal {
        emit TradeRemoved(t);
        // mark to remove
        t.owner = address(0);
        // remove from mapping
        delete trades[t.tradeId];
        // remove from array
        tradesIds[index] = tradesIds[tradesIds.length - 1];
        tradesIds.pop();
    }

    // internal transfer function
    function transferAssetTo(
        Asset storage a,
        address to,
        uint256 amount
    ) internal {
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
        // safe transfer only 23000 gas
        // all functions using transfer are reentrant guarded
        // with noReentrant modifier
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

    function _getTradeIdIndex() internal returns (uint256) {
        return lastTradeIndex++;
    }

    function _getAssetIdIndex() internal returns (uint256) {
        return lastAssetIndex++;
    }

    // add 18 decimals to ERC721 amouts
    function _amount(Asset memory asset) internal pure returns (uint256) {
        if (asset.assetType == AssetTypes.ERC721_NFT) {
            return (asset.amount * DECIMALS);
        }
        return asset.amount;
    }
}
