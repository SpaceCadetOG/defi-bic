// SPDX-License-Identifier: MIT
pragma solidity ^0.7;
pragma experimental ABIEncoderV2;
import "../interfaces/chainlink/AggregatorV3Interface.sol";
// import "../interfaces/IERC20.sol";
import "../interfaces/uniswap/Uniswap.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "../interfaces/aave/FlashLoanReceiverBase.sol";
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

contract arb_1 is FlashLoanReceiverBase {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;
    address public owner = msg.sender;
    address constant ETHER = address(0);
    address private constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address constant USDT = 0xdAC17F958D2ee523a2206206994597C13D831ec7;
    address constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;

    address private constant UNISWAP_V2_ROUTER =
        0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address private constant SUSHISWAP_V2_ROUTER =
        0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F;

    // AggregatorV3Interface internal priceFeed = AggregatorV3Interface(0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419);

    constructor(ILendingPoolAddressesProvider _addressProvider)
        FlashLoanReceiverBase(_addressProvider)
    {}

    modifier Owner() {
        require(owner == msg.sender, "Not Owner");
        _;
    }

    function TokenBalance(uint256 _assetAddress)
        external
        view
        returns (uint256)
    {
        uint256 assetBalance = IERC20(_assetAddress).balanceOf(address(this));
        return assetBalance;
    }

    // send tokens to contract
    function makeMoney(address asset, uint256 amount) public {
        uint256 bal = IERC20(asset).balanceOf(address(this));
        require(bal > amount, "bal <= amount");
        console.log("before contract balance:", bal);
        address receiver = address(this);

        address[] memory assets = new address[](1);
        assets[0] = asset;

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = amount;

        // 0 = no debt, 1 = stable, 2 = variable
        // 0 = pay all loaned
        uint256[] memory modes = new uint256[](1);
        modes[0] = 0;

        address onBehalfOf = msg.sender;

        bytes memory params = abi.encode(asset, amount); // extra data to pass abi.encode(...)
        uint16 referralCode = 0;

        LENDING_POOL.flashLoan(
            receiver, // this contract or user
            assets,
            amounts,
            modes,
            onBehalfOf, // who recieves debt
            params, // this will be arb logic
            referralCode
        );

        console.log("after contract balance:", bal);
        withdraw(asset);
    }

    // aave will call this
    function executeOperation(
        address[] calldata assets,
        uint256[] calldata amounts,
        uint256[] calldata premiums,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        // do stuff here (arbitrage, liquidation, etc...)
        // abi.decode(params) to decode params

        (address asset, uint256 amount) = abi.decode(
            params,
            (address, uint256)
        );

        SimpleStableETHSushi(asset, amount);

        for (uint256 i = 0; i < assets.length; i++) {
            console.log("borrowed (convert to ether)", amounts[i]);
            console.log("fee in wei (convert to ether)", premiums[i]);
            // repay Aave
            uint256 amountOwing = amounts[i].add(premiums[i]);
            IERC20(assets[i]).approve(address(LENDING_POOL), amountOwing);

            // transfer balance to user
        }

        return true;
    }

    // {Swap on Uniswap}
    function SimpleStableSwap(address _asset, uint256 amountIn) internal {
        if (USDC == _asset || DAI != _asset) {
            swap_usdc_to_dai_uni(amountIn);
        } else {
            swap_dai_to_usdc_uni(amountIn);
        }
    }

    function SimpleETHStableSwap(address _asset, uint256 amountIn) internal {
        if (USDC == _asset || DAI != _asset) {
            swap_weth_for_stable_uni(USDC, amountIn);
        } else {
            swap_weth_for_stable_uni(DAI, amountIn);
        }
    }

    function SimpleStableETHSwap(address _asset, uint256 amountIn) internal {
        if (USDC == _asset || DAI != _asset) {
            swap_stable_to_weth_uni(USDC, amountIn);
        } else {
            swap_stable_to_weth_uni(DAI, amountIn);
        }
    }

    // {Swap on Sushiswap}
    function SimpleStableSushi(address _asset, uint256 amountIn) external {
        if (USDC == _asset || DAI != _asset) {
            swap_usdc_to_dai_sushi(amountIn);
        } else {
            swap_dai_to_usdc_sushi(amountIn);
        }
    }

    function SimpleETHStableSushi(address _asset, uint256 amountIn) internal {
        if (USDC == _asset || DAI != _asset) {
            swap_weth_for_stable_sushi(USDC, amountIn);
        } else {
            swap_weth_for_stable_sushi(DAI, amountIn);
        }
    }

    function SimpleStableETHSushi(address _asset, uint256 amountIn) internal {
        if (USDC == _asset || DAI != _asset) {
            swap_stable_to_weth_sushi(USDC, amountIn);
        } else {
            swap_stable_to_weth_sushi(DAI, amountIn);
        }
    }

    /* internal funcs => Uniswap || Sushiswap */
    function swap_usdc_to_dai_uni(uint256 amountIn) internal {
        // address _tokenIn usdc
        // address _tokenOut usdt
        // uint _amountIn => user
        // uint _amountOutMin => compare to link price
        // address _to => address(this)

        // IERC20(USDC).transferFrom(msg.sender, address(this), amountIn);
        IERC20(USDC).approve(UNISWAP_V2_ROUTER, amountIn);

        address[] memory path;
        if (USDC == WETH || DAI == WETH) {
            path = new address[](2);
            path[0] = USDC;
            path[1] = DAI;
        } else {
            path = new address[](3);
            path[0] = USDC;
            path[1] = WETH;
            path[2] = DAI;
        }
        uint amountOutMin = getAmountOutMin(USDC, DAI, amountIn);
        IUniswapV2Router(UNISWAP_V2_ROUTER).swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            path,
            address(this),
            block.timestamp
        );
        console.log("Swap Complete");
    }

    function swap_dai_to_usdc_uni(uint256 amountIn) internal {
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
        uint amountOutMin = getAmountOutMin(DAI, USDC, amountIn);
        IUniswapV2Router(UNISWAP_V2_ROUTER).swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            path,
            address(this),
            block.timestamp
        );
        console.log("Swap Complete balance");
    }

    function swap_stable_to_weth_uni(address stable, uint256 amountIn)
        internal
    {
        IERC20(stable).approve(UNISWAP_V2_ROUTER, amountIn);
        address[] memory path;
        if (stable == DAI || DAI == WETH || WETH == DAI) {
            path = new address[](2);
            path[0] = DAI;
            path[1] = WETH;
        } else if (stable == USDC || USDC == WETH || WETH == USDC) {
            path = new address[](2);
            path[0] = USDC;
            path[1] = WETH;
        }
        uint amountOutMin = getAmountOutMin(stable, WETH, amountIn);
        IUniswapV2Router(UNISWAP_V2_ROUTER).swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            path,
            address(this),
            block.timestamp
        );
        console.log("Swap Complete balance");
    }

    function swap_weth_for_stable_uni(address stable, uint256 amountIn)
        internal
    {
        IERC20(WETH).approve(UNISWAP_V2_ROUTER, amountIn);
        address[] memory path;
        if (stable == DAI || DAI == WETH || WETH == DAI) {
            path = new address[](2);
            path[0] = WETH;
            path[1] = DAI;
        } else if (stable == USDC || USDC == WETH || WETH == USDC) {
            path = new address[](2);
            path[0] = WETH;
            path[1] = USDC;
        }
        uint amountOutMin = getAmountOutMin(WETH, stable, amountIn);
        IUniswapV2Router(UNISWAP_V2_ROUTER).swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            path,
            address(this),
            block.timestamp
        );
        console.log("Swap Complete balance");
    }

    function swap_usdc_to_dai_sushi(uint256 amountIn) internal {
        IERC20(USDC).approve(SUSHISWAP_V2_ROUTER, amountIn);

        address[] memory path;
        if (USDC == WETH || DAI == WETH) {
            path = new address[](2);
            path[0] = USDC;
            path[1] = DAI;
        } else {
            path = new address[](3);
            path[0] = USDC;
            path[1] = WETH;
            path[2] = DAI;
        }
        uint amountOutMin = getAmountOutMin(USDC, DAI, amountIn);
        IUniswapV2Router(SUSHISWAP_V2_ROUTER).swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            path,
            address(this),
            block.timestamp
        );
        console.log("Swap Complete");
    }

    function swap_dai_to_usdc_sushi(uint256 amountIn) internal {
        IERC20(DAI).approve(SUSHISWAP_V2_ROUTER, amountIn);
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
        uint amountOutMin = getAmountOutMin(DAI, USDC, amountIn);
        IUniswapV2Router(SUSHISWAP_V2_ROUTER).swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            path,
            address(this),
            block.timestamp
        );
        console.log("Swap Complete balance");
    }

    function swap_stable_to_weth_sushi(address stable, uint256 amountIn)
        internal
    {
        IERC20(stable).approve(SUSHISWAP_V2_ROUTER, amountIn);
        address[] memory path;
        if (stable == DAI || DAI == WETH || WETH == DAI) {
            path = new address[](2);
            path[0] = DAI;
            path[1] = WETH;
        } else if (stable == USDC || USDC == WETH || WETH == USDC) {
            path = new address[](2);
            path[0] = USDC;
            path[1] = WETH;
        }
        uint amountOutMin = getAmountOutMin(stable, WETH, amountIn);
        IUniswapV2Router(SUSHISWAP_V2_ROUTER).swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            path,
            address(this),
            block.timestamp
        );
        console.log("Swap Complete balance");
    }

    function swap_weth_for_stable_sushi(address stable, uint256 amountIn)
        internal
    {
        IERC20(WETH).approve(SUSHISWAP_V2_ROUTER, amountIn);
        address[] memory path;
        if (stable == DAI || DAI == WETH || WETH == DAI) {
            path = new address[](2);
            path[0] = WETH;
            path[1] = DAI;
        } else if (stable == USDC || USDC == WETH || WETH == USDC) {
            path = new address[](2);
            path[0] = WETH;
            path[1] = USDC;
        }
        uint amountOutMin = getAmountOutMin(WETH, stable, amountIn);
        IUniswapV2Router(SUSHISWAP_V2_ROUTER).swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            path,
            address(this),
            block.timestamp
        );
        console.log("Swap Complete balance");
    }

    function getAmountOutMin(
        address _tokenIn,
        address _tokenOut,
        uint256 _amount
    ) public view returns (uint256) {
        address[] memory path;
        if (_tokenIn == WETH || _tokenOut == WETH) {
            path = new address[](2);
            path[0] = _tokenIn;
            path[1] = _tokenOut;
        } else {
            path = new address[](3);
            path[0] = _tokenIn;
            path[1] = WETH;
            path[2] = _tokenOut;
        }
        uint256[] memory amountOutMins = IUniswapV2Router(UNISWAP_V2_ROUTER)
            .getAmountsOut(_amount, path);
        return amountOutMins[path.length - 1];
    }

    function withdraw(address _assetAddress) internal Owner {
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
