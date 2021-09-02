// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import "../interface/IERC20.sol";

/**
 * @title SafeMath
 * @dev Math operations with safety checks that throw on error
 */
library SafeMath {
    /**
     * @dev Multiplies two numbers, throws on overflow.
     */
    function mul(uint256 a, uint256 b) internal pure returns (uint256 c) {
        // Gas optimization: this is cheaper than asserting 'a' not being zero, but the
        // benefit is lost if 'b' is also tested.
        // See: https://github.com/OpenZeppelin/openzeppelin-solidity/pull/522
        if (a == 0) {
            return 0;
        }

        c = a * b;
        assert(c / a == b);
        return c;
    }

    /**
     * @dev Integer division of two numbers, truncating the quotient.
     */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        // assert(b > 0); // Solidity automatically throws when dividing by 0
        // uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold
        return a / b;
    }

    /**
     * @dev Subtracts two numbers, throws on overflow (i.e. if subtrahend is greater than minuend).
     */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        assert(b <= a);
        return a - b;
    }

    /**
     * @dev Adds two numbers, throws on overflow.
     */
    function add(uint256 a, uint256 b) internal pure returns (uint256 c) {
        c = a + b;
        assert(c >= a);
        return c;
    }
}

contract Uniswap {
    using SafeMath for uint256;

    address private _owner = msg.sender;
    address public LPtokenAddr;
    // price * 10**6
    uint256 public BNBPrice = 499640000;
    uint256 public token0Price = 23440000;
    uint256 public token1Price = 187520000;

    modifier isOwner() {
        require(msg.sender == _owner);
        _;
    }

    function setLPTokenContract(address _LPtokenAddr) public isOwner {
        LPtokenAddr = _LPtokenAddr;
    }

    struct token {
        string contractAddress; // 币种合约地址
    }

    struct Liquidity {
        address userAddress;
        address token0Address;
        address token1Address;
        uint256 token0Qty;
        uint256 token1Qty;
        uint256 LPtokenAmount;
    }

    event Swape(
        uint256 estimateQty,
        address token0Address,
        address token1Address,
        uint256 quantity
    );

    event AddLiquidity(
        address token0Address,
        address token1Address,
        uint256 token0Qty,
        uint256 token1Qty,
        uint256 LPtokenAmount
    );

    event GetSwipeEstimateQty(uint256 ret, uint256 targetTokenQty);

    Liquidity[] public liquidities;

    //create pool
    struct Pairs {
        address token0Address;
        address token1Address;
        uint160 rateLiquidity;
    }
    mapping(address => mapping(address => Pairs)) public pools;

    function createPool(
        address token0Address,
        address token1Address,
        uint160 rateLiquidity
    ) public {
        // 记录交易对
        Pairs memory _pairs =
            Pairs({
                token0Address: token0Address,
                token1Address: token1Address,
                rateLiquidity: rateLiquidity
            });
        pools[token0Address][token1Address] = _pairs;
    }

    function getTokenRatio(address token0Address, address token1Address)
        public
        view
        returns (uint160 rateLiquidity)
    {
        rateLiquidity = pools[token0Address][token1Address].rateLiquidity;
    }

    // 新增交易对
    function addLiquidity(
        address token0Address,
        address token1Address,
        uint256 token0Qty,
        uint256 token1Qty
    ) public payable {
        // uint160 rate = getTokenRatio(token0Address, token1Address);
        // require(token1Qty == token0Qty.mul(rate).div(100), "rate");
        // 验证余额

        require(
            IERC20(token0Address).transferFrom(msg.sender, _owner, token0Qty)
        );
        require(
            IERC20(token1Address).transferFrom(msg.sender, _owner, token1Qty)
        );
        uint256 LPtokenAmount =
            (token0Price.mul(token0Qty) + token1Price.mul(token1Qty))
                .div(BNBPrice)
                .sub(1000);
        require(
            IERC20(LPtokenAddr).transferFrom(_owner, msg.sender, LPtokenAmount)
        );

        // 记录交易对
        Liquidity memory _liquidity =
            Liquidity({
                userAddress: msg.sender,
                token0Address: token0Address,
                token1Address: token1Address,
                token0Qty:token0Qty,
                token1Qty: token1Qty,
                LPtokenAmount: LPtokenAmount
            });

        liquidities.push(_liquidity);
        emit AddLiquidity(token0Address, token1Address, token0Qty, token1Qty, LPtokenAmount);
    }

    function getPostionInfo(uint256 _postionId)
        external
        view
        returns (
            address userAddress,
            address token0Address,
            address token1Address,
            uint256 token0Qty,
            uint256 token1Qty,
            uint256 LPtokenAmount
        )
    {
        Liquidity storage _liquidity = liquidities[_postionId];
        userAddress = _liquidity.userAddress;
        token0Address = _liquidity.token0Address;
        token1Address = _liquidity.token1Address;
        token0Qty = _liquidity.token0Qty;
        token1Qty = _liquidity.token1Qty;
        LPtokenAmount = _liquidity.LPtokenAmount;
    }

    /**
     *  创建交易
     *  swapToken: 即将交换的Token
     *  targetToken: 即将得到的Token
     */
    function swape(
        address token0Address,
        address token1Address,
        uint256 quantity
    ) public payable {
        require(quantity <= IERC20(token0Address).balanceOf(msg.sender));
        uint256 estimateQty =
            getSwipeEstimateQty(token0Address, token1Address, quantity);
        require(
            IERC20(token0Address).transferFrom(msg.sender, _owner, quantity)
        );
        // IERC20(token1Address).approve(_owner, estimateQty);
        require(
            IERC20(token1Address).transferFrom(_owner, msg.sender, estimateQty)
        );
        emit Swape(estimateQty, token0Address, token1Address, quantity);

    }

    // 计算交换后的值
    function getSwipeEstimateQty(
        address token0Address,
        address token1Address,
        uint256 quantity
    ) public returns (uint256 ret) {
        uint256 t0Qty = IERC20(token0Address).balanceOf(_owner);
        uint256 t1Qty = IERC20(token1Address).balanceOf(_owner);
        uint256 targetTokenQty = t0Qty.mul(t1Qty).div(t0Qty.add(quantity));
        ret = t1Qty.sub(targetTokenQty);
        emit GetSwipeEstimateQty(ret, targetTokenQty);
    }
}
