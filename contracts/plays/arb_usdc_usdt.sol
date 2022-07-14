// SPDX-License-Identifier: MIT
pragma solidity ^0.7;
pragma experimental ABIEncoderV2;
import "../interfaces/chainlink/AggregatorV3Interface.sol";
// import "../interfaces/IERC20.sol";
import "../interfaces/uniswap/Uniswap.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "hardhat/console.sol";

// 1) take flashloan for usdc (aave or dydx) []
// 2) swap USDC => WETH => USDT (uni) []
// 3) swap USDT => USDC (curve) []
// 4) profit pay back flashloan of usdc (aave) []

// price

// functions
// Flashloan Execution

// Flashloan Logic(i)
// doing trade logic
// 1 - approve usdc to be spent(uniswap)[x]
// * Create function swap_usdc_to_usdt() || swap_dai_to_usdc()[x]
// 2 - call swap exact tokens on uniwsap(swap)[x]
// * call these funcs in execution func[x]
// 3 - approve usdt to be spent(curve)
// * Create function exchange_usdc_to_usdt() || exchange_usdt_to_usdc()
// 4 - exchange on curve
// * call these funcs in execution func
// * Withdraw function [x]
// * withdraw contract balance [x]

contract arb_usdc_usdt {
    using SafeERC20 for IERC20;
    address public owner = msg.sender;
    address constant ETHER = address(0);
    address private constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address constant USDT = 0xdAC17F958D2ee523a2206206994597C13D831ec7;
    address constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    address private constant UNISWAP_V2_ROUTER =
        0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    AggregatorV3Interface internal priceFeed =
        AggregatorV3Interface(0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419);

    modifier Owner() {
        require(owner == msg.sender, "Not Owner");
        _;
    }

    function ArbIt(
        address _asset,
        uint256 amountIn,
        uint256 amountOutMin
    ) external {
        if (USDC == _asset || DAI != _asset) {
            swap_usdc_to_usdt_uni(amountIn, amountOutMin);
        } else {
            swap_dai_to_usdc_uni(amountIn, amountOutMin);
        }
    }

    function TokenBalance(uint256 _assetAddress)
        external
        view
        returns (uint256)
    {
        uint256 assetBalance = IERC20(_assetAddress).balanceOf(address(this));
        return assetBalance;
    }

    /*internal funcs*/
    // swap on uniswap
    function swap_usdc_to_usdt_uni(uint256 amountIn, uint256 amountOutMin)
        internal
    {
        // address _tokenIn usdc
        // address _tokenOut usdt
        // uint _amountIn => user
        // uint _amountOutMin => compare to link price
        // address _to => address(this)

        // IERC20(USDC).transferFrom(msg.sender, address(this), amountIn);
        IERC20(USDC).approve(UNISWAP_V2_ROUTER, amountIn);

        address[] memory path;
        if (USDC == WETH || USDT == WETH) {
            path = new address[](2);
            path[0] = USDC;
            path[1] = USDT;
        } else {
            path = new address[](3);
            path[0] = USDC;
            path[1] = WETH;
            path[2] = USDT;
        }

        IUniswapV2Router(UNISWAP_V2_ROUTER).swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            path,
            address(this),
            block.timestamp
        );
        console.log("Complete");
    }

    function swap_dai_to_usdc_uni(uint256 amountIn, uint256 amountOutMin)
        internal
    {
        IERC20(DAI).approve(UNISWAP_V2_ROUTER, amountIn);
        address[] memory path;
        if (DAI == WETH || DAI == WETH) {
            path = new address[](2);
            path[0] = DAI;
            path[1] = USDC;
        } else {
            path = new address[](3);
            path[0] = DAI;
            path[1] = WETH;
            path[2] = USDC;
        }

        IUniswapV2Router(UNISWAP_V2_ROUTER).swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            path,
            address(this),
            block.timestamp
        );
        console.log("Complete");
    }

    function withdraw(address _assetAddress) external Owner {
        uint256 assetBalance;
        console.log("after contract balance:", assetBalance);
        if (_assetAddress == ETHER) {
            address self = address(this); // workaround for a possible solidity bug
            assetBalance = self.balance;
            msg.sender.transfer(assetBalance);
        } else {
            assetBalance = IERC20(_assetAddress).balanceOf(address(this));
            IERC20(_assetAddress).transfer(msg.sender, assetBalance);
        }
    }
}
