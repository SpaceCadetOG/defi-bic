const { expect } = require("chai");
const { ethers } = require("hardhat");

const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const DAI_WHALE = "0x2FAF487A4414Fe77e2327F0bf4AE2a264a776AD2";
const USDC_WHALE = "0x2FAF487A4414Fe77e2327F0bf4AE2a264a776AD2";

describe("4: Add Liquidity to Uniswap V3", function () {
  let usdc, dai, accounts, liquidityV3;

  before(async () => {
    // will mock this acct
    accounts = await ethers.getSigners();
    const TokenAbi = [
      "function balanceOf(address account) external view returns (uint256)",
      // Authenticated Functions
      "function transfer(address to, uint amount) returns (bool)",
      "function approve(address spender, uint256 amount) external returns (bool)",
      "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
    ];
    dai = await ethers.getContractAt(TokenAbi, DAI);
    usdc = await ethers.getContractAt(TokenAbi, USDC);

    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [DAI_WHALE],
    });

    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [USDC_WHALE],
    });

    const dai_whale = await ethers.getSigner(DAI_WHALE);
    const usdc_whale = await ethers.getSigner(USDC_WHALE);

    const LiquidityV3 = await ethers.getContractFactory("LiquidityExamples");

    liquidityV3 = await LiquidityV3.deploy();
    await liquidityV3.deployed();

    const dai_amount = 100n * 10n ** 18n;
    const usdc_amount = 100n * 10n ** 6n;

    expect(await dai.balanceOf(dai_whale.address)).to.gte(dai_amount);
    expect(await usdc.balanceOf(usdc_whale.address)).to.gte(usdc_amount);
    console.log(
      "B: DAI Balance of Whale",
      ethers.utils.formatEther(await dai.balanceOf(dai_whale.address))
    );
    console.log(
      "B: USDC Balance of Whale",
      ethers.utils.formatUnits(await usdc.balanceOf(usdc_whale.address), 6)
    );
    await dai.connect(dai_whale).transfer(accounts[0].address, dai_amount);
    await usdc.connect(usdc_whale).transfer(accounts[0].address, usdc_amount);
  });

  describe("Supply USDC <-> DAI", () =>
  { 
    it("mintNewPosition", async () => {
      const dai_amount = 100n * 10n ** 18n;
      const usdc_amount = 100n * 10n ** 6n;
  
      await dai.connect(accounts[0]).transfer(liquidityV3.address, dai_amount);
      await usdc.connect(accounts[0]).transfer(liquidityV3.address, usdc_amount);
  
      await liquidityV3.mintNewPosition();
  
      console.log(
        "DAI balance after add liquidity",
        ethers.utils.formatEther(await dai.balanceOf(accounts[0].address))
      );
      console.log(
        "USDC balance after add liquidity",
        ethers.utils.formatUnits(await usdc.balanceOf(accounts[0].address), 6)
      );
    });
   })

});
