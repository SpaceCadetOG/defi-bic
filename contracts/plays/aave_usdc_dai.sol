// // SPDX-License-Identifier: MIT
// pragma solidity ^0.7.0;

// import "@openzeppelin/contracts/math/SafeMath.sol";
// import "../interfaces/aave/FlashLoanReceiverBase.sol";
// import "../interfaces/uniswap/Uniswap.sol";
// import "hardhat/console.sol";

// contract USDC_DAI_AAVE_FLASHLOAN is FlashLoanReceiverBase {



//     // function withdraw(address _assetAddress) internal Owner {
//     //     uint256 assetBalance;
//     //     console.log("after contract balance:", assetBalance);
//     //     if (_assetAddress == ETHER) {
//     //         address self = address(this); // workaround for a possible solidity bug
//     //         assetBalance = self.balance;
//     //         msg.sender.transfer(assetBalance);
//     //     } else {
//     //         assetBalance = IERC20(_assetAddress).balanceOf(address(this));
//     //         IERC20(_assetAddress).transfer(msg.sender, assetBalance);
//     //     }
//     // }
// }



    // using SafeERC20 for IERC20;
    // using SafeMath for uint256;
    // address public owner = msg.sender;
    // address constant ETHER = address(0);
    // address private constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    // address constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    // address constant USDT = 0xdAC17F958D2ee523a2206206994597C13D831ec7;
    // address constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    // address private constant UNISWAP_V2_ROUTER =
    //     0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    // AggregatorV3Interface internal priceFeed =
    //     AggregatorV3Interface(0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419);

    // constructor(ILendingPoolAddressesProvider _addressProvider)
    //     public
    //     FlashLoanReceiverBase(_addressProvider)
    // {}

    // modifier Owner() {
    //     require(owner == msg.sender, "Not Owner");
    //     _;
    // }