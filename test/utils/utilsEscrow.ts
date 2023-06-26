import { ethers } from "hardhat"
import { TestERC20 } from "../../typechain-types/contracts/mocks/Erc20Mock.sol"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { Escrow } from "../../typechain-types/contracts/Escrow"
import { TestERC721 } from "../../typechain-types/contracts/mocks/Erc721Mock.sol"


export async function createERC20(name: string, symbol: string, initialSupply: string): Promise<TestERC20> {
    const initialSupply_ = ethers.utils.parseEther(initialSupply)
    const tokensFactory = await ethers.getContractFactory("TestERC20")
    const token = await tokensFactory.deploy(name, symbol, initialSupply_)
    return token
}

export async function createERC721(name: string, symbol: string): Promise<TestERC721> {
    const tokensERC721Factory = await ethers.getContractFactory("TestERC721")
    const tokenERC721 = await tokensERC721Factory.deploy(name, symbol)
    return tokenERC721
}

export async function tokenERC721SetUp(token: TestERC721, escrow: Escrow, deployer: SignerWithAddress, seller: SignerWithAddress, amount: number): Promise<string[]> {
    let tokensIds: string[] = []
    for (let index = 0; index < amount; index++) {
        await token.connect(deployer).safeMint(seller.address, "https://site.example/item-id-xx.json")
        const id = await token.tokenOfOwnerByIndex(seller.address, index)
        tokensIds.push(id.toString())
        await token.connect(seller).approve(escrow.address, id)
    }

    return tokensIds;

}

export async function tokenERC20SetUp(token: TestERC20, escrow: Escrow, deployer: SignerWithAddress, seller: SignerWithAddress, amount: number): Promise<void> {
    await token.connect(deployer).transfer(seller.address, ethers.utils.parseEther(amount.toString()))
    await token.connect(seller).approve(escrow.address, ethers.utils.parseEther(amount.toString()))
}

export async function printTrades(escrow: Escrow, addrToTok: (arg:string)=> string){
    const trades = await escrow.getTrades()
    console.log(`=============================TRADES==========================`)        
    for (let index = 0; index < trades.length; index++) {
        const t = trades[index];
        console.log(`=============================================================`)
        console.log(`Trade id: ${t.tradeId} - ${t.owner == escrow.address ? "virtual" : "normal"}`)
        console.log(`from ${addrToTok(t.fromAsset.assetAddress)} amount ${ethers.utils.formatEther(t.fromAsset.amount)}`)
        console.log(`to ${addrToTok(t.toAsset.assetAddress)} amount  ${ethers.utils.formatEther(t.toAsset.amount)}`)
        if(t.owner == escrow.address){
            const tv1 = await escrow.virtualTradeData(t.tradeId, 0)
            const tv2 = await escrow.virtualTradeData(t.tradeId, 1)
            console.log(`[${tv1} / ${tv2}]`)
        }
        console.log(`=============================================================`)
    }
}