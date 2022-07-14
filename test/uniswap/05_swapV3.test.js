const { expect } = require("chai");
const { ethers } = require("hardhat");

const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const WETH9 = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

describe("5: Swapping on Uniswap V3 WETH -> DAI", function () {
  let weth, dai, accounts, swapOnV3;

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    const TokenAbi = [
      "function balanceOf(address account) external view returns (uint256)",
      // Authenticated Functions
      "function transfer(address to, uint amount) returns (bool)",
      "function approve(address spender, uint256 amount) external returns (bool)",
      "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
    ];

    weth = await ethers.getContractAt("IWETH", WETH9);
    dai = await ethers.getContractAt(TokenAbi, DAI);

    const SwapOnV3 = await ethers.getContractFactory("SwapExamples");
    swapOnV3 = await SwapOnV3.deploy();
    await swapOnV3.deployed();
  });

  describe("Single Swap => In", function () {
    it("Should swapExactInputSingle", async function () {
      const amountIn = 10n ** 18n;
      await weth.connect(accounts[0]).deposit({ value: amountIn });
      await weth.connect(accounts[0]).approve(swapOnV3.address, amountIn);

      console.log(
        "WETH Balance Before Swap",
        ethers.utils.formatEther(await weth.balanceOf(accounts[0].address))
      );
      console.log(
        "DAI Balance Before Swap",
        ethers.utils.formatEther(await dai.balanceOf(accounts[0].address))
      );

      await swapOnV3.swapExactInputSingle(amountIn);

      console.log(
        "DAI Balance After Swap",
        ethers.utils.formatEther(await dai.balanceOf(accounts[0].address))
      );

      console.log(
        "WETH Balance After Swap",
        ethers.utils.formatEther(await weth.balanceOf(accounts[0].address))
      );
    });
  });

  describe("Single Swap => Out", function () {
    it("Should swapExactOutputSingle", async function () {
      const wethAmountInMAX = 10n ** 18n;
      const daiAmountOut = 100n * 10n ** 18n;

      await weth.connect(accounts[0]).deposit({ value: wethAmountInMAX });
      await weth
        .connect(accounts[0])
        .approve(swapOnV3.address, wethAmountInMAX);

      console.log(
        "WETH Balance Before Swap",
        ethers.utils.formatEther(await weth.balanceOf(accounts[0].address))
      );
      console.log(
        "DAI Balance Before Swap",
        ethers.utils.formatEther(await dai.balanceOf(accounts[0].address))
      );

      // await swapOnV3.swapExactInputSingle(amountIn);
      await swapOnV3.swapExactOutputSingle(daiAmountOut, wethAmountInMAX);

      console.log(
        "DAI Balance After Swap",
        ethers.utils.formatEther(await dai.balanceOf(accounts[0].address))
      );

      console.log(
        "WETH Balance After Swap",
        ethers.utils.formatEther(await weth.balanceOf(accounts[0].address))
      ); // should have 100 dai

      // we would want the eth price using  oracle to help
    });
  });

  describe("Multi Swap => In", function () {
    it("Should swapExactInputMultihop", async function () {
      const amountIn = 10n ** 18n;
      await weth.connect(accounts[0]).deposit({ value: amountIn });
      await weth.connect(accounts[0]).approve(swapOnV3.address, amountIn);

      console.log(
        "WETH Balance Before Swap",
        ethers.utils.formatEther(await weth.balanceOf(accounts[0].address))
      );
      console.log(
        "DAI Balance Before Swap",
        ethers.utils.formatEther(await dai.balanceOf(accounts[0].address))
      );

      await swapOnV3.swapExactInputMultihop(amountIn);

      console.log(
        "DAI Balance After Swap",
        ethers.utils.formatEther(await dai.balanceOf(accounts[0].address))
      );

      console.log(
        "WETH Balance After Swap",
        ethers.utils.formatEther(await weth.balanceOf(accounts[0].address))
      );
    });
  });

  describe("Multi Swap => Out", function () {
    it("Should swapExactOutputMultihop", async function () {
      // we would want the eth price using  oracle to help
      const wethAmountInMAX = 10n ** 18n;
      const daiAmountOut = 100n * 10n ** 18n;

      await weth.connect(accounts[0]).deposit({ value: wethAmountInMAX });
      await weth
        .connect(accounts[0])
        .approve(swapOnV3.address, wethAmountInMAX);

      console.log(
        "WETH Balance Before Swap",
        ethers.utils.formatEther(await weth.balanceOf(accounts[0].address))
      );
      console.log(
        "DAI Balance Before Swap",
        ethers.utils.formatEther(await dai.balanceOf(accounts[0].address))
      );
      // await swapOnV3.swapExactInputSingle(amountIn);
      await swapOnV3.swapExactOutputMultihop(daiAmountOut, wethAmountInMAX);
    

      console.log(
        "DAI Balance After Swap",
        ethers.utils.formatEther(await dai.balanceOf(accounts[0].address))
      );

      console.log(
        "WETH Balance After Swap",
        ethers.utils.formatEther(await weth.balanceOf(accounts[0].address))
      ); // should have 100 dai
    });
  });
});

describe.skip("6: Swapping on Uniswap DAI -> WETH", function () {
  let weth, dai, accounts, swapOnV3;

  beforeEach(async () => {
    accounts = await ethers.getSigners();

    weth = await ethers.getContractAt("IWETH", WETH9);
    dai = await ethers.getContractAt("IERC20", DAI);

    const SwapOnV3 = await ethers.getContractFactory("SwapExamples");
    swapOnV3 = await SwapOnV3.deploy();
    await swapOnV3.deployed();
  });

  describe("1: Single Swap => In", function () {
    it("Should swapExactInputSingle", async function () {
      const amountIn = 10n ** 18n;
      await weth.connect(accounts[0]).deposit({ value: amountIn });
      await weth.connect(accounts[0]).approve(swapOnV3.address, amountIn);

      await swapOnV3.swapExactInputSingle(amountIn);

      console.log(
        "DAI Balance",
        ethers.utils.formatEther(await dai.balanceOf(accounts[0].address))
      );
    });
  });

  describe("2: Single Swap => Out", function () {
    it("Should swapExactOutputSingle", async function () {
      const wethAmountInMAX = 10n ** 18n;
      const daiAmountOut = 100n * 10n ** 18n;

      await weth.connect(accounts[0]).deposit({ value: wethAmountInMAX });
      await weth
        .connect(accounts[0])
        .approve(swapOnV3.address, wethAmountInMAX);

      // await swapOnV3.swapExactInputSingle(amountIn);
      await swapOnV3.swapExactOutputSingle(daiAmountOut, wethAmountInMAX);
      console.log(
        "DAI Balance",
        ethers.utils.formatEther(await dai.balanceOf(accounts[0].address))
      ); // should have 100 dai

      // we would want the eth price using  oracle to help
    });
  });

  describe("1: Multi Swap => In", function () {
    it("Should swapExactInputMultihop", async function () {
      const amountIn = 10n ** 18n;
      await weth.connect(accounts[0]).deposit({ value: amountIn });
      await weth.connect(accounts[0]).approve(swapOnV3.address, amountIn);

      await swapOnV3.swapExactInputMultihop(amountIn);

      console.log(
        "DAI Balance",
        ethers.utils.formatEther(await dai.balanceOf(accounts[0].address))
      );
    });
  });

  describe("2: Multi Swap => Out", function () {
    it("Should swapExactOutputMultihop", async function () {
      // we would want the eth price using  oracle to help
      const wethAmountInMAX = 10n ** 18n;
      const daiAmountOut = 100n * 10n ** 18n;

      await weth.connect(accounts[0]).deposit({ value: wethAmountInMAX });
      await weth
        .connect(accounts[0])
        .approve(swapOnV3.address, wethAmountInMAX);

      // await swapOnV3.swapExactInputSingle(amountIn);
      await swapOnV3.swapExactOutputMultihop(daiAmountOut, wethAmountInMAX);
      console.log(
        "DAI Balance",
        ethers.utils.formatEther(await dai.balanceOf(accounts[0].address))
      ); // should have 100 dai
    });
  });
});
