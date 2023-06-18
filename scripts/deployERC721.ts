import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  const nftFactory = await ethers.getContractFactory("TestERC721")
  let name = "Mock ERC721 1"
  let symbol = "MNFT1"
  let nft = await nftFactory.deploy(name, symbol)

  await nft.deployed();

  console.log(
    `ERC721 deployed with ${name} name, ${symbol} symbol \n 
    Admin is ${deployer.address} \n contract address: ${nft.address}`
  );
    for (let index = 0; index < 5; index++) {
        const res = await nft.safeMint(deployer.address, `https://localhost:5173/nft0-item-${index}.json`)
        console.log(`nft ${index}: ${res.blockNumber}`)
        const tokid = await nft.tokenOfOwnerByIndex(deployer.address, index)
        console.log(`nft ${index}: ${tokid.toBigInt()}`)
    }


  name = "Mock ERC721 2"
  symbol = "MNFT2"
  nft = await nftFactory.deploy(name, symbol)

  await nft.deployed();

  console.log(
    `ERC721 deployed with ${name} name, ${symbol} symbol \n 
    Admin is ${deployer.address} \n contract address: ${nft.address}`
  );
  for (let index = 0; index < 2; index++) {
    const res = await nft.safeMint(deployer.address, `https://localhost:5173/nft1-item-${index}.json`)
    console.log(`nft ${index}: ${res.blockNumber}`)
    const tokid = await nft.tokenOfOwnerByIndex(deployer.address, index)
    console.log(`nft ${index}: ${tokid.toBigInt()}`)
}
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
