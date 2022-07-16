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

contract arb_2_avax is FlashLoanReceiverBase {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;
    address public owner = msg.sender;
    address constant ETHER = address(0);
    address private constant WETH = 0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7;
    address constant USDC = 0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664;
    address constant DAI = 0xd586E7F844cEa2F87f50152665BCbc2C279D8d70;


// Use traderjoe \\ png \\ gmx
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
    function makeMoney(address asset, uint256 amount) external {
        uint256 bal = IERC20(asset).balanceOf(address(this));
        require(bal > amount, "bal <= amount");
        console.log("before contract balance:", bal);
        address receiver = address(this);

        address[] memory assets = new address[](1);
        assets[0] = asset;

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = amount;
        // amounts[1] = amount2;
        // amounts[2] = amount3;

        // 0 = no debt, 1 = stable, 2 = variable
        // 0 = pay all loaned
        uint256[] memory modes = new uint256[](1);
        modes[0] = 0;

        address onBehalfOf = msg.sender;

        bytes memory params = ""; // extra data to pass abi.encode(...)
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
        // withdraw(asset);
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

        // SimpleStableETHSwap(assets[0], amounts[0], amounts[1]);
        // SimpleETHStableSwap(assets[0], amounts[2], amounts[0]);

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
    function SimpleStableSwap(
        address _asset,
        uint256 amountIn,
        uint256 amountOutMin
    ) external {
        if (USDC == _asset || DAI != _asset) {
            swap_usdc_to_dai_uni(amountIn, amountOutMin);
        } else {
            swap_dai_to_usdc_uni(amountIn, amountOutMin);
        }
    }

    function SimpleETHStableSwap(
        address _asset,
        uint256 amountIn,
        uint256 amountOutMin
    ) external {
        if (USDC == _asset || DAI != _asset) {
            swap_weth_for_stable_uni(USDC, amountIn, amountOutMin);
        } else {
            swap_weth_for_stable_uni(DAI, amountIn, amountOutMin);
        }
    }

    function SimpleStableETHSwap(
        address _asset,
        uint256 amountIn,
        uint256 amountOutMin
    ) external {
        if (USDC == _asset || DAI != _asset) {
            swap_stable_to_weth_uni(USDC, amountIn, amountOutMin);
        } else {
            swap_stable_to_weth_uni(DAI, amountIn, amountOutMin);
        }
    }

// {Swap on Sushiswap}
    function SimpleStableSushi(
        address _asset,
        uint256 amountIn,
        uint256 amountOutMin
    ) external {
        if (USDC == _asset || DAI != _asset) {
            swap_usdc_to_dai_sushi(amountIn, amountOutMin);
        } else {
            swap_dai_to_usdc_sushi(amountIn, amountOutMin);
        }
    }

    function SimpleETHStableSushi(
        address _asset,
        uint256 amountIn,
        uint256 amountOutMin
    ) external {
        if (USDC == _asset || DAI != _asset) {
            swap_weth_for_stable_sushi(USDC, amountIn, amountOutMin);
        } else {
            swap_weth_for_stable_sushi(DAI, amountIn, amountOutMin);
        }
    }

    function SimpleStableETHSushi(
        address _asset,
        uint256 amountIn,
        uint256 amountOutMin
    ) external {
        if (USDC == _asset || DAI != _asset) {
            swap_stable_to_weth_sushi(USDC, amountIn, amountOutMin);
        } else {
            swap_stable_to_weth_sushi(DAI, amountIn, amountOutMin);
        }
    }

    /* internal funcs => Uniswap || Sushiswap */
    function swap_usdc_to_dai_uni(uint256 amountIn, uint256 amountOutMin)
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

        IUniswapV2Router(UNISWAP_V2_ROUTER).swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            path,
            address(this),
            block.timestamp
        );
        console.log("Swap Complete");
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
        console.log("Swap Complete balance");
    }

    function swap_stable_to_weth_uni(
        address stable,
        uint256 amountIn,
        uint256 amountOutMin
    ) internal {
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

        IUniswapV2Router(UNISWAP_V2_ROUTER).swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            path,
            address(this),
            block.timestamp
        );
        console.log("Swap Complete balance");
    }

    function swap_weth_for_stable_uni(
        address stable,
        uint256 amountIn,
        uint256 amountOutMin
    ) internal {
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

        IUniswapV2Router(UNISWAP_V2_ROUTER).swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            path,
            address(this),
            block.timestamp
        );
        console.log("Swap Complete balance");
    }

    function swap_usdc_to_dai_sushi(uint256 amountIn, uint256 amountOutMin)
        internal
    {
        // address _tokenIn usdc
        // address _tokenOut usdt
        // uint _amountIn => user
        // uint _amountOutMin => compare to link price
        // address _to => address(this)

        // IERC20(USDC).transferFrom(msg.sender, address(this), amountIn);
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

        IUniswapV2Router(SUSHISWAP_V2_ROUTER).swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            path,
            address(this),
            block.timestamp
        );
        console.log("Swap Complete");
    }

    function swap_dai_to_usdc_sushi(uint256 amountIn, uint256 amountOutMin)
        internal
    {
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

        IUniswapV2Router(SUSHISWAP_V2_ROUTER).swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            path,
            address(this),
            block.timestamp
        );
        console.log("Swap Complete balance");
    }

    function swap_stable_to_weth_sushi(
        address stable,
        uint256 amountIn,
        uint256 amountOutMin
    ) internal {
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

        IUniswapV2Router(SUSHISWAP_V2_ROUTER).swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            path,
            address(this),
            block.timestamp
        );
        console.log("Swap Complete balance");
    }

    function swap_weth_for_stable_sushi(
        address stable,
        uint256 amountIn,
        uint256 amountOutMin
    ) internal {
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

        IUniswapV2Router(SUSHISWAP_V2_ROUTER).swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            path,
            address(this),
            block.timestamp
        );
        console.log("Swap Complete balance");
    }

    function withdraw(address _assetAddress) public Owner {
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
