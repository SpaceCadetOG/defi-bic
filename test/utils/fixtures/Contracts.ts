
import { Wallet } from "@ethersproject/wallet";
import { Aave } from "../constants/Protocols";
import { tokenAddress, tokenWhale } from "../constants/Tokens";

export async function AaveFlashloanFixture()
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
  const fundAmount = 20000n * 10n ** 18n; // 20000 dai
  const borrowAmount = 10000n * 10n ** 18n; // 10000 dai
  const fee = 10n * 10n ** 18n; // 10000 dai

  const Flashloan = await ethers.getContractFactory("AaveFlashLoan");
  const flashloan = await Flashloan.deploy(Aave.address_provider.eth);
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
  let paybackAmount: BigInt = borrowAmount + fee;

  await dai.connect(accounts[0]).transfer(flashloan.address, paybackAmount);

  // expect(await dai.balanceOf(accounts[0].address)).to.gte(paybackAmount);
  return { accounts, whale, dai, fundAmount, borrowAmount, fee, flashloan };
}