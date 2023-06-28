// Sources flattened with hardhat v2.14.1 https://hardhat.org

// File @openzeppelin/contracts/utils/introspection/IERC165.sol@v4.9.0

// OpenZeppelin Contracts v4.4.1 (utils/introspection/IERC165.sol)

pragma solidity ^0.8.0;

/**
 * @dev Interface of the ERC165 standard, as defined in the
 * https://eips.ethereum.org/EIPS/eip-165[EIP].
 *
 * Implementers can declare support of contract interfaces, which can then be
 * queried by others ({ERC165Checker}).
 *
 * For an implementation, see {ERC165}.
 */
interface IERC165 {
    /**
     * @dev Returns true if this contract implements the interface defined by
     * `interfaceId`. See the corresponding
     * https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section]
     * to learn more about how these ids are created.
     *
     * This function call must use less than 30 000 gas.
     */
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}


// File @openzeppelin/contracts/token/ERC721/IERC721.sol@v4.9.0

// OpenZeppelin Contracts (last updated v4.9.0) (token/ERC721/IERC721.sol)

pragma solidity ^0.8.0;

/**
 * @dev Required interface of an ERC721 compliant contract.
 */
interface IERC721 is IERC165 {
    /**
     * @dev Emitted when `tokenId` token is transferred from `from` to `to`.
     */
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    /**
     * @dev Emitted when `owner` enables `approved` to manage the `tokenId` token.
     */
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);

    /**
     * @dev Emitted when `owner` enables or disables (`approved`) `operator` to manage all of its assets.
     */
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    /**
     * @dev Returns the number of tokens in ``owner``'s account.
     */
    function balanceOf(address owner) external view returns (uint256 balance);

    /**
     * @dev Returns the owner of the `tokenId` token.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function ownerOf(uint256 tokenId) external view returns (address owner);

    /**
     * @dev Safely transfers `tokenId` token from `from` to `to`.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `tokenId` token must exist and be owned by `from`.
     * - If the caller is not `from`, it must be approved to move this token by either {approve} or {setApprovalForAll}.
     * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
     *
     * Emits a {Transfer} event.
     */
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data) external;

    /**
     * @dev Safely transfers `tokenId` token from `from` to `to`, checking first that contract recipients
     * are aware of the ERC721 protocol to prevent tokens from being forever locked.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `tokenId` token must exist and be owned by `from`.
     * - If the caller is not `from`, it must have been allowed to move this token by either {approve} or {setApprovalForAll}.
     * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
     *
     * Emits a {Transfer} event.
     */
    function safeTransferFrom(address from, address to, uint256 tokenId) external;

    /**
     * @dev Transfers `tokenId` token from `from` to `to`.
     *
     * WARNING: Note that the caller is responsible to confirm that the recipient is capable of receiving ERC721
     * or else they may be permanently lost. Usage of {safeTransferFrom} prevents loss, though the caller must
     * understand this adds an external call which potentially creates a reentrancy vulnerability.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `tokenId` token must be owned by `from`.
     * - If the caller is not `from`, it must be approved to move this token by either {approve} or {setApprovalForAll}.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 tokenId) external;

    /**
     * @dev Gives permission to `to` to transfer `tokenId` token to another account.
     * The approval is cleared when the token is transferred.
     *
     * Only a single account can be approved at a time, so approving the zero address clears previous approvals.
     *
     * Requirements:
     *
     * - The caller must own the token or be an approved operator.
     * - `tokenId` must exist.
     *
     * Emits an {Approval} event.
     */
    function approve(address to, uint256 tokenId) external;

    /**
     * @dev Approve or remove `operator` as an operator for the caller.
     * Operators can call {transferFrom} or {safeTransferFrom} for any token owned by the caller.
     *
     * Requirements:
     *
     * - The `operator` cannot be the caller.
     *
     * Emits an {ApprovalForAll} event.
     */
    function setApprovalForAll(address operator, bool approved) external;

    /**
     * @dev Returns the account approved for `tokenId` token.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function getApproved(uint256 tokenId) external view returns (address operator);

    /**
     * @dev Returns if the `operator` is allowed to manage all of the assets of `owner`.
     *
     * See {setApprovalForAll}
     */
    function isApprovedForAll(address owner, address operator) external view returns (bool);
}


// File @openzeppelin/contracts/token/ERC721/IERC721Receiver.sol@v4.9.0

// OpenZeppelin Contracts (last updated v4.6.0) (token/ERC721/IERC721Receiver.sol)

pragma solidity ^0.8.0;

/**
 * @title ERC721 token receiver interface
 * @dev Interface for any contract that wants to support safeTransfers
 * from ERC721 asset contracts.
 */
interface IERC721Receiver {
    /**
     * @dev Whenever an {IERC721} `tokenId` token is transferred to this contract via {IERC721-safeTransferFrom}
     * by `operator` from `from`, this function is called.
     *
     * It must return its Solidity selector to confirm the token transfer.
     * If any other value is returned or the interface is not implemented by the recipient, the transfer will be reverted.
     *
     * The selector can be obtained in Solidity with `IERC721Receiver.onERC721Received.selector`.
     */
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bytes4);
}


// File @openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol@v4.9.0

// OpenZeppelin Contracts (last updated v4.9.0) (token/ERC721/utils/ERC721Holder.sol)

pragma solidity ^0.8.0;

/**
 * @dev Implementation of the {IERC721Receiver} interface.
 *
 * Accepts all token transfers.
 * Make sure the contract is able to use its token with {IERC721-safeTransferFrom}, {IERC721-approve} or {IERC721-setApprovalForAll}.
 */
contract ERC721Holder is IERC721Receiver {
    /**
     * @dev See {IERC721Receiver-onERC721Received}.
     *
     * Always returns `IERC721Receiver.onERC721Received.selector`.
     */
    function onERC721Received(address, address, uint256, bytes memory) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }
}


// File @openzeppelin/contracts/token/ERC20/IERC20.sol@v4.9.0

// OpenZeppelin Contracts (last updated v4.9.0) (token/ERC20/IERC20.sol)

pragma solidity ^0.8.0;

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Returns the amount of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves `amount` tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 amount) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * @dev Moves `amount` tokens from `from` to `to` using the
     * allowance mechanism. `amount` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}


// File @openzeppelin/contracts/utils/math/Math.sol@v4.9.0

// OpenZeppelin Contracts (last updated v4.9.0) (utils/math/Math.sol)

pragma solidity ^0.8.0;

/**
 * @dev Standard math utilities missing in the Solidity language.
 */
library Math {
    enum Rounding {
        Down, // Toward negative infinity
        Up, // Toward infinity
        Zero // Toward zero
    }

    /**
     * @dev Returns the largest of two numbers.
     */
    function max(uint256 a, uint256 b) internal pure returns (uint256) {
        return a > b ? a : b;
    }

    /**
     * @dev Returns the smallest of two numbers.
     */
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    /**
     * @dev Returns the average of two numbers. The result is rounded towards
     * zero.
     */
    function average(uint256 a, uint256 b) internal pure returns (uint256) {
        // (a + b) / 2 can overflow.
        return (a & b) + (a ^ b) / 2;
    }

    /**
     * @dev Returns the ceiling of the division of two numbers.
     *
     * This differs from standard division with `/` in that it rounds up instead
     * of rounding down.
     */
    function ceilDiv(uint256 a, uint256 b) internal pure returns (uint256) {
        // (a + b - 1) / b can overflow on addition, so we distribute.
        return a == 0 ? 0 : (a - 1) / b + 1;
    }

    /**
     * @notice Calculates floor(x * y / denominator) with full precision. Throws if result overflows a uint256 or denominator == 0
     * @dev Original credit to Remco Bloemen under MIT license (https://xn--2-umb.com/21/muldiv)
     * with further edits by Uniswap Labs also under MIT license.
     */
    function mulDiv(uint256 x, uint256 y, uint256 denominator) internal pure returns (uint256 result) {
        unchecked {
            // 512-bit multiply [prod1 prod0] = x * y. Compute the product mod 2^256 and mod 2^256 - 1, then use
            // use the Chinese Remainder Theorem to reconstruct the 512 bit result. The result is stored in two 256
            // variables such that product = prod1 * 2^256 + prod0.
            uint256 prod0; // Least significant 256 bits of the product
            uint256 prod1; // Most significant 256 bits of the product
            assembly {
                let mm := mulmod(x, y, not(0))
                prod0 := mul(x, y)
                prod1 := sub(sub(mm, prod0), lt(mm, prod0))
            }

            // Handle non-overflow cases, 256 by 256 division.
            if (prod1 == 0) {
                // Solidity will revert if denominator == 0, unlike the div opcode on its own.
                // The surrounding unchecked block does not change this fact.
                // See https://docs.soliditylang.org/en/latest/control-structures.html#checked-or-unchecked-arithmetic.
                return prod0 / denominator;
            }

            // Make sure the result is less than 2^256. Also prevents denominator == 0.
            require(denominator > prod1, "Math: mulDiv overflow");

            ///////////////////////////////////////////////
            // 512 by 256 division.
            ///////////////////////////////////////////////

            // Make division exact by subtracting the remainder from [prod1 prod0].
            uint256 remainder;
            assembly {
                // Compute remainder using mulmod.
                remainder := mulmod(x, y, denominator)

                // Subtract 256 bit number from 512 bit number.
                prod1 := sub(prod1, gt(remainder, prod0))
                prod0 := sub(prod0, remainder)
            }

            // Factor powers of two out of denominator and compute largest power of two divisor of denominator. Always >= 1.
            // See https://cs.stackexchange.com/q/138556/92363.

            // Does not overflow because the denominator cannot be zero at this stage in the function.
            uint256 twos = denominator & (~denominator + 1);
            assembly {
                // Divide denominator by twos.
                denominator := div(denominator, twos)

                // Divide [prod1 prod0] by twos.
                prod0 := div(prod0, twos)

                // Flip twos such that it is 2^256 / twos. If twos is zero, then it becomes one.
                twos := add(div(sub(0, twos), twos), 1)
            }

            // Shift in bits from prod1 into prod0.
            prod0 |= prod1 * twos;

            // Invert denominator mod 2^256. Now that denominator is an odd number, it has an inverse modulo 2^256 such
            // that denominator * inv = 1 mod 2^256. Compute the inverse by starting with a seed that is correct for
            // four bits. That is, denominator * inv = 1 mod 2^4.
            uint256 inverse = (3 * denominator) ^ 2;

            // Use the Newton-Raphson iteration to improve the precision. Thanks to Hensel's lifting lemma, this also works
            // in modular arithmetic, doubling the correct bits in each step.
            inverse *= 2 - denominator * inverse; // inverse mod 2^8
            inverse *= 2 - denominator * inverse; // inverse mod 2^16
            inverse *= 2 - denominator * inverse; // inverse mod 2^32
            inverse *= 2 - denominator * inverse; // inverse mod 2^64
            inverse *= 2 - denominator * inverse; // inverse mod 2^128
            inverse *= 2 - denominator * inverse; // inverse mod 2^256

            // Because the division is now exact we can divide by multiplying with the modular inverse of denominator.
            // This will give us the correct result modulo 2^256. Since the preconditions guarantee that the outcome is
            // less than 2^256, this is the final result. We don't need to compute the high bits of the result and prod1
            // is no longer required.
            result = prod0 * inverse;
            return result;
        }
    }

    /**
     * @notice Calculates x * y / denominator with full precision, following the selected rounding direction.
     */
    function mulDiv(uint256 x, uint256 y, uint256 denominator, Rounding rounding) internal pure returns (uint256) {
        uint256 result = mulDiv(x, y, denominator);
        if (rounding == Rounding.Up && mulmod(x, y, denominator) > 0) {
            result += 1;
        }
        return result;
    }

    /**
     * @dev Returns the square root of a number. If the number is not a perfect square, the value is rounded down.
     *
     * Inspired by Henry S. Warren, Jr.'s "Hacker's Delight" (Chapter 11).
     */
    function sqrt(uint256 a) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }

        // For our first guess, we get the biggest power of 2 which is smaller than the square root of the target.
        //
        // We know that the "msb" (most significant bit) of our target number `a` is a power of 2 such that we have
        // `msb(a) <= a < 2*msb(a)`. This value can be written `msb(a)=2**k` with `k=log2(a)`.
        //
        // This can be rewritten `2**log2(a) <= a < 2**(log2(a) + 1)`
        // ÔåÆ `sqrt(2**k) <= sqrt(a) < sqrt(2**(k+1))`
        // ÔåÆ `2**(k/2) <= sqrt(a) < 2**((k+1)/2) <= 2**(k/2 + 1)`
        //
        // Consequently, `2**(log2(a) / 2)` is a good first approximation of `sqrt(a)` with at least 1 correct bit.
        uint256 result = 1 << (log2(a) >> 1);

        // At this point `result` is an estimation with one bit of precision. We know the true value is a uint128,
        // since it is the square root of a uint256. Newton's method converges quadratically (precision doubles at
        // every iteration). We thus need at most 7 iteration to turn our partial result with one bit of precision
        // into the expected uint128 result.
        unchecked {
            result = (result + a / result) >> 1;
            result = (result + a / result) >> 1;
            result = (result + a / result) >> 1;
            result = (result + a / result) >> 1;
            result = (result + a / result) >> 1;
            result = (result + a / result) >> 1;
            result = (result + a / result) >> 1;
            return min(result, a / result);
        }
    }

    /**
     * @notice Calculates sqrt(a), following the selected rounding direction.
     */
    function sqrt(uint256 a, Rounding rounding) internal pure returns (uint256) {
        unchecked {
            uint256 result = sqrt(a);
            return result + (rounding == Rounding.Up && result * result < a ? 1 : 0);
        }
    }

    /**
     * @dev Return the log in base 2, rounded down, of a positive value.
     * Returns 0 if given 0.
     */
    function log2(uint256 value) internal pure returns (uint256) {
        uint256 result = 0;
        unchecked {
            if (value >> 128 > 0) {
                value >>= 128;
                result += 128;
            }
            if (value >> 64 > 0) {
                value >>= 64;
                result += 64;
            }
            if (value >> 32 > 0) {
                value >>= 32;
                result += 32;
            }
            if (value >> 16 > 0) {
                value >>= 16;
                result += 16;
            }
            if (value >> 8 > 0) {
                value >>= 8;
                result += 8;
            }
            if (value >> 4 > 0) {
                value >>= 4;
                result += 4;
            }
            if (value >> 2 > 0) {
                value >>= 2;
                result += 2;
            }
            if (value >> 1 > 0) {
                result += 1;
            }
        }
        return result;
    }

    /**
     * @dev Return the log in base 2, following the selected rounding direction, of a positive value.
     * Returns 0 if given 0.
     */
    function log2(uint256 value, Rounding rounding) internal pure returns (uint256) {
        unchecked {
            uint256 result = log2(value);
            return result + (rounding == Rounding.Up && 1 << result < value ? 1 : 0);
        }
    }

    /**
     * @dev Return the log in base 10, rounded down, of a positive value.
     * Returns 0 if given 0.
     */
    function log10(uint256 value) internal pure returns (uint256) {
        uint256 result = 0;
        unchecked {
            if (value >= 10 ** 64) {
                value /= 10 ** 64;
                result += 64;
            }
            if (value >= 10 ** 32) {
                value /= 10 ** 32;
                result += 32;
            }
            if (value >= 10 ** 16) {
                value /= 10 ** 16;
                result += 16;
            }
            if (value >= 10 ** 8) {
                value /= 10 ** 8;
                result += 8;
            }
            if (value >= 10 ** 4) {
                value /= 10 ** 4;
                result += 4;
            }
            if (value >= 10 ** 2) {
                value /= 10 ** 2;
                result += 2;
            }
            if (value >= 10 ** 1) {
                result += 1;
            }
        }
        return result;
    }

    /**
     * @dev Return the log in base 10, following the selected rounding direction, of a positive value.
     * Returns 0 if given 0.
     */
    function log10(uint256 value, Rounding rounding) internal pure returns (uint256) {
        unchecked {
            uint256 result = log10(value);
            return result + (rounding == Rounding.Up && 10 ** result < value ? 1 : 0);
        }
    }

    /**
     * @dev Return the log in base 256, rounded down, of a positive value.
     * Returns 0 if given 0.
     *
     * Adding one to the result gives the number of pairs of hex symbols needed to represent `value` as a hex string.
     */
    function log256(uint256 value) internal pure returns (uint256) {
        uint256 result = 0;
        unchecked {
            if (value >> 128 > 0) {
                value >>= 128;
                result += 16;
            }
            if (value >> 64 > 0) {
                value >>= 64;
                result += 8;
            }
            if (value >> 32 > 0) {
                value >>= 32;
                result += 4;
            }
            if (value >> 16 > 0) {
                value >>= 16;
                result += 2;
            }
            if (value >> 8 > 0) {
                result += 1;
            }
        }
        return result;
    }

    /**
     * @dev Return the log in base 256, following the selected rounding direction, of a positive value.
     * Returns 0 if given 0.
     */
    function log256(uint256 value, Rounding rounding) internal pure returns (uint256) {
        unchecked {
            uint256 result = log256(value);
            return result + (rounding == Rounding.Up && 1 << (result << 3) < value ? 1 : 0);
        }
    }
}


// File contracts/Escrow.sol

pragma solidity ^0.8.9;
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
        cleanTrades();
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

        if( (t1.owner == address(0)) || (t2.owner == address(0)) ){
            return;
        }

        uint256 burnT2From = _amount(t2.fromAsset).mulDiv(
            amountT,
            _amount(t2.toAsset)
        );

        uint256 burnT1From = _amount(t1.fromAsset).mulDiv(
            burnT2From,
            _amount(t1.toAsset)
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
