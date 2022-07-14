const { expect } = require("chai");
const { ethers } = require("hardhat");

const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const WETH9 = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const WBTC = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";
const WBTC_WHALE = "0x2faf487a4414fe77e2327f0bf4ae2a264a776ad2";
const DAI_WHALE = "0x2FAF487A4414Fe77e2327F0bf4AE2a264a776AD2";
const RouterAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

describe("2: Adding Liquidity to Uniswap v2 ", function () {
  let accounts, liquidityOnV2, dai, wbtc, wbtc_whale;

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [WBTC_WHALE],
    });

    wbtc_whale = await ethers.getSigner(WBTC_WHALE);
    const TokenAbi = [
      "function balanceOf(address account) external view returns (uint256)",
      // Authenticated Functions
      "function transfer(address to, uint amount) returns (bool)",
      "function approve(address spender, uint256 amount) external returns (bool)",
      "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
    ];

    wbtc = await ethers.getContractAt(TokenAbi, WBTC);
    dai = await ethers.getContractAt(TokenAbi, DAI);

    const LiquidityOnV2 = await ethers.getContractFactory("LiquidityV2");
    liquidityOnV2 = await LiquidityOnV2.deploy();
    await liquidityOnV2.deployed();

    // send user 1 wbtc to swap
    let amountIn = 2n * 10n ** 8n;

    console.log(
      "B: WBTC Balance of Whale",
      ethers.utils.formatUnits(await wbtc.balanceOf(WBTC_WHALE), 8)
    );
    console.log(
      "B: WBTC Balance of User",
      ethers.utils.formatUnits(await wbtc.balanceOf(accounts[0].address), 8)
    );
    await wbtc.connect(wbtc_whale).transfer(accounts[0].address, amountIn);

    console.log(
      "A: WBTC Balance of Whale",
      ethers.utils.formatUnits(await wbtc.balanceOf(WBTC_WHALE), 8)
    );
    console.log(
      "A: WBTC Balance of User",
      ethers.utils.formatUnits(await wbtc.balanceOf(accounts[0].address), 8)
    );
    console.log(
      "+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++"
    );
  });

  describe("Supply WBTC <-> DAI", function () {
    it("Should addLiquidity() and removeLiquidity()", async function () {
      const wbtcAmountInMAX = 1n * 10n ** 8n;
      const daiAmountOut = 20000n * 10n ** 18n;

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

      // * approve() contract token a and b
      // approve contract to swap
      await wbtc
        .connect(accounts[0])
        .approve(liquidityOnV2.address, wbtcAmountInMAX);
      await dai
        .connect(accounts[0])
        .approve(liquidityOnV2.address, daiAmountOut);
      // * call addLiquidity()
      /**
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
       */
      console.log("=== adding liquidity ===");
      let tx = await liquidityOnV2.addLiquidity(
        wbtc.address,
        dai.address,
        wbtcAmountInMAX,
        daiAmountOut
      );
      // * + log step +

      console.log(
        `D: DAI Balance of User: $${ethers.utils.formatUnits(
          await dai.balanceOf(accounts[0].address),
          18
        )} (Dai)`
      );

      console.log(
        `D: WBTC Balance of User: ${ethers.utils.formatUnits(
          await wbtc.balanceOf(accounts[0].address),
          8
        )} (WBTC)`
      );
      console.log("=== remove liquidity ===");
      // * call removeLiquidity()
      tx = await liquidityOnV2.removeLiquidity(dai.address, wbtc.address);
      // * + log step +

      tx.wait(1);
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
