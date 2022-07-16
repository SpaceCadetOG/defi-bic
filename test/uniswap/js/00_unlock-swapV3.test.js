const { expect } = require("chai");
const { ethers } = require("hardhat");

const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const DAI_WHALE = "0x2FAF487A4414Fe77e2327F0bf4AE2a264a776AD2"; // find whale on etherscan => Look for exchanges like FTX || Binacne || Coinbase

describe.skip("0: Unlock Accts", function () {
  let whale, dai, accounts;

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
  });
  async function deployFixture()
  {

  }

  it("unlock Acct", async () =>
  {
    const amount = 100n * 10n ** 18n // 100 dai
    console.log(
      "B: DAI Balance of Whale",
      ethers.utils.formatEther(await dai.balanceOf(whale.address))
    );
    console.log(
      "B: DAI Balance of user",
      ethers.utils.formatEther(await dai.balanceOf(accounts[0].address))
    );
    expect(await dai.balanceOf(whale.address)).to.gte(amount)

    await dai.connect(whale).transfer(accounts[0].address, amount)

    console.log(
      "A: DAI Balance of Whale",
      ethers.utils.formatEther(await dai.balanceOf(whale.address))
    );
    console.log(
      "A: DAI Balance of user",
      ethers.utils.formatEther(await dai.balanceOf(accounts[0].address))
    );
  });
});
