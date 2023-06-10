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
        await token.connect(deployer).safeMint(seller.address)
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
