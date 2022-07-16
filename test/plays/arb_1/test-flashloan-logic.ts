// will do all the functions together
// will call each test independent of each other

const { expect } = require("chai");
const { ethers, network } = require("hardhat");

const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const USDC_WHALE = "0x2FAF487A4414Fe77e2327F0bf4AE2a264a776AD2"; // find whale on etherscan => Look for exchanges like FTX || Binacne || Coinbase
const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const DAI_WHALE = "0x2FAF487A4414Fe77e2327F0bf4AE2a264a776AD2";
// const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
// const USDT_WHALE = "0x2faf487a4414fe77e2327f0bf4ae2a264a776ad2";
const address_provider = "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5";
describe("2: Test Uniswap Funcs", function ()
{
    let usdcwhale, daiwhale, usdc, accounts, arb, dai, fundAmount, borrowAmount, fee, paybackAmount;

    beforeEach(async () =>
    {
        // will mock this acct
        await network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [USDC_WHALE],
        });
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
        usdcwhale = await ethers.getSigner(USDC_WHALE);
        daiwhale = await ethers.getSigner(DAI_WHALE);
        usdc = await ethers.getContractAt(TokenAbi, USDC);
        dai = await ethers.getContractAt(TokenAbi, DAI);
        fundAmount = 200n * 10n ** 18n; // 20000 dai
        borrowAmount = 100n * 10n ** 18n; // 10000 dai
        fee = 9n * 10n ** 18n; // 10000 dai
        const ArbUSDC_USDT = await ethers.getContractFactory("arb_1");
        arb = await ArbUSDC_USDT.deploy(address_provider);
        await arb.deployed();
        // console.log('ArbContact:', arb.address)

        console.log(
            "B: DAI Balance of Whale",
            ethers.utils.formatEther(await dai.balanceOf(daiwhale.address))
          );
          console.log(
            "B: DAI Balance of User",
            ethers.utils.formatEther(await dai.balanceOf(accounts[0].address))
          );
      
          await dai.connect(daiwhale).transfer(accounts[0].address, fundAmount);
          expect(await dai.balanceOf(daiwhale.address)).to.gte(fundAmount);
      
          console.log(
            "A: DAI Balance of Whale",
            ethers.utils.formatEther(await dai.balanceOf(daiwhale.address))
          );
          console.log(
            "A: DAI Balance of User",
            ethers.utils.formatEther(await dai.balanceOf(accounts[0].address))
          );
          paybackAmount = borrowAmount + fee;
      
          await dai.connect(accounts[0]).transfer(arb.address, paybackAmount);
      

    });


    describe.only('TestFlashLoanFunc(AAVE) -> usdc', () =>
    {
        it("test flashloan", async () => {
            console.log(
              "Before Flashloan: DAI Balance of contract",
              ethers.utils.formatEther(await dai.balanceOf(arb.address))
            );
            console.log(
              "Before Flashloan: DAI Balance of user",
              ethers.utils.formatEther(await dai.balanceOf(accounts[0].address))
            );
            const profit = await dai.balanceOf(arb.address);
      
            console.log(
              "+++++++++++++++++++++++FlashLoaning+++++++++++++++++++++++++++++"
            );
            await arb.makeMoney(dai.address, borrowAmount);
            console.log(
              "+++++++++++++++++++++++Complete+++++++++++++++++++++++++++++"
            );
        // send funds to contract
            console.log(
              "After Flashloan: DAI Balance of contract",
              ethers.utils.formatEther(await dai.balanceOf(arb.address))
            );
      
            console.log(
              "After Flashloan: DAI Balance of user",
              ethers.utils.formatEther(await dai.balanceOf(accounts[0].address))
            );
          });
    });

    describe('TestFlashLoanFunc(AAVE) -> dai', () =>
    {
        it("Should flashloan dai for usdc", async () =>
        {
            // do flashloan
            // borrow dai swap for usdc
            // swap usdc back for dai

        })

    });

    describe('TestFlashLoanFunc(AAVE) -> usdc + eth ', () =>
    {
        it("Should flashloan usdc -> eth + dai", async () =>
        {
            // do flashloan
            // borrow usdc swap for eth
            // swap eth for dai
            // swap dai back for usdc
        })

    });

    describe('TestFlashLoanFunc(AAVE) -> dai + eth', () =>
    {
        it("Should flashloan dai -> eth + usdc", async () =>
        {
            // do flashloan
            // borrow dai swap for eth
            // swap eth for usdc
            // swap usdc back for dai
        })

    });


    describe('TestFlashLoanFunc(DYDX) -> usdc', () =>
    {

        it("Should flashloan usdc for dai" , async () =>
        {
            // do flashloan
            // borrow usdc swap for dai
            // swap dai back for usdc
        })

    });

    describe('TestFlashLoanFunc(DYDX) -> dai', () =>
    {
        it("Should flashloan dai for usdc", async () =>
        {
            // do flashloan
            // borrow dai swap for usdc
            // swap usdc back for dai

        })

    });

    describe('TestFlashLoanFunc(DYDX) -> usdc + eth ', () =>
    {
        it("Should flashloan usdc -> eth + dai", async () =>
        {
            // do flashloan
            // borrow usdc swap for eth
            // swap eth for dai
            // swap dai back for usdc
        })

    });

    describe('TestFlashLoanFunc(DYDX) -> dai + eth', () =>
    {
        it("Should flashloan dai -> eth + usdc", async () =>
        {
            // do flashloan
            // borrow dai swap for eth
            // swap eth for usdc
            // swap usdc back for dai
        })

    });



})



