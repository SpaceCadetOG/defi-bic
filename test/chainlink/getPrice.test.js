const { expect } = require("chai");
const { ethers } = require("hardhat");
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const DAI_WHALE = "0x2FAF487A4414Fe77e2327F0bf4AE2a264a776AD2"; // find whale on etherscan => Look for exchanges like FTX || Binacne || Coinbase
const address_provider = "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5";

describe("Chainlink Price Feeds", function () {
  describe("Get Price", () =>
  {

    it("getLatestPrice(): ETH and AVAX", async () =>
    {
      const {avax, eth} = await loadFixture(ChainLinkFixture)
      console.log(`ETH price: ${eth}`);
      console.log(`AVAX price: ${avax}`);
    });
      
  });
});
