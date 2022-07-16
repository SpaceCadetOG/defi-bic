// will do all the functions together
// will call each test independent of each other

const { expect } = require("chai");
const { ethers, network } = require("hardhat");

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const USDC_WHALE = "0x2FAF487A4414Fe77e2327F0bf4AE2a264a776AD2"; // find whale on etherscan => Look for exchanges like FTX || Binacne || Coinbase
const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const DAI_WHALE = "0x2FAF487A4414Fe77e2327F0bf4AE2a264a776AD2";
const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const USDT_WHALE = "0x2faf487a4414fe77e2327f0bf4ae2a264a776ad2";
const address_provider = "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5";
describe("2: Test Swap Funcs", function ()
{
    let usdcwhale, usdtwhale, daiwhale, usdc, accounts, arb, usdt, dai, weth

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
        usdtwhale = await ethers.getSigner(USDT_WHALE);
        usdc = await ethers.getContractAt(TokenAbi, USDC);
        dai = await ethers.getContractAt(TokenAbi, DAI);
        usdt = await ethers.getContractAt(TokenAbi, USDT);
        weth = await ethers.getContractAt(TokenAbi, WETH);
        const ArbUSDC_USDT = await ethers.getContractFactory("arb_1");
        arb = await ArbUSDC_USDT.deploy(address_provider);
        await arb.deployed();
        console.log('ArbContact:', arb.address)

    });


    describe('Swap USDC for DAI', () =>
    {
        it("unlock Acct", async () =>
        {
            const amount = 100n * 10n ** 6n // 100 dai
            console.log(
                "B: USDC Balance of Whale",
                ethers.utils.formatUnits(await usdc.balanceOf(usdcwhale.address), 6)
            );
            console.log(
                "B: USDC Balance of user",
                ethers.utils.formatUnits(await usdc.balanceOf(accounts[0].address), 6)
            );
            expect(await usdc.balanceOf(usdcwhale.address)).to.gte(amount)

            await usdc.connect(usdcwhale).transfer(accounts[0].address, amount)
            await usdc.connect(usdcwhale).transfer(accounts[1].address, amount)

            console.log(
                `Whale sends ${ ethers.utils.formatUnits(amount, 6) } to User`,
            );
            console.log(
                "A: USDC Balance of user",
                ethers.utils.formatUnits(await usdc.balanceOf(accounts[0].address), 6)
            );
        });

        it("it should get the owner of contract", async () =>
        {
            const owner = await arb.owner()

            expect(owner).to.eq(accounts[0].address)

            console.log(
                "ContractOwner:",
                owner
            );
        });

        it("usdc -> dai  ", async () =>
        {
            const amount = 100n * 10n ** 6n // 100 dai
            const usdcAmountInMAX = 100n * 10n ** 6n;
            const usdtAmountOut = 99n * 10n ** 6n;
            console.log(
                "B: USDC Balance of Contract",
                ethers.utils.formatUnits(await usdc.balanceOf(arb.address), 6)
            );
            console.log(
                "B: USDC Balance of user",
                ethers.utils.formatUnits(await usdc.balanceOf(accounts[0].address), 6)
            );
            expect(await usdc.balanceOf(accounts[0].address)).to.gte(amount)
            console.log(
                `### User sends ${ ethers.utils.formatUnits(amount, 6) } to Contract ###`,
            );

            await usdc.connect(accounts[0]).transfer(arb.address, amount)

            console.log(
                "B: USDC Balance of contact",
                ethers.utils.formatUnits(await usdc.balanceOf(arb.address), 6)
            );
            console.log(
                "B: USDC Balance of user",
                ethers.utils.formatUnits(await usdc.balanceOf(accounts[0].address), 6)
            );

            console.log(
                "B: DAI Balance of contact (trade)",
                ethers.utils.formatUnits(await dai.balanceOf(arb.address), 18)
            );
            console.log(
                "B: DAI Balance of user (trade)",
                ethers.utils.formatUnits(await dai.balanceOf(accounts[0].address), 18)
            );

            await usdc
                .connect(accounts[0])
                .approve(arb.address, amount);

            console.log(
                "(Arbing NOW!)"
            );

            await arb.SimpleStableSwap(usdc.address, amount, usdtAmountOut)

            const balance = await arb.TokenBalance(usdt.address)
            console.log(`New DAI ${ ethers.utils.formatUnits(balance, 6) }`)


            console.log(
                "A: USDC Balance of contact (trade)",
                ethers.utils.formatUnits(await usdc.balanceOf(arb.address), 6)
            );
            console.log(
                "A: USDC Balance of user (trade)",
                ethers.utils.formatUnits(await usdc.balanceOf(accounts[0].address), 6)
            );

            console.log(
                "A: DAI Balance of contact (trade)",
                ethers.utils.formatUnits(await dai.balanceOf(arb.address), 18)
            );
            console.log(
                "A: DAI Balance of user (trade)",
                ethers.utils.formatUnits(await dai.balanceOf(accounts[0].address), 18)
            );
        });
    });

    describe('Swap DAI for USDC', () =>
    {
        it("unlock Acct", async () =>
        {
            const amount = 100n * 10n ** 18n // 100 dai
            console.log(
                "B: DAI Balance of Whale",
                ethers.utils.formatUnits(await dai.balanceOf(daiwhale.address), 18)
            );
            console.log(
                "B: DAI Balance of user",
                ethers.utils.formatUnits(await dai.balanceOf(accounts[0].address), 18)
            );
            expect(await dai.balanceOf(daiwhale.address)).to.gte(amount)

            await dai.connect(daiwhale).transfer(accounts[0].address, amount)
            await dai.connect(daiwhale).transfer(accounts[1].address, amount)

            console.log(
                `Whale sends ${ ethers.utils.formatUnits(amount, 18) } Dai to User`,

            );
            console.log(
                "A: Dai Balance of user",
                ethers.utils.formatUnits(await dai.balanceOf(accounts[0].address), 18)
            );
        });

        it("it should get the owner of contract", async () =>
        {
            const owner = await arb.owner()

            expect(owner).to.eq(accounts[0].address)

            console.log(
                "ContractOwner:",
                owner
            );
        });

        it("dai -> usdc ", async () =>
        {

            const amount = 100n * 10n ** 18n // 100 dai
            const usdcAmountInMAX = 100n * 10n ** 6n;
            const AmountOut = 99n * 10n ** 6n;
            console.log(
                "B: DAI Balance of Contract",
                ethers.utils.formatUnits(await dai.balanceOf(arb.address), 18)
            );
            console.log(
                "B: DAI Balance of user",
                ethers.utils.formatUnits(await dai.balanceOf(accounts[0].address), 18)
            );

            expect(await dai.balanceOf(accounts[0].address)).to.gte(amount)
            console.log(
                `### User sends ${ ethers.utils.formatUnits(amount, 18) } to Contract ###`,
            );

            await dai.connect(accounts[0]).transfer(arb.address, amount)

            console.log(
                "B: USDC Balance of contact",
                ethers.utils.formatUnits(await usdc.balanceOf(arb.address), 6)
            );
            console.log(
                "B: USDC Balance of user",
                ethers.utils.formatUnits(await usdc.balanceOf(accounts[0].address), 6)
            );

            console.log(
                "B: DAI Balance of contact (trade)",
                ethers.utils.formatUnits(await dai.balanceOf(arb.address), 18)
            );
            console.log(
                "B: DAI Balance of user (trade)",
                ethers.utils.formatUnits(await dai.balanceOf(accounts[0].address), 18)
            );

            await dai
                .connect(accounts[0])
                .approve(arb.address, amount);

            console.log(
                "(Arbing NOW!)"
            );

            await arb.SimpleStableSwap(dai.address, amount, AmountOut)

            const balance = await arb.TokenBalance(usdc.address)
            console.log(`New USDC ${ ethers.utils.formatUnits(balance, 6) }`)


            console.log(
                "A: USDC Balance of contact (trade)",
                ethers.utils.formatUnits(await usdc.balanceOf(arb.address), 6)
            );
            console.log(
                "A: USDC Balance of user (trade)",
                ethers.utils.formatUnits(await usdc.balanceOf(accounts[0].address), 6)
            );

            console.log(
                "A: DAI Balance of contact (trade)",
                ethers.utils.formatUnits(await usdt.balanceOf(arb.address), 18)
            );
            console.log(
                "A: DAI Balance of user (trade)",
                ethers.utils.formatUnits(await usdt.balanceOf(accounts[0].address), 18)
            );
        });
    });


    describe('Swap ETH for Stable Uniswap', () =>
    {
        it("unlock Acct", async () =>
        {
            const amount = 100n * 10n ** 18n // 100 dai
            console.log(
                "B: DAI Balance of Whale",
                ethers.utils.formatUnits(await dai.balanceOf(daiwhale.address), 18)
            );
            console.log(
                "B: DAI Balance of user",
                ethers.utils.formatUnits(await dai.balanceOf(accounts[0].address), 18)
            );
            expect(await dai.balanceOf(daiwhale.address)).to.gte(amount)

            await dai.connect(daiwhale).transfer(accounts[0].address, amount)
            await dai.connect(daiwhale).transfer(accounts[1].address, amount)

            console.log(
                `Whale sends ${ ethers.utils.formatUnits(amount, 18) } Dai to User`,

            );
            console.log(
                "A: Dai Balance of user",
                ethers.utils.formatUnits(await dai.balanceOf(accounts[0].address), 18)
            );
        });

        it("it should get the owner of contract", async () =>
        {
            const owner = await arb.owner()

            expect(owner).to.eq(accounts[0].address)

            console.log(
                "ContractOwner:",
                owner
            );
        });

        it("dai -> weth ", async () =>
        {

            const amount = 100n * 10n ** 18n // 100 dai
            const usdcAmountInMAX = 100n * 10n ** 6n;
            const AmountOut = 99n * 10n ** 6n;
            console.log(`B: DAI Balance of Contract: ${ ethers.utils.formatUnits(await dai.balanceOf(arb.address), 18) }`);
            console.log(`"B: DAI Balance of user: ${ ethers.utils.formatUnits(await dai.balanceOf(accounts[0].address), 18) }`);

            expect(await dai.balanceOf(accounts[0].address)).to.gte(amount)
            console.log(
                `### User sends ${ ethers.utils.formatUnits(amount, 18) } to Contract ###`,
            );

            await dai.connect(accounts[0]).transfer(arb.address, amount)

            console.log(
                "B: WETHBalance of contact",
                ethers.utils.formatUnits(await weth.balanceOf(arb.address), 6)
            );
            console.log(
                "B: WTH Balance of user",
                ethers.utils.formatUnits(await weth.balanceOf(accounts[0].address), 6)
            );

            console.log(
                "B: DAI Balance of contact (trade)",
                ethers.utils.formatUnits(await dai.balanceOf(arb.address), 18)
            );
            console.log(
                "B: DAI Balance of user (trade)",
                ethers.utils.formatUnits(await dai.balanceOf(accounts[0].address), 18)
            );

            await dai
                .connect(accounts[0])
                .approve(arb.address, amount);

            console.log(
                "+++++++++++++++++++++++++++++++++++++++++++++++++++"
            );
            console.log(
                `(SWAPPING ${ ethers.utils.formatUnits(await dai.balanceOf(arb.address), 18) } dai -> WETH)`
            );
            console.log(
                "+++++++++++++++++++++++++++++++++++++++++++++++++++"
            );
            await arb.SimpleStableETHSwap(dai.address, amount, AmountOut)

            const balance = await arb.TokenBalance(weth.address)
            console.log(`New WETH ${ ethers.utils.formatUnits(balance, 18) }`)
            console.log(
                "+++++++++++++++++++++++++++++++++++++++++++++++++++"
            );

            await arb.SimpleETHStableSwap(dai.address, balance, AmountOut)
            console.log(
                `(SWAPPING ${ ethers.utils.formatUnits(balance, 18) } weth -> DAI) `
            );
            console.log(
                "+++++++++++++++++++++++++++++++++++++++++++++++++++"
            );
            console.log(
                "A: WETH Balance of contact (trade)",
                ethers.utils.formatUnits(await weth.balanceOf(arb.address), 18)
            );
            console.log(
                "A: WETH Balance of user (trade)",
                ethers.utils.formatUnits(await weth.balanceOf(accounts[0].address), 18)
            );

            console.log(
                "A: DAI Balance of contact (trade)",
                ethers.utils.formatUnits(await dai.balanceOf(arb.address), 18)
            );
            console.log(
                "A: DAI Balance of user (trade)",
                ethers.utils.formatUnits(await dai.balanceOf(accounts[0].address), 18)
            );
        });
    });

    describe('Swap ETH for Stable Sushiswap', () =>
    {
        it("unlock Acct", async () =>
        {
            const amount = 100n * 10n ** 18n // 100 dai
            console.log(
                "B: DAI Balance of Whale",
                ethers.utils.formatUnits(await dai.balanceOf(daiwhale.address), 18)
            );
            console.log(
                "B: DAI Balance of user",
                ethers.utils.formatUnits(await dai.balanceOf(accounts[0].address), 18)
            );
            expect(await dai.balanceOf(daiwhale.address)).to.gte(amount)

            await dai.connect(daiwhale).transfer(accounts[0].address, amount)
            await dai.connect(daiwhale).transfer(accounts[1].address, amount)

            console.log(
                `Whale sends ${ ethers.utils.formatUnits(amount, 18) } Dai to User`,

            );
            console.log(
                "A: Dai Balance of user",
                ethers.utils.formatUnits(await dai.balanceOf(accounts[0].address), 18)
            );
        });

        it("it should get the owner of contract", async () =>
        {
            const owner = await arb.owner()

            expect(owner).to.eq(accounts[0].address)

            console.log(
                "ContractOwner:",
                owner
            );
        });

        it("dai -> weth ", async () =>
        {

            const amount = 100n * 10n ** 18n // 100 dai
            const usdcAmountInMAX = 100n * 10n ** 6n;
            const AmountOut = 99n * 10n ** 6n;
            console.log(`B: DAI Balance of Contract: ${ ethers.utils.formatUnits(await dai.balanceOf(arb.address), 18) }`);
            console.log(`"B: DAI Balance of user: ${ ethers.utils.formatUnits(await dai.balanceOf(accounts[0].address), 18) }`);

            expect(await dai.balanceOf(accounts[0].address)).to.gte(amount)
            console.log(
                `### User sends ${ ethers.utils.formatUnits(amount, 18) } to Contract ###`,
            );

            await dai.connect(accounts[0]).transfer(arb.address, amount)

            console.log(
                "B: WETHBalance of contact",
                ethers.utils.formatUnits(await weth.balanceOf(arb.address), 6)
            );
            console.log(
                "B: WTH Balance of user",
                ethers.utils.formatUnits(await weth.balanceOf(accounts[0].address), 6)
            );

            console.log(
                "B: DAI Balance of contact (trade)",
                ethers.utils.formatUnits(await dai.balanceOf(arb.address), 18)
            );
            console.log(
                "B: DAI Balance of user (trade)",
                ethers.utils.formatUnits(await dai.balanceOf(accounts[0].address), 18)
            );

            await dai
                .connect(accounts[0])
                .approve(arb.address, amount);

            console.log(
                "+++++++++++++++++++++++++++++++++++++++++++++++++++"
            );
            console.log(
                `(SWAPPING ${ ethers.utils.formatUnits(await dai.balanceOf(arb.address), 18) } dai -> WETH)`
            );
            console.log(
                "+++++++++++++++++++++++++++++++++++++++++++++++++++"
            );
            await arb.SimpleStableETHSushi(dai.address, amount, AmountOut)

            const balance = await arb.TokenBalance(weth.address)
            console.log(`New WETH ${ ethers.utils.formatUnits(balance, 18) }`)
            console.log(
                "+++++++++++++++++++++++++++++++++++++++++++++++++++"
            );

            await arb.SimpleETHStableSushi(dai.address, balance, AmountOut)
            console.log(
                `(SWAPPING ${ ethers.utils.formatUnits(balance, 18) } weth -> DAI) `
            );
            console.log(
                "+++++++++++++++++++++++++++++++++++++++++++++++++++"
            );
            console.log(
                "A: WETH Balance of contact (trade)",
                ethers.utils.formatUnits(await weth.balanceOf(arb.address), 18)
            );
            console.log(
                "A: WETH Balance of user (trade)",
                ethers.utils.formatUnits(await weth.balanceOf(accounts[0].address), 18)
            );

            console.log(
                "A: DAI Balance of contact (trade)",
                ethers.utils.formatUnits(await dai.balanceOf(arb.address), 18)
            );
            console.log(
                "A: DAI Balance of user (trade)",
                ethers.utils.formatUnits(await dai.balanceOf(accounts[0].address), 18)
            );
        });
    });



})



