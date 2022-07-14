// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "../interfaces/aave/FlashLoanReceiverBase.sol";
import "../interfaces/uniswap/Uniswap.sol";
import "hardhat/console.sol";

contract USDC_DAI_AAVE_FLASHLOAN is FlashLoanReceiverBase {
    using SafeMath for uint256;
    address constant ETHER = address(0);
    address private constant UNISWAP_V2_ROUTER =
        0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address private constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address private constant USDC = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address private constant DAI = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

    constructor(ILendingPoolAddressesProvider _addressProvider)
        public
        FlashLoanReceiverBase(_addressProvider)
    {}
    event LogWithdraw(
        address indexed _from,
        address indexed _assetAddress,
        uint amount
    );
    //--------------------------------------------------------------------
    // ARBITRAGE FUNCTIONS/LOGIC
    // send tokens to contract
    function makeMoney(address asset, uint256 amount) external {
        console.log("Balance:", getBalance(asset));
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
        withdraw(asset);
    }

    function withdraw(address _assetAddress) internal {
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
        emit LogWithdraw(msg.sender, _assetAddress, assetBalance);
        
    }

    function _swapUSDC(
        uint256 _amountIn,
        uint256 _amountOutMin,
        address _to
    ) internal {
        IERC20(USDC).transferFrom(msg.sender, address(this), _amountIn);
        IERC20(USDC).approve(UNISWAP_V2_ROUTER, _amountIn);
        require(
            IERC20(USDC).approve(address(UNISWAP_V2_ROUTER), _amountIn),
            "approve failed."
        );
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
            _amountIn,
            _amountOutMin,
            path,
            _to,
            block.timestamp
        );
    }

    function _swapDAI(
        uint256 _amountIn,
        uint256 _amountOutMin,
        address _to
    ) internal {
        IERC20(DAI).transferFrom(msg.sender, address(this), _amountIn);
        IERC20(DAI).approve(UNISWAP_V2_ROUTER, _amountIn);
        require(
            IERC20(USDC).approve(address(UNISWAP_V2_ROUTER), _amountIn),
            "approve failed."
        );
        address[] memory path;
        if (DAI == WETH || USDC == WETH) {
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
            _amountIn,
            _amountOutMin,
            path,
            _to,
            block.timestamp
        );
    }

    function getUniPrice() external {

    }

    function getChainlinkPrice() external {

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
        /**
        If the asset is DAI => Swap for USDC
        If the asset is USDC => Swap for USDC*/
        if (assets[0] == DAI) {
            _swapDAI(amounts[0], amounts[1], address(this));
        } else {
            _swapUSDC(amounts[0], amounts[1], address(this));
        }
        // abi.decode(params) to decode params

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

    function getBalance(address _erc20Address)
        public
        view
        returns (uint256)
    {
        return IERC20(_erc20Address).balanceOf(address(this));
    }
}
