import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { FLAT_FEES, UNLOCK_TIME, deployEscrowFixture } from "./utils/fixtureEscrow"
import { createERC20, createERC721, printTrades, tokenERC20SetUp, tokenERC721SetUp } from "./utils/utilsEscrow";
import { Escrow } from "../typechain-types/contracts/Escrow";

describe("ErcMock Contracts", function () {

    describe("ERC20Mock", function () {
        it("Should set the right defaults and allow dispense", async function () {
            const [deployer, other] = await ethers.getSigners();
            const initialSupply = "1000";
            const initialSupply_ethers = ethers.utils.parseEther(initialSupply)
            const token = await createERC20("Token", "TK", initialSupply);
            expect(await token.balanceOf(deployer.address)).to.equal(initialSupply_ethers);
            const dispense = await token.connect(other).dispense()
            expect(dispense).to.not.be.reverted
            expect( await token.balanceOf(other.address) ).to.be.equal(ethers.utils.parseEther("10"))
        });
    });

    describe("ERC721Mock", function () {
        it("Should set the right defaults and allow dispense", async function () {
            const [deployer, other] = await ethers.getSigners();
            const nft = await createERC721("NFT 1", "NFT1");
            const dispense = await nft.connect(other).dispense("http://someurl.com/item.json")
            expect(dispense).to.not.be.reverted
            expect( await nft.balanceOf(other.address) ).to.be.equal(1)
        });
    });

});