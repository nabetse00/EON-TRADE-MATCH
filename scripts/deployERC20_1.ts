import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  const initialSupply_ = "1000"
  const initialSupplyEthers_ = ethers.utils.parseEther(initialSupply_)
  const tokensFactory = await ethers.getContractFactory("TestERC20")
  const name = "Mock ERC20 1"
  const symbol = "MTK1"
  const token = await tokensFactory.deploy(name, symbol, initialSupplyEthers_)

  await token.deployed();

  console.log(
    `ERC20 deployed with ${name} name, ${symbol} symbol ${ethers.utils.formatEther(initialSupplyEthers_)} initial supply \n 
    Admin is ${deployer.address} \n contract address: ${token.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
