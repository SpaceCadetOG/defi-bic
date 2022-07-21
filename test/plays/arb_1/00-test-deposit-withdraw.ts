// will do all the functions together
// will call each test independent of each other
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { Aave } from "../../utils/constants/Protocols";
import { tokenAddress, tokenWhale } from "../../utils/constants/Tokens";
const { expect } = require("chai");
const { ethers, network } = require("hardhat");

const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const DAI_WHALE = "0x2FAF487A4414Fe77e2327F0bf4AE2a264a776AD2"; // find whale on etherscan => Look for exchanges like FTX || Binacne || Coinbase

describe("Test Deposit & Withdraw", function ()
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

        const ArbUSDC_USDT = await ethers.getContractFactory("arb_1");
        const arb = await ArbUSDC_USDT.deploy(Aave.address_provider.eth);
        await arb.deployed();
        console.log('ArbContact:', arb.address)

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
        await dai.connect(whale).transfer(accounts[1].address, amount)

        console.log(
            "A: DAI Balance of Whale",
            ethers.utils.formatEther(await dai.balanceOf(whale.address))
        );
        console.log(
            "A: DAI Balance of user",
            ethers.utils.formatEther(await dai.balanceOf(accounts[0].address))
        );
        return {whale, dai, accounts, arb, amount}
    }

    describe('Test Deposit and Withdraw', () =>
    {

        it("it should get the owner of contract", async () =>
        {
            const {whale, dai, accounts, arb} = await loadFixture(deployFixture)
            const owner = await arb.owner()

            expect(owner).to.eq(accounts[0].address)

            console.log(
                "ContractOwner:",
                owner
            );
        });

    it("it should allow user to deposit funds and withdraw", async () =>
    {
        const {whale, dai, accounts, arb, amount} = await loadFixture(deployFixture)
            console.log(
                "B: DAI Balance of Contract",
                ethers.utils.formatEther(await dai.balanceOf(arb.address))
            );
            console.log(
                "B: DAI Balance of user",
                ethers.utils.formatEther(await dai.balanceOf(accounts[0].address))
            );
            expect(await dai.balanceOf(accounts[0].address)).to.gte(amount)

            await dai.connect(accounts[0]).transfer(arb.address, amount)

            console.log(
                "A: DAI Balance of contact",
                ethers.utils.formatEther(await dai.balanceOf(arb.address))
            );
            console.log(
                "A: DAI Balance of user",
                ethers.utils.formatEther(await dai.balanceOf(accounts[0].address))
            );


            console.log(
                "(withdrawing NOW!)"
            );


            // await arb.ArbIt(dai.address)

            console.log(
                "A: DAI Balance of contact (withdraw)",
                ethers.utils.formatEther(await dai.balanceOf(arb.address))
            );
            console.log(
                "A: DAI Balance of user (withdraw)",
                ethers.utils.formatEther(await dai.balanceOf(accounts[0].address))
            );
        });
    });

})



