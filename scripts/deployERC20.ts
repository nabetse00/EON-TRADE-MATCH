import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();

    let initialSupply_ = "1000"
    let initialSupplyEthers_ = ethers.utils.parseEther(initialSupply_)
    let tokensFactory = await ethers.getContractFactory("TestERC20")
    let name = "Test Token A"
    let symbol = "MTKA"
    let token = await tokensFactory.deploy(name, symbol, initialSupplyEthers_)

    await token.deployed();

    console.log(
    `ERC20 deployed with ${name} name, ${symbol} symbol ${ethers.utils.formatEther(initialSupplyEthers_)} initial supply
    Admin is: ${deployer.address}
    contract address: ${token.address}`
    );

    initialSupply_ = "2000"
    initialSupplyEthers_ = ethers.utils.parseEther(initialSupply_)
    tokensFactory = await ethers.getContractFactory("TestERC20")
    name = "Test Token B"
    symbol = "MTKB"
    token = await tokensFactory.deploy(name, symbol, initialSupplyEthers_)

    await token.deployed();

    console.log(
    `ERC20 deployed with ${name} name, ${symbol} symbol ${ethers.utils.formatEther(initialSupplyEthers_)} initial supply 
    Admin is: ${deployer.address}
    contract address: ${token.address}`
    );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});