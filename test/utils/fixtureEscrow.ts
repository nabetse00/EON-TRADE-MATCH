import { ethers } from "hardhat";
import { createERC20, createERC721 } from "./utilsEscrow"

export const ESCROW_CONTRACT = "Escrow"
export const UNLOCK_TIME = 10
export const FLAT_FEES = ethers.utils.parseUnits("1.0", "mwei")

export async function deployEscrowFixture() {

    const [deployer, seller, buyer] = await ethers.getSigners();

    const escrowFactory = await ethers.getContractFactory(ESCROW_CONTRACT);
    const escrow = await escrowFactory.deploy(UNLOCK_TIME, FLAT_FEES, deployer.address);

    // deploy ERC20
    const fromTokenERC20 = await createERC20("From Token", "FrmTK", "1000000")
    const toTokenERC20 = await createERC20("to Token", "ToTK", "1000000")

    // deploy ERC721
    const fromTokenERC721 = await createERC721("From NFT", "FrmNFT")
    const toTokenERC721 = await createERC721("To NFT", "ToNFT")

    return {
        escrow: escrow, deployer: deployer, seller: seller, buyer: buyer,
        fromTokenERC20: fromTokenERC20, toTokenERC20: toTokenERC20,
        fromTokenERC721: fromTokenERC721, toTokenERC721: toTokenERC721

    };
}