import { ethers } from "hardhat";
import { Escrow } from "../typechain-types/contracts";
import dotenv from "dotenv"

dotenv.config({ path: '../' })

const ESCROW_CONTRACT = "Escrow"
const UNLOCK_TIME = 100
const FLAT_FEES = ethers.utils.parseUnits("1.0", "szabo")
const NFT_SERVER_URL = process.env.NFT_SERVER_URL
const BASE_URL = NFT_SERVER_URL? NFT_SERVER_URL:"https://localhost:5173"

enum AssetTypes {
  NATIVE_ZEN,
  ERC20_TOKEN,
  ERC721_NFT
}

async function main() {

  const [deployer, user1, user2, user3] = await ethers.getSigners();

  console.log(`Deployer address: ${deployer.address}`)
  console.log(`User1 address: ${user1.address}`)
  console.log(`User2 address: ${user2.address}`)
  console.log(`User3 address: ${user3.address}`)

  let initialSupply_ = "1000"
  let initialSupplyEthers_ = ethers.utils.parseEther(initialSupply_)
  let tokensFactory = await ethers.getContractFactory("TestERC20")
  let name = "Test Token A"
  let symbol = "MTKA"
  const tokenA = await tokensFactory.deploy(name, symbol, initialSupplyEthers_)

  await tokenA.deployed();

  console.log(
    `--------------------------------
  ERC20 deployed with ${name} name, ${symbol} symbol ${ethers.utils.formatEther(initialSupplyEthers_)} initial supply
  Admin is: ${deployer.address}
  contract address: ${tokenA.address}
  ---------------------------------`
  );

  let dispense = await tokenA.connect(user1).dispense()
  await dispense.wait()
  dispense = await tokenA.connect(user2).dispense()
  await dispense.wait()
  dispense = await tokenA.connect(user3).dispense()
  await dispense.wait()

  initialSupply_ = "2000"
  initialSupplyEthers_ = ethers.utils.parseEther(initialSupply_)
  tokensFactory = await ethers.getContractFactory("TestERC20")
  name = "Test Token B"
  symbol = "MTKB"
  const tokenB = await tokensFactory.deploy(name, symbol, initialSupplyEthers_)

  await tokenB.deployed();

  console.log(
    `--------------------------------
  ERC20 deployed with ${name} name, ${symbol} symbol ${ethers.utils.formatEther(initialSupplyEthers_)} initial supply 
  Admin is: ${deployer.address}
  contract address: ${tokenB.address}
  --------------------------------`);

  dispense = await tokenB.connect(user1).dispense()
  await dispense.wait()
  dispense = await tokenB.connect(user2).dispense()
  await dispense.wait()
  dispense = await tokenB.connect(user3).dispense()
  await dispense.wait()

  const nftFactory = await ethers.getContractFactory("TestERC721")
  let nameNFT = "Mock NFTs Collection 1"
  let symbolNFT = "MNFT1"
  const nft1 = await nftFactory.deploy(name, symbol)


  await nft1.deployed();

  console.log(`
  -------------------------------
  ERC721 deployed with ${nameNFT} name, ${symbolNFT} symbol
  Admin is ${deployer.address}
  contract address: ${nft1.address}
  -------------------------------
  `
  );

  for (let index = 0; index < 5; index++) {
    const res = await nft1.safeMint(deployer.address, `${BASE_URL}/nft0-item-${index}.json`)
    const log = await res.wait()
    console.log(`nft ${index} on block ${log.blockNumber}`)
    const tokid = await nft1.tokenOfOwnerByIndex(deployer.address, index)
    console.log(`nft ${index}: ${tokid.toBigInt()}`)
  }


  nameNFT = "Mock NFTs Collection 2"
  symbolNFT = "MNFT2"
  const nft2 = await nftFactory.deploy(name, symbol)

  await nft2.deployed();

  console.log(`ERC721 deployed with ${nameNFT} name, ${symbolNFT} symbol
  Admin is ${deployer.address}
  contract address: ${nft2.address}`
  );

  for (let index = 0; index < 2; index++) {
    const res = await nft2.safeMint(deployer.address, `${BASE_URL}/nft1-item-${index}.json`)
    const log = await res.wait()
    console.log(`nft ${index} on block ${log.blockNumber}`)
    const tokid = await nft2.tokenOfOwnerByIndex(deployer.address, index)
    console.log(`nft ${index}: ${tokid.toBigInt()}`)
  }

  console.log(`========= Escrow ===========`)

  const escrowFactory = await ethers.getContractFactory(ESCROW_CONTRACT);
  const escrow = await escrowFactory.deploy(UNLOCK_TIME, FLAT_FEES, deployer.address);

  await escrow.deployed();

  console.log(
    `Escrow deployed with ${UNLOCK_TIME} unlock minimal value,  
     ${ethers.utils.formatEther(FLAT_FEES)} ETH deployed to ${escrow.address}
     admin is ${deployer.address}`
  );

  console.log(`========= Trades ===========`)

  const zen_amount1 = ethers.utils.parseEther("1")
  const zen_amount2 = ethers.utils.parseEther("2")
  const zen_amount3 = ethers.utils.parseEther("3")
  const zen_amount4 = ethers.utils.parseEther("4")
  const amount = 2
  const erc20_amount1 = ethers.utils.parseEther(amount.toString())
  const erc20_amount2 = ethers.utils.parseEther((amount * 2).toString())
  const erc20_amount3 = ethers.utils.parseEther((amount * 3).toString())
  const duration = 100

  let fromAsset: Escrow.AssetStruct = {
    assetId: 0,
    assetType: AssetTypes.NATIVE_ZEN,
    assetAddress: ethers.constants.AddressZero,
    amount: zen_amount1
  };

  let toAsset: Escrow.AssetStruct = {
    assetId: 0,
    assetType: AssetTypes.ERC20_TOKEN,
    assetAddress: tokenA.address,
    amount: erc20_amount1
  };


  // allowances
  let tx = await tokenA.connect(user1).approve(escrow.address, erc20_amount1)
  await tx.wait()
  tx = await tokenA.connect(user2).approve(escrow.address, erc20_amount1)
  await tx.wait()
  tx = await tokenA.connect(user3).approve(escrow.address, erc20_amount1)
  await tx.wait()
  tx = await tokenB.connect(user1).approve(escrow.address, erc20_amount1)
  await tx.wait()
  tx = await tokenB.connect(user2).approve(escrow.address, erc20_amount1)
  await tx.wait()
  tx = await tokenB.connect(user3).approve(escrow.address, erc20_amount1)
  await tx.wait()

  // ZEN => tokenA
  let create = await escrow.connect(user1).createTrade(user1.address, fromAsset, [], toAsset, true, duration, { value: zen_amount1.add(FLAT_FEES) })
  await create.wait()
  fromAsset.amount = zen_amount2
  create = await escrow.connect(user2).createTrade(user2.address, fromAsset, [], toAsset, true, duration, { value: zen_amount2.add(FLAT_FEES) })
  await create.wait()
  fromAsset.amount = zen_amount3
  create = await escrow.connect(user3).createTrade(user3.address, fromAsset, [], toAsset, true, duration, { value: zen_amount3.add(FLAT_FEES) })
  await create.wait()

  // ZEN => token B
  fromAsset.amount = zen_amount1
  toAsset.assetAddress = tokenB.address
  create = await escrow.connect(user1).createTrade(user1.address, fromAsset, [], toAsset, true, duration, { value: zen_amount1.add(FLAT_FEES) })
  await create.wait()
  fromAsset.amount = zen_amount2
  create = await escrow.connect(user2).createTrade(user2.address, fromAsset, [], toAsset, true, duration, { value: zen_amount2.add(FLAT_FEES) })
  await create.wait()
  fromAsset.amount = zen_amount3
  create = await escrow.connect(user3).createTrade(user3.address, fromAsset, [], toAsset, true, duration, { value: zen_amount3.add(FLAT_FEES) })
  await create.wait()

  // tokenA => tokenB
  fromAsset.assetAddress = tokenA.address
  fromAsset.amount = erc20_amount1
  fromAsset.assetType = AssetTypes.ERC20_TOKEN
  toAsset.assetAddress = tokenB.address
  create = await escrow.connect(user1).createTrade(user1.address, fromAsset, [], toAsset, true, duration, { value: FLAT_FEES })
  await create.wait()

  // tokenB => tokenA
  fromAsset.assetAddress = tokenB.address
  toAsset.assetAddress = tokenA.address
  toAsset.amount = erc20_amount3
  create = await escrow.connect(user2).createTrade(user2.address, fromAsset, [], toAsset, true, duration, { value: FLAT_FEES })
  await create.wait()

  // tokenA => ZEN
  fromAsset.assetAddress = tokenA.address
  fromAsset.amount = erc20_amount1
  toAsset.assetAddress = ethers.constants.AddressZero
  toAsset.assetType = AssetTypes.NATIVE_ZEN
  toAsset.amount = zen_amount4

  create = await escrow.connect(user2).createTrade(user2.address, fromAsset, [], toAsset, true, duration, { value: FLAT_FEES })
  await create.wait()

  //NFTs
  const toksIDs = []
  for (let index = 0; index < 2; index++) {
    let res = await nft1.connect(user1).dispense(`${BASE_URL}/nft0-item-${index}.json`)
    let log = await res.wait()
    console.log(`user 1 nft1 ${index} on block ${log.blockNumber}`)
    let tokid = await nft1.connect(user1).tokenOfOwnerByIndex(user1.address, index)
    console.log(`nft1 tok id: ${index}: ${tokid.toBigInt()}`)
    res = await nft1.connect(user1).approve(escrow.address, tokid)
    await res.wait()
    toksIDs.push(tokid)

    res = await nft2.connect(user1).dispense(`${BASE_URL}/nft1-item-${index}.json`)
    log = await res.wait()
    console.log(`user 1 nft2 ${index} on block ${log.blockNumber}`)
    tokid = await nft2.connect(user1).tokenOfOwnerByIndex(user1.address, index)
    console.log(`nft1 tok id: ${index}: ${tokid.toBigInt()}`)
    res = await nft2.connect(user1).approve(escrow.address, tokid)
    await res.wait()
  }

  // 2 nft1 => 2 nft2
  fromAsset.assetType = AssetTypes.ERC721_NFT
  fromAsset.amount = 2
  fromAsset.assetAddress = nft1.address

  toAsset.assetType = AssetTypes.ERC721_NFT
  toAsset.amount = 2
  toAsset.assetAddress = nft2.address

  create = await escrow.connect(user2).createTrade(user1.address, fromAsset, toksIDs, toAsset, true, duration, { value: FLAT_FEES })
  const res = await create.wait()
  console.log(`create NFT trade status: ${res.status}`)

  console.log("END DEPLOY TEST DATA")

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});