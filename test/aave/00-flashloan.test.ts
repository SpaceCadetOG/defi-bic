import { tokenAddress, tokenWhale } from "../utils/constants/Tokens";
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { Aave } from "../utils/constants/Protocols";
import { AaveFlashloanFixture } from "../utils/fixtures/Contracts";

const { expect } = require("chai");
const { ethers, network } = require("hardhat");

describe("0: Aave Flashloan", function ()
{
  // async function deployFlashloanFixture()
  // {
  //   // will mock this acct
  //   await network.provider.request({
  //     method: "hardhat_impersonateAccount",
  //     params: [tokenWhale.DAI.eth],
  //   });
  //   const TokenAbi = [
  //     "function balanceOf(address account) external view returns (uint256)",
  //     // Authenticated Functions
  //     "function transfer(address to, uint amount) returns (bool)",
  //     "function approve(address spender, uint256 amount) external returns (bool)",
  //     "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
  //   ];
  //   const accounts = await ethers.getSigners();
  //   const whale = await ethers.getSigner(tokenWhale.DAI.eth);
  //   const dai = await ethers.getContractAt(TokenAbi, tokenAddress.DAI.eth);
  //   const fundAmount = 20000n * 10n ** 18n; // 20000 dai
  //   const borrowAmount = 10000n * 10n ** 18n; // 10000 dai
  //   const fee = 10n * 10n ** 18n; // 10000 dai

  //   const Flashloan = await ethers.getContractFactory("AaveFlashLoan");
  //   const flashloan = await Flashloan.deploy(Aave.address_provider.eth);
  //   await flashloan.deployed();

  //   console.log(
  //     "B: DAI Balance of Whale",
  //     ethers.utils.formatEther(await dai.balanceOf(whale.address))
  //   );
  //   console.log(
  //     "B: DAI Balance of User",
  //     ethers.utils.formatEther(await dai.balanceOf(accounts[0].address))
  //   );

  //   await dai.connect(whale).transfer(accounts[0].address, fundAmount);
  //   expect(await dai.balanceOf(whale.address)).to.gte(fundAmount);

  //   console.log(
  //     "A: DAI Balance of Whale",
  //     ethers.utils.formatEther(await dai.balanceOf(whale.address))
  //   );
  //   console.log(
  //     "A: DAI Balance of User",
  //     ethers.utils.formatEther(await dai.balanceOf(accounts[0].address))
  //   );
  //   let paybackAmount: BigInt = borrowAmount + fee;

  //   await dai.connect(accounts[0]).transfer(flashloan.address, paybackAmount);

  //   // expect(await dai.balanceOf(accounts[0].address)).to.gte(paybackAmount);
  //   return { accounts, whale, dai, fundAmount, borrowAmount, fee, flashloan };
  // }

  describe("Borrow Dai", () =>
  {

    it("test flashloan", async () =>
    {
      const { dai, flashloan, accounts, borrowAmount } = await loadFixture(AaveFlashloanFixture);
      console.log(
        "Before Flashloan: DAI Balance of contract",
        ethers.utils.formatEther(await dai.balanceOf(flashloan.address))
      );
      console.log(
        "Before Flashloan: DAI Balance of user",
        ethers.utils.formatEther(await dai.balanceOf(accounts[0].address))
      );
      const profit: BigInt = await dai.balanceOf(flashloan.address);

      console.log(
        "+++++++++++++++++++++++FlashLoaning+++++++++++++++++++++++++++++"
      );
      await flashloan.makeMoney(dai.address, borrowAmount);
      console.log(
        "+++++++++++++++++++++++Complete+++++++++++++++++++++++++++++"
      );
      // send funds to contract
      console.log(
        "After Flashloan: DAI Balance of contract",
        ethers.utils.formatEther(profit)
      );

      console.log(
        "After Flashloan: DAI Balance of user",
        ethers.utils.formatEther(await dai.balanceOf(accounts[0].address))
      );
    });
  });
});
