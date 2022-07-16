import { tokenAddress, tokenWhale } from "../utils/constants/Tokens";
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
const { expect } = require("chai");
const { ethers, network } = require("hardhat");

describe("0: DYDX Flashloan", function ()
{

  async function deployFixture()
  {
    // will mock this acct
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [tokenWhale.DAI.eth],
    });
    const TokenAbi = [
      "function balanceOf(address account) external view returns (uint256)",
      // Authenticated Functions
      "function transfer(address to, uint amount) returns (bool)",
      "function approve(address spender, uint256 amount) external returns (bool)",
      "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
    ];
    const accounts = await ethers.getSigners();
    const whale = await ethers.getSigner(tokenWhale.DAI.eth);
    const dai = await ethers.getContractAt(TokenAbi, tokenAddress.DAI.eth);
    const fundAmount: bigint = 20000n * 10n ** 18n; // 20000 dai
    const borrowAmount: bigint = 10000n * 10n ** 18n; // 10000 dai
    const fee: bigint = 0n * 10n ** 18n; // 10000 dai

    const Flashloan = await ethers.getContractFactory("TestDyDxSoloMargin");
    const flashloan = await Flashloan.deploy();
    await flashloan.deployed();

    console.log(
      "B: DAI Balance of Whale",
      ethers.utils.formatEther(await dai.balanceOf(whale.address))
    );
    console.log(
      "B: DAI Balance of User",
      ethers.utils.formatEther(await dai.balanceOf(accounts[0].address))
    );

    await dai.connect(whale).transfer(accounts[0].address, fundAmount);
    expect(await dai.balanceOf(whale.address)).to.gte(fundAmount);

    console.log(
      "A: DAI Balance of Whale",
      ethers.utils.formatEther(await dai.balanceOf(whale.address))
    );
    console.log(
      "A: DAI Balance of User",
      ethers.utils.formatEther(await dai.balanceOf(accounts[0].address))
    );
    const paybackAmount = borrowAmount + fee;

    await dai.connect(accounts[0]).transfer(flashloan.address, paybackAmount);

    // expect(await dai.balanceOf(accounts[0].address)).to.gte(paybackAmount);
    return { dai, accounts, borrowAmount, fundAmount, flashloan, fee, paybackAmount }
  }

  describe("Borrow Dai", () =>
  {
    it("test flashloan", async () =>
    {
      const {dai, accounts, borrowAmount, fundAmount, flashloan, fee, paybackAmount } = await loadFixture(deployFixture)
      console.log(
        "Before Flashloan: DAI Balance of contract",
        ethers.utils.formatEther(await dai.balanceOf(flashloan.address))
      );
      console.log(
        "Before Flashloan: DAI Balance of user",
        ethers.utils.formatEther(await dai.balanceOf(accounts[0].address))
      );
      const profit = await dai.balanceOf(flashloan.address);

      console.log(
        "+++++++++++++++++++++++DYDX FlashLoaning+++++++++++++++++++++++++++++"
      );
      await flashloan.initiateFlashLoan(dai.address, borrowAmount);
      console.log(
        "+++++++++++++++++++++++Complete+++++++++++++++++++++++++++++"
      );
      // send funds to contract
      console.log(
        "After Flashloan: DAI Balance of contract",
        ethers.utils.formatEther(await dai.balanceOf(flashloan.address))
      );

      console.log(
        "After Flashloan: DAI Balance of user",
        ethers.utils.formatEther(await dai.balanceOf(accounts[0].address))
      );
    });
  });
});
