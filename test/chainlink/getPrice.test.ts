import { tokenAddress, tokenWhale } from "../utils/constants/Tokens";
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
const { expect } = require("chai");
const { ethers, network } = require("hardhat");

describe("Chainlink Price Feeds", function () {


  async function deployFixture()
  {
    let testChainlink, avaxPrice
  // will mock this acct
  await network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [tokenAddress.DAI.eth],
  });

  const TestChainlink = await ethers.getContractFactory("TestChainlink");
  testChainlink = await TestChainlink.deploy();
    await testChainlink.deployed();
    
    const AvaxPrice = await ethers.getContractFactory("AvaxPrice");
    avaxPrice = await AvaxPrice.deploy();
    await avaxPrice.deployed();
    return { testChainlink, avaxPrice };
  }
  describe("Get Price", () =>
  {

    it("eth: getLatestPrice", async () =>
    {
      const { testChainlink } = await loadFixture(deployFixture); 
      const price = await testChainlink.getLatestPrice();
      console.log(`ETH price: ${price}`);
    });
      
    it("avax: getLatestPrice", async () =>
    {
      const {avaxPrice } = await loadFixture(deployFixture); 
        const price = await avaxPrice.getLatestPrice();
        console.log(`AVAX price: ${price}`);
      });
  });
});
