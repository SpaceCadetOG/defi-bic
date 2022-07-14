// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "../interfaces/aave/FlashLoanReceiverBase.sol";
import "hardhat/console.sol";

contract AaveFlashLoan is FlashLoanReceiverBase {
    using SafeMath for uint256;
    address constant ETHER = address(0);

    constructor(ILendingPoolAddressesProvider _addressProvider)
        public
        FlashLoanReceiverBase(_addressProvider)
    {}

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
}
