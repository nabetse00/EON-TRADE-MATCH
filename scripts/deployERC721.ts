import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  const nftFactory = await ethers.getContractFactory("TestERC721")
  let name = "Mock NFTs Collection 1"
  let symbol = "MNFT1"
  let nft = await nftFactory.deploy(name, symbol)

  await nft.deployed();

  console.log(`ERC721 deployed with ${name} name, ${symbol} symbol
  Admin is ${deployer.address}
  contract address: ${nft.address}`
  );

  for (let index = 0; index < 5; index++) {
    const res = await nft.safeMint(deployer.address, `https://localhost:5173/nft0-item-${index}.json`)
    const log = await res.wait()
    console.log(`nft ${index} on block ${log.blockNumber}`)
    const tokid = await nft.tokenOfOwnerByIndex(deployer.address, index)
    console.log(`nft ${index}: ${tokid.toBigInt()}`)
  }


  name = "Mock NFTs Collection 2"
  symbol = "MNFT2"
  nft = await nftFactory.deploy(name, symbol)

  await nft.deployed();

  console.log(`ERC721 deployed with ${name} name, ${symbol} symbol
  Admin is ${deployer.address}
  contract address: ${nft.address}`
  );

  for (let index = 0; index < 2; index++) {
    const res = await nft.safeMint(deployer.address, `https://localhost:5173/nft1-item-${index}.json`)
    const log = await res.wait()
    console.log(`nft ${index} on block ${log.blockNumber}`)
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
