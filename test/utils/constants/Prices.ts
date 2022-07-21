const { ethers} = require("hardhat");


export async function ChainLinkFixture()
{
    let ethPrice, avaxPrice
    const EthPrice = await ethers.getContractFactory("TestChainlink");
    const AvaxPrice = await ethers.getContractFactory("AvaxPrice");


    ethPrice = await EthPrice.deploy();
    await ethPrice.deployed();
    const eth = await ethPrice.getLatestPrice();
    console.log(`ETH price: ${eth}`);
      

    avaxPrice = await AvaxPrice.deploy();
    await avaxPrice.deployed();
    const avax = await avaxPrice.getLatestPrice();
    console.log(`AVAX price: ${ avax }`);
    
    return {eth, avax}

}

export async function UniswapFixture()
{
    let ethPrice, avaxPrice
    const EthPrice = await ethers.getContractFactory("TestChainlink");
    const AvaxPrice = await ethers.getContractFactory("AvaxPrice");


    ethPrice = await EthPrice.deploy();
    await ethPrice.deployed();
    const eth = await ethPrice.getLatestPrice();
    console.log(`ETH price: ${eth}`);
      

    avaxPrice = await AvaxPrice.deploy();
    await avaxPrice.deployed();
    const avax = await avaxPrice.getLatestPrice();
    console.log(`AVAX price: ${ avax }`);
    
    return {eth, avax}


}
