const { expect } = require("chai");
const { ethers } = require("hardhat");

const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const DAI_WHALE = "0x2FAF487A4414Fe77e2327F0bf4AE2a264a776AD2"; // find whale on etherscan => Look for exchanges like FTX || Binacne || Coinbase
const address_provider = "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5";

describe("Chainlink Price Feeds", function () {
  let testChainlink, avaxPrice

  beforeEach(async () => {
    // will mock this acct
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [DAI_WHALE],
    });

    const TestChainlink = await ethers.getContractFactory("TestChainlink");
    testChainlink = await TestChainlink.deploy();
      await testChainlink.deployed();
      
      const AvaxPrice = await ethers.getContractFactory("AvaxPrice");
      avaxPrice = await AvaxPrice.deploy();
      await avaxPrice.deployed();
  });
  describe("Get Price", () => {
    it("eth: getLatestPrice", async () => {
      const price = await testChainlink.getLatestPrice();
      console.log(`ETH price: ${price}`);
    });
      
    it("avax: getLatestPrice", async () => {
        const price = await avaxPrice.getLatestPrice();
        console.log(`AVAX price: ${price}`);
      });
  });
});
