import { tokenAddress, tokenWhale } from "../utils/constants/Tokens";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
const { expect } = require("chai");
const { ethers, network } = require("hardhat");


describe("1: Swapping on Uniswap v2 ", function () {


  async function deployFixture()
  {
    let accounts, swapOnV2, dai, wbtc, amountIn;
    accounts = await ethers.getSigners();
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [tokenWhale.WBTC.eth],
    });

    const wbtc_whale = await ethers.getSigner(tokenWhale.WBTC.eth);
    const TokenAbi = [
      "function balanceOf(address account) external view returns (uint256)",
      // Authenticated Functions
      "function transfer(address to, uint amount) returns (bool)",
      "function approve(address spender, uint256 amount) external returns (bool)",
      "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
    ];

    wbtc = await ethers.getContractAt(TokenAbi, tokenAddress.WBTC.eth);
    dai = await ethers.getContractAt(TokenAbi, tokenAddress.DAI.eth);

    const SwapOnV2 = await ethers.getContractFactory("SwapperV2");
    swapOnV2 = await SwapOnV2.deploy();
    await swapOnV2.deployed();
    console.log(`Swapper Contract: ${swapOnV2.address}`)

    // send user 1 wbtc to swap
    amountIn = 2n * 10n ** 8n;

    console.log(
      "B: WBTC Balance of Whale",
      ethers.utils.formatUnits(await wbtc.balanceOf(wbtc_whale.address), 8)
    );
    console.log(
      "B: WBTC Balance of User",
      ethers.utils.formatUnits(await wbtc.balanceOf(accounts[0].address), 8)
    );
    await wbtc.connect(wbtc_whale).transfer(accounts[0].address, amountIn);

    console.log(
      "A: WBTC Balance of Whale",
      ethers.utils.formatUnits(await wbtc.balanceOf(wbtc_whale.address), 8)
    );
    console.log(
      "A: WBTC Balance of User",
      ethers.utils.formatUnits(await wbtc.balanceOf(accounts[0].address), 8)
    );
    console.log(
      "+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++"
    );

    return {accounts, swapOnV2, dai, wbtc, amountIn}
  }
  describe("Swap WBTC -> DAI", function () {
    it("Should swap()", async function ()
    {
      const {accounts, swapOnV2, dai, wbtc, amountIn} = await loadFixture(deployFixture)
      const wbtcAmountInMAX = 1n * 10n ** 8n;
      const daiAmountOut = 200n * 10n ** 18n;
      console.log(
        `B: DAI Balance of User: $${ethers.utils.formatUnits(
          await dai.balanceOf(accounts[0].address),
          18
        )} (DAI)`
      );
      console.log(
        `B: WBTC Balance of User ${ethers.utils.formatUnits(
          await wbtc.balanceOf(accounts[0].address),
          8
        )} (WBTC)`
      );

      // approve contract to swap
      await wbtc
        .connect(accounts[0])
        .approve(swapOnV2.address, wbtcAmountInMAX);
      await swapOnV2.swap(
        wbtc.address,
        dai.address,
        wbtcAmountInMAX,
        daiAmountOut,
        accounts[0].address
      );

      /**
       * address tokenA,
        address tokenB,
        uint256 amountIn,
        uint256 amountOutMin
       */

      // test swap
      console.log(
        `A: DAI Balance of User: $${ethers.utils.formatUnits(
          await dai.balanceOf(accounts[0].address),
          18
        )} (Dai)`
      );
      
      console.log(
        `A: WBTC Balance of User: ${ethers.utils.formatUnits(
          await wbtc.balanceOf(accounts[0].address),
          8
        )} (WBTC)`
      );
    });
  });
});
