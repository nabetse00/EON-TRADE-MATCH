import { ethers } from "hardhat";

const ESCROW_CONTRACT = "Escrow"
const UNLOCK_TIME = 100
const FLAT_FEES = ethers.utils.parseUnits("1.0", "szabo")

async function main() {
  const [deployer] = await ethers.getSigners();
  const escrowFactory = await ethers.getContractFactory(ESCROW_CONTRACT);
  const escrow = await escrowFactory.deploy(UNLOCK_TIME, FLAT_FEES, deployer.address);

  await escrow.deployed();

  console.log(
    `Escrow deployed with ${UNLOCK_TIME} unlock minimal value,  
     ${ethers.utils.formatEther(FLAT_FEES)} ETH deployed to ${escrow.address}
     admin is ${deployer.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
