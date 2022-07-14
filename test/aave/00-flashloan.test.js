const { expect } = require("chai");
const { ethers } = require("hardhat");

const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const DAI_WHALE = "0x2FAF487A4414Fe77e2327F0bf4AE2a264a776AD2"; // find whale on etherscan => Look for exchanges like FTX || Binacne || Coinbase
const address_provider = "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5";

describe("0: Aave Flashloan", function () {
  let whale,
    dai,
    accounts,
    borrowAmount,
    fundAmount,
    flashloan,
    fee,
    paybackAmount;

  beforeEach(async () => {
    // will mock this acct
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [DAI_WHALE],
    });
    const TokenAbi = [
      "function balanceOf(address account) external view returns (uint256)",
      // Authenticated Functions
      "function transfer(address to, uint amount) returns (bool)",
      "function approve(address spender, uint256 amount) external returns (bool)",
      "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
    ];
    accounts = await ethers.getSigners();
    whale = await ethers.getSigner(DAI_WHALE);
    dai = await ethers.getContractAt(TokenAbi, DAI);
    fundAmount = 20000n * 10n ** 18n; // 20000 dai
    borrowAmount = 10000n * 10n ** 18n; // 10000 dai
    fee = 10n * 10n ** 18n; // 10000 dai

    const Flashloan = await ethers.getContractFactory("AaveFlashLoan");
    flashloan = await Flashloan.deploy(address_provider);
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
    paybackAmount = borrowAmount + fee;

    await dai.connect(accounts[0]).transfer(flashloan.address, paybackAmount);

    // expect(await dai.balanceOf(accounts[0].address)).to.gte(paybackAmount);
  });
  describe("Borrow Dai", () => {
    it("test flashloan", async () => {
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
        "+++++++++++++++++++++++FlashLoaning+++++++++++++++++++++++++++++"
      );
      await flashloan.makeMoney(dai.address, borrowAmount);
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
