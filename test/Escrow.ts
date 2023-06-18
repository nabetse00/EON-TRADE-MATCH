import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { FLAT_FEES, UNLOCK_TIME, deployEscrowFixture } from "./utils/fixtureEscrow"
import { createERC20, createERC721, tokenERC20SetUp, tokenERC721SetUp } from "./utils/utilsEscrow";
import { Escrow } from "../typechain-types/contracts/Escrow";
import { Bytecode } from "hardhat/internal/hardhat-network/stack-traces/model";

enum AssetTypes {
    NATIVE_ZEN,
    ERC20_TOKEN,
    ERC721_NFT
}

describe("Escrow Contract", function () {

    describe("Contract Deployment", function () {
        it("Should set the right defaults", async function () {
            const { escrow, deployer } = await loadFixture(deployEscrowFixture);
            expect(await escrow.minLockTime()).to.equal(UNLOCK_TIME);
            expect(await escrow.lastTradeIndex()).to.equal(0);
            expect(await escrow.administrator()).to.equal(deployer.address);
            expect(await escrow.flat_fee()).to.equal(FLAT_FEES);
        });
    });

    describe("Trade creation", function () {

        it("Not allow incorrect assets ", async function () {
            const { escrow, deployer, buyer, seller, fromTokenERC20, toTokenERC20, fromTokenERC721, toTokenERC721 } = await loadFixture(deployEscrowFixture);
            let fromAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.NATIVE_ZEN,
                assetAddress: fromTokenERC20.address,
                amount: 10
            };

            let toAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: toTokenERC20.address,
                amount: 100
            };
            let invalid_create = escrow.createTrade(buyer.address, fromAsset, [], toAsset, false, 100, { value: FLAT_FEES })
            await expect(invalid_create)
                .to.be.revertedWith('Invalid asset address for NATIVE ZEN, should be zero address')
            fromAsset.assetAddress = ethers.constants.AddressZero
            toAsset.assetAddress = ethers.constants.AddressZero

            invalid_create = escrow.createTrade(buyer.address, fromAsset, [], toAsset, false, 100, { value: FLAT_FEES })
            await expect(invalid_create)
                .to.be.revertedWith('Invalid asset address for ERC20, should NOT be zero address')

            fromAsset.assetType = AssetTypes.ERC721_NFT
            fromAsset.assetAddress = fromTokenERC721.address

            toAsset.assetAddress = toTokenERC20.address

            invalid_create = escrow.createTrade(buyer.address, fromAsset, [], toAsset, false, 100, { value: FLAT_FEES })
            await expect(invalid_create)
                .to.be.revertedWith('ERC721 asset amount must match given tokensIds')

            fromAsset.amount = 0;
            invalid_create = escrow.createTrade(buyer.address, fromAsset, [], toAsset, false, 100, { value: FLAT_FEES })
            await expect(invalid_create)
                .to.be.revertedWith('Invalid Amount must be > 0')

            fromAsset.amount = 10;
            fromAsset.assetAddress = ethers.constants.AddressZero
            invalid_create = escrow.createTrade(buyer.address, fromAsset, [], toAsset, false, 100, { value: FLAT_FEES })
            await expect(invalid_create)
                .to.be.revertedWith("Invalid asset address for ERC721, should NOT be zero address")

            fromAsset.assetType = AssetTypes.ERC20_TOKEN
            fromAsset.assetAddress = ethers.constants.AddressZero
            invalid_create = escrow.createTrade(buyer.address, fromAsset, [], toAsset, false, 100, { value: FLAT_FEES })
            await expect(invalid_create)
                .to.be.revertedWith("Invalid asset address for ERC20, should NOT be zero address")

            fromAsset.assetType = AssetTypes.ERC20_TOKEN
            fromAsset.assetAddress = fromTokenERC20.address
            invalid_create = escrow.createTrade(buyer.address, fromAsset, [], toAsset, false, 1, { value: FLAT_FEES })
            await expect(invalid_create)
                .to.be.revertedWith("Trade duration too low")

            invalid_create = escrow.createTrade(buyer.address, fromAsset, [], toAsset, false, 100, { value: FLAT_FEES.div(2) })
            await expect(invalid_create)
                .to.be.revertedWith("Trade flat_fee not met")


        });
        it("Not allow assets with insuficient balances", async function () {
            const { escrow, deployer, buyer, seller, fromTokenERC20, toTokenERC20,
                fromTokenERC721, toTokenERC721 } = await loadFixture(deployEscrowFixture);
            let fromAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.NATIVE_ZEN,
                assetAddress: ethers.constants.AddressZero,
                amount: 10
            };

            let toAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: toTokenERC20.address,
                amount: 100
            };

            let invalid_create = escrow.createTrade(buyer.address, fromAsset, [], toAsset, false, 100, { value: FLAT_FEES })
            await expect(invalid_create)
                .to.be.revertedWith('Not enought ZEN sent')

            fromAsset.assetType = AssetTypes.ERC20_TOKEN
            fromAsset.assetAddress = fromTokenERC20.address
            invalid_create = escrow.createTrade(buyer.address, fromAsset, [], toAsset, false, 100, { value: FLAT_FEES })
            await expect(invalid_create)
                .to.be.revertedWith('ERC20: insufficient allowance')
        });

        it("Create correctly Zen => tokenA and tokenB => zen trades", async function () {
            const { escrow, deployer, buyer, seller, fromTokenERC20,
                toTokenERC20, fromTokenERC721, toTokenERC721 } = await loadFixture(deployEscrowFixture);
            const beforeEscrowBal = await ethers.provider.getBalance(escrow.address)
            const zen_amount = ethers.utils.parseEther("1000")
            const amount = 100
            const erc20_amount = ethers.utils.parseEther(amount.toString())
            const duration = 100
            let fromAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.NATIVE_ZEN,
                assetAddress: ethers.constants.AddressZero,
                amount: zen_amount
            };

            let toAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: fromTokenERC20.address,
                amount: erc20_amount
            };

            const orig_from_asset0 =
                [
                    ethers.BigNumber.from("0"),
                    Number(AssetTypes.NATIVE_ZEN),
                    ethers.constants.AddressZero,
                    zen_amount
                ];
            const orig_to_asset0 =
                [
                    ethers.BigNumber.from("1"),
                    Number(AssetTypes.ERC20_TOKEN),
                    fromTokenERC20.address,
                    erc20_amount
                ];

            // Add first Trade
            const sellerBeforeCreateBal = await ethers.provider.getBalance(seller.address);
            let valid_create = await escrow.connect(seller).createTrade(seller.address, fromAsset, [], toAsset, false, duration, { value: zen_amount.add(FLAT_FEES) })
            await expect(valid_create).to.not.be.reverted
            const receipt = await valid_create.wait();
            const gasUsedSeller = receipt.cumulativeGasUsed.mul(receipt.effectiveGasPrice)
            const expTime0 = (await ethers.provider.getBlock(valid_create.blockNumber!)).timestamp + duration
            const sellerAfterCreateBal = await ethers.provider.getBalance(seller.address);

            expect(sellerBeforeCreateBal.sub(sellerAfterCreateBal)).to.be.equal(zen_amount.add(gasUsedSeller).add(FLAT_FEES))
            const orig_trade0 = [
                ethers.BigNumber.from("0"),
                seller.address,
                orig_from_asset0,
                orig_to_asset0,
                false,
                expTime0
            ]
            await expect(valid_create).to.emit(escrow, "TradeCreated")

            // Add second Trade
            toAsset = {
                assetId: 0,
                assetType: AssetTypes.NATIVE_ZEN,
                assetAddress: ethers.constants.AddressZero,
                amount: zen_amount
            };

            fromAsset = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: toTokenERC20.address,
                amount: erc20_amount
            };
            await tokenERC20SetUp(toTokenERC20, escrow, deployer, buyer, amount)

            const buyerBeforeCreateBal = await toTokenERC20.balanceOf(buyer.address)
            valid_create = await escrow.createTrade(buyer.address, fromAsset, [], toAsset, false, duration, { value: FLAT_FEES })
            await expect(valid_create).to.not.be.reverted
            const buyerAfterCreateBal = await toTokenERC20.balanceOf(buyer.address)
            expect(buyerBeforeCreateBal.sub(buyerAfterCreateBal)).to.equal(erc20_amount)
            const expTime1 = (await ethers.provider.getBlock(valid_create.blockNumber!)).timestamp + duration

            const orig_to_asset1 =
                [
                    ethers.BigNumber.from("3"),
                    Number(AssetTypes.NATIVE_ZEN),
                    ethers.constants.AddressZero,
                    zen_amount
                ];
            const orig_from_asset1 =
                [
                    ethers.BigNumber.from("2"),
                    Number(AssetTypes.ERC20_TOKEN),
                    toTokenERC20.address,
                    erc20_amount
                ];

            const orig_trade1 = [
                ethers.BigNumber.from("1"),
                buyer.address,
                orig_from_asset1,
                orig_to_asset1,
                false,
                expTime1
            ]
            await expect(valid_create).to.emit(escrow, "TradeCreated")
            await expect(valid_create).to.not.emit(escrow, "TradeRemoved")
            await expect(valid_create).to.not.emit(escrow, "TradesPartialyMatched")

            // check trades
            let trades = await escrow.tradesOf(seller.address)
            await expect(trades.length).to.be.equal(1);
            await expect(trades[0]).to.deep.equal(orig_trade0)
            trades = await escrow.tradesOf(buyer.address)
            await expect(trades.length).to.be.equal(1);
            await expect(trades[0]).to.deep.equal(orig_trade1)

            // check contract balances
            const afterEscrowBal = await ethers.provider.getBalance(escrow.address)
            await expect(afterEscrowBal.sub(beforeEscrowBal)).to.be.equal(zen_amount.add(FLAT_FEES.mul(2)))
            await expect(await fromTokenERC20.balanceOf(escrow.address)).to.be.equal(0)
            await expect(await toTokenERC20.balanceOf(escrow.address)).to.be.equal(erc20_amount)
            await expect(await escrow.availableFees()).to.equal(FLAT_FEES.mul(2))
        });

        it("Create correctly Zen => tokenA and tokenA => tokenB trades", async function () {
            const { escrow, deployer, buyer, seller, fromTokenERC20,
                toTokenERC20, fromTokenERC721, toTokenERC721 } = await loadFixture(deployEscrowFixture);
            const beforeEscrowBal = await ethers.provider.getBalance(escrow.address)
            const zen_amount = ethers.utils.parseEther("1000")
            const amount = 100
            const erc20_amount = ethers.utils.parseEther(amount.toString())
            const duration = 100
            let fromAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.NATIVE_ZEN,
                assetAddress: ethers.constants.AddressZero,
                amount: zen_amount
            };

            let toAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: fromTokenERC20.address,
                amount: erc20_amount
            };

            const orig_from_asset0 =
                [
                    ethers.BigNumber.from("0"),
                    Number(AssetTypes.NATIVE_ZEN),
                    ethers.constants.AddressZero,
                    zen_amount
                ];
            const orig_to_asset0 =
                [
                    ethers.BigNumber.from("1"),
                    Number(AssetTypes.ERC20_TOKEN),
                    fromTokenERC20.address,
                    erc20_amount
                ];

            // Add first Trade
            const sellerBeforeCreateBal = await ethers.provider.getBalance(seller.address);
            let valid_create = await escrow.connect(seller).createTrade(seller.address, fromAsset, [], toAsset, false, duration, { value: zen_amount.add(FLAT_FEES) })
            await expect(valid_create).to.not.be.reverted
            const receipt = await valid_create.wait();
            const gasUsedSeller = receipt.cumulativeGasUsed.mul(receipt.effectiveGasPrice)
            const expTime0 = (await ethers.provider.getBlock(valid_create.blockNumber!)).timestamp + duration
            const sellerAfterCreateBal = await ethers.provider.getBalance(seller.address);

            expect(sellerBeforeCreateBal.sub(sellerAfterCreateBal)).to.be.equal(zen_amount.add(gasUsedSeller).add(FLAT_FEES))
            const orig_trade0 = [
                ethers.BigNumber.from("0"),
                seller.address,
                orig_from_asset0,
                orig_to_asset0,
                false,
                expTime0
            ]
            await expect(valid_create).to.emit(escrow, "TradeCreated")

            // Add second Trade
            toAsset = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: toTokenERC20.address,
                amount: erc20_amount
            };

            fromAsset = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: fromTokenERC20.address,
                amount: erc20_amount
            };
            // await tokenERC20SetUp(toTokenERC20, escrow, deployer, buyer, amount)
            await tokenERC20SetUp(fromTokenERC20, escrow, deployer, buyer, amount)

            const buyerBeforeCreateBal = await fromTokenERC20.balanceOf(buyer.address)
            valid_create = await escrow.createTrade(buyer.address, fromAsset, [], toAsset, false, duration, { value: FLAT_FEES })
            await expect(valid_create).to.not.be.reverted
            const buyerAfterCreateBal = await fromTokenERC20.balanceOf(buyer.address)
            expect(buyerBeforeCreateBal.sub(buyerAfterCreateBal)).to.equal(erc20_amount)
            const expTime1 = (await ethers.provider.getBlock(valid_create.blockNumber!)).timestamp + duration

            const orig_to_asset1 =
                [
                    ethers.BigNumber.from("3"),
                    Number(AssetTypes.ERC20_TOKEN),
                    toTokenERC20.address,
                    erc20_amount
                ];
            const orig_from_asset1 =
                [
                    ethers.BigNumber.from("2"),
                    Number(AssetTypes.ERC20_TOKEN),
                    fromTokenERC20.address,
                    erc20_amount
                ];

            const orig_trade1 = [
                ethers.BigNumber.from("1"),
                buyer.address,
                orig_from_asset1,
                orig_to_asset1,
                false,
                expTime1
            ]
            await expect(valid_create).to.emit(escrow, "TradeCreated")
            await expect(valid_create).to.not.emit(escrow, "TradeRemoved")
            await expect(valid_create).to.not.emit(escrow, "TradesPartialyMatched")

            // check trades
            let trades = await escrow.tradesOf(seller.address)
            await expect(trades.length).to.be.equal(1);
            await expect(trades[0]).to.deep.equal(orig_trade0)
            trades = await escrow.tradesOf(buyer.address)
            await expect(trades.length).to.be.equal(1);
            await expect(trades[0]).to.deep.equal(orig_trade1)

            // check contract balances
            const afterEscrowBal = await ethers.provider.getBalance(escrow.address)
            await expect(afterEscrowBal.sub(beforeEscrowBal)).to.be.equal(zen_amount.add(FLAT_FEES.mul(2)))
            await expect(await fromTokenERC20.balanceOf(escrow.address)).to.be.equal(erc20_amount)
            await expect(await toTokenERC20.balanceOf(escrow.address)).to.be.equal(0)
            await expect(await escrow.availableFees()).to.equal(FLAT_FEES.mul(2))
        });

        it("Create and not match Zen => tokenA and tokenA => zen trades on different price", async function () {
            const { escrow, deployer, buyer, seller, fromTokenERC20,
                toTokenERC20, fromTokenERC721, toTokenERC721 } = await loadFixture(deployEscrowFixture);
            const zen_amount = ethers.utils.parseEther("1000")
            const amount = 100
            const erc20_amount = ethers.utils.parseEther(amount.toString())
            const duration = 100
            let fromAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.NATIVE_ZEN,
                assetAddress: ethers.constants.AddressZero,
                amount: zen_amount
            };

            let toAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: fromTokenERC20.address,
                amount: erc20_amount
            };


            let valid_create = await escrow.createTrade(seller.address, fromAsset, [], toAsset, false, duration, { value: zen_amount.add(FLAT_FEES) })
            await expect(valid_create).to.not.be.reverted
            const sellerBeforeTrade = await fromTokenERC20.balanceOf(seller.address)
            const expTime0 = (await ethers.provider.getBlock(valid_create.blockNumber!)).timestamp + duration

            await expect(valid_create).to.emit(escrow, "TradeCreated")
            await expect(valid_create).to.not.emit(escrow, "TradesMatched")
            await expect(valid_create).to.not.emit(escrow, "TradesPartialyMatched")

            toAsset = {
                assetId: 0,
                assetType: AssetTypes.NATIVE_ZEN,
                assetAddress: ethers.constants.AddressZero,
                amount: zen_amount
            };

            fromAsset = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: fromTokenERC20.address,
                amount: erc20_amount.sub(100)
            };


            await tokenERC20SetUp(fromTokenERC20, escrow, deployer, buyer, amount)
            const buyerBeforeTrade = await ethers.provider.getBalance(buyer.address)
            valid_create = await escrow.createTrade(buyer.address, fromAsset, [], toAsset, false, duration, { value: FLAT_FEES })
            await expect(valid_create).to.not.be.reverted
            const expTime1 = (await ethers.provider.getBlock(valid_create.blockNumber!)).timestamp + duration

            await expect(valid_create).to.emit(escrow, "TradeCreated")
            await expect(valid_create).to.not.emit(escrow, "TradesMatched")
            await expect(valid_create).to.not.emit(escrow, "TradeRemoved")
            await expect(valid_create).to.not.emit(escrow, "TradesPartialyMatched")

            // check trades
            let trades = await escrow.tradesOf(seller.address)
            await expect(trades.length).to.be.equal(1);
            trades = await escrow.tradesOf(buyer.address)
            await expect(trades.length).to.be.equal(1);

            const sellerAfterTrade = await fromTokenERC20.balanceOf(seller.address)
            const buyerAfterTrade = await ethers.provider.getBalance(buyer.address)

            // check balances
            expect(sellerAfterTrade.sub(sellerBeforeTrade)).to.be.equal(0)
            expect(buyerAfterTrade.sub(buyerBeforeTrade)).to.be.equal(0)
        });

        it("Create and match Zen => tokenA and tokenA => zen trades", async function () {
            const { escrow, deployer, buyer, seller, fromTokenERC20,
                toTokenERC20, fromTokenERC721, toTokenERC721 } = await loadFixture(deployEscrowFixture);
            const zen_amount = ethers.utils.parseEther("1000")
            const amount = 100
            const erc20_amount = ethers.utils.parseEther(amount.toString())
            const duration = 100
            let fromAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.NATIVE_ZEN,
                assetAddress: ethers.constants.AddressZero,
                amount: zen_amount
            };

            let toAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: fromTokenERC20.address,
                amount: erc20_amount
            };

            const orig_from_asset0 =
                [
                    ethers.BigNumber.from("0"),
                    Number(AssetTypes.NATIVE_ZEN),
                    ethers.constants.AddressZero,
                    zen_amount
                ];
            const orig_to_asset0 =
                [
                    ethers.BigNumber.from("1"),
                    Number(AssetTypes.ERC20_TOKEN),
                    fromTokenERC20.address,
                    erc20_amount
                ];

            const orig_to_asset1 =
                [
                    ethers.BigNumber.from("3"),
                    Number(AssetTypes.NATIVE_ZEN),
                    ethers.constants.AddressZero,
                    zen_amount
                ];
            const orig_from_asset1 =
                [
                    ethers.BigNumber.from("2"),
                    Number(AssetTypes.ERC20_TOKEN),
                    fromTokenERC20.address,
                    erc20_amount
                ];

            let valid_create = await escrow.createTrade(seller.address, fromAsset, [], toAsset, false, duration, { value: zen_amount.add(FLAT_FEES) })
            await expect(valid_create).to.not.be.reverted
            const sellerBeforeTrade = await fromTokenERC20.balanceOf(seller.address)
            const expTime0 = (await ethers.provider.getBlock(valid_create.blockNumber!)).timestamp + duration

            await expect(valid_create).to.emit(escrow, "TradeCreated")
            await expect(valid_create).to.not.emit(escrow, "TradesMatched")
            await expect(valid_create).to.not.emit(escrow, "TradesPartialyMatched")

            const orig_trade0 = [
                ethers.BigNumber.from("0"),
                seller.address,
                orig_from_asset0,
                orig_to_asset0,
                false,
                expTime0
            ]

            toAsset = {
                assetId: 0,
                assetType: AssetTypes.NATIVE_ZEN,
                assetAddress: ethers.constants.AddressZero,
                amount: zen_amount
            };

            fromAsset = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: fromTokenERC20.address,
                amount: erc20_amount
            };


            await tokenERC20SetUp(fromTokenERC20, escrow, deployer, buyer, amount)
            const buyerBeforeTrade = await ethers.provider.getBalance(buyer.address)
            valid_create = await escrow.createTrade(buyer.address, fromAsset, [], toAsset, false, duration, { value: FLAT_FEES })
            await expect(valid_create).to.not.be.reverted
            const expTime1 = (await ethers.provider.getBlock(valid_create.blockNumber!)).timestamp + duration

            const orig_trade1 = [
                ethers.BigNumber.from("0"),
                seller.address,
                orig_from_asset1,
                orig_to_asset1,
                false,
                expTime1
            ]

            await expect(valid_create).to.emit(escrow, "TradeCreated")
            await expect(valid_create).to.emit(escrow, "TradesMatched")
            await expect(valid_create).to.emit(escrow, "TradeRemoved")
            await expect(valid_create).to.not.emit(escrow, "TradesPartialyMatched")

            // check trades
            const trades = await escrow.tradesOf(seller.address)
            await expect(trades.length).to.be.equal(0);

            const sellerAfterTrade = await fromTokenERC20.balanceOf(seller.address)
            const buyerAfterTrade = await ethers.provider.getBalance(buyer.address)

            // check balances
            expect(sellerAfterTrade.sub(sellerBeforeTrade)).to.be.equal(erc20_amount)
            expect(buyerAfterTrade.sub(buyerBeforeTrade)).to.be.equal(zen_amount)
        });

        it("Create and partialy match Zen (token limit) => tokenA and tokenA => zen trades, when allowed", async function () {
            const { escrow, deployer, buyer, seller, fromTokenERC20,
                toTokenERC20, fromTokenERC721, toTokenERC721 } = await loadFixture(deployEscrowFixture);
            const zen_amount0 = ethers.utils.parseEther("1000")
            const zen_amount1 = ethers.utils.parseEther("200")
            const amount0 = 100
            const amount1 = 20
            const erc20_amount0 = ethers.utils.parseEther(amount0.toString())
            const erc20_amount1 = ethers.utils.parseEther(amount1.toString())
            const duration = 100
            let fromAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.NATIVE_ZEN,
                assetAddress: ethers.constants.AddressZero,
                amount: zen_amount0
            };

            let toAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: fromTokenERC20.address,
                amount: erc20_amount0
            };

            const orig_from_asset0 =
                [
                    ethers.BigNumber.from("0"),
                    Number(AssetTypes.NATIVE_ZEN),
                    ethers.constants.AddressZero,
                    zen_amount0
                ];
            const orig_to_asset0 =
                [
                    ethers.BigNumber.from("1"),
                    Number(AssetTypes.ERC20_TOKEN),
                    fromTokenERC20.address,
                    erc20_amount0
                ];

            const orig_to_asset1 =
                [
                    ethers.BigNumber.from("3"),
                    Number(AssetTypes.NATIVE_ZEN),
                    ethers.constants.AddressZero,
                    zen_amount1
                ];
            const orig_from_asset1 =
                [
                    ethers.BigNumber.from("2"),
                    Number(AssetTypes.ERC20_TOKEN),
                    fromTokenERC20.address,
                    erc20_amount1
                ];

            let valid_create = await escrow.createTrade(seller.address, fromAsset, [], toAsset, true, duration, { value: zen_amount0.add(FLAT_FEES) })
            await expect(valid_create).to.not.be.reverted
            const expTime0 = (await ethers.provider.getBlock(valid_create.blockNumber!)).timestamp + duration

            await expect(valid_create).to.emit(escrow, "TradeCreated")
            await expect(valid_create).to.not.emit(escrow, "TradesMatched")
            await expect(valid_create).to.not.emit(escrow, "TradesPartialyMatched")

            const orig_trade0 = [
                ethers.BigNumber.from("0"),
                seller.address,
                orig_from_asset0,
                orig_to_asset0,
                false,
                expTime0
            ]

            toAsset = {
                assetId: 0,
                assetType: AssetTypes.NATIVE_ZEN,
                assetAddress: ethers.constants.AddressZero,
                amount: zen_amount1
            };

            fromAsset = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: fromTokenERC20.address,
                amount: erc20_amount1
            };


            await tokenERC20SetUp(fromTokenERC20, escrow, deployer, buyer, amount1)
            valid_create = await escrow.createTrade(buyer.address, fromAsset, [], toAsset, false, duration, { value: FLAT_FEES })
            await expect(valid_create).to.not.be.reverted
            const expTime1 = (await ethers.provider.getBlock(valid_create.blockNumber!)).timestamp + duration

            const orig_trade1 = [
                ethers.BigNumber.from("0"),
                seller.address,
                orig_from_asset1,
                orig_to_asset1,
                false,
                expTime1
            ]

            await expect(valid_create).to.emit(escrow, "TradeCreated")
            await expect(valid_create).to.not.emit(escrow, "TradesMatched")
            await expect(valid_create).to.emit(escrow, "TradeRemoved")
            await expect(valid_create).to.emit(escrow, "TradesPartialyMatched")

            // check trades
            const trades = await escrow.tradesOf(seller.address)
            await expect(trades.length).to.be.equal(1);

        });

        it("Create and do NOT partialy match Zen => tokenA and tokenA => zen trades, when NOT allowed", async function () {
            const { escrow, deployer, buyer, seller, fromTokenERC20,
                toTokenERC20, fromTokenERC721, toTokenERC721 } = await loadFixture(deployEscrowFixture);
            const zen_amount0 = ethers.utils.parseEther("1000")
            const zen_amount1 = ethers.utils.parseEther("200")
            const amount0 = 100
            const amount1 = 20
            const erc20_amount0 = ethers.utils.parseEther(amount0.toString())
            const erc20_amount1 = ethers.utils.parseEther(amount1.toString())
            const duration = 100
            let fromAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.NATIVE_ZEN,
                assetAddress: ethers.constants.AddressZero,
                amount: zen_amount0
            };

            let toAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: fromTokenERC20.address,
                amount: erc20_amount0
            };

            const orig_from_asset0 =
                [
                    ethers.BigNumber.from("0"),
                    Number(AssetTypes.NATIVE_ZEN),
                    ethers.constants.AddressZero,
                    zen_amount0
                ];
            const orig_to_asset0 =
                [
                    ethers.BigNumber.from("1"),
                    Number(AssetTypes.ERC20_TOKEN),
                    fromTokenERC20.address,
                    erc20_amount0
                ];

            const orig_to_asset1 =
                [
                    ethers.BigNumber.from("3"),
                    Number(AssetTypes.NATIVE_ZEN),
                    ethers.constants.AddressZero,
                    zen_amount1
                ];
            const orig_from_asset1 =
                [
                    ethers.BigNumber.from("2"),
                    Number(AssetTypes.ERC20_TOKEN),
                    fromTokenERC20.address,
                    erc20_amount1
                ];

            let valid_create = await escrow.createTrade(seller.address, fromAsset, [], toAsset, false, duration, { value: zen_amount0.add(FLAT_FEES) })
            await expect(valid_create).to.not.be.reverted
            const expTime0 = (await ethers.provider.getBlock(valid_create.blockNumber!)).timestamp + duration

            await expect(valid_create).to.emit(escrow, "TradeCreated")
            await expect(valid_create).to.not.emit(escrow, "TradesMatched")
            await expect(valid_create).to.not.emit(escrow, "TradesPartialyMatched")

            const orig_trade0 = [
                ethers.BigNumber.from("0"),
                seller.address,
                orig_from_asset0,
                orig_to_asset0,
                false,
                expTime0
            ]

            toAsset = {
                assetId: 0,
                assetType: AssetTypes.NATIVE_ZEN,
                assetAddress: ethers.constants.AddressZero,
                amount: zen_amount1
            };

            fromAsset = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: fromTokenERC20.address,
                amount: erc20_amount1
            };


            await tokenERC20SetUp(fromTokenERC20, escrow, deployer, buyer, amount0)
            valid_create = await escrow.createTrade(buyer.address, fromAsset, [], toAsset, false, duration, { value: FLAT_FEES })
            await expect(valid_create).to.not.be.reverted
            const expTime1 = (await ethers.provider.getBlock(valid_create.blockNumber!)).timestamp + duration

            const orig_trade1 = [
                ethers.BigNumber.from("0"),
                seller.address,
                orig_from_asset1,
                orig_to_asset1,
                false,
                expTime1
            ]

            await expect(valid_create).to.emit(escrow, "TradeCreated")
            await expect(valid_create).to.not.emit(escrow, "TradesMatched")
            await expect(valid_create).to.not.emit(escrow, "TradeRemoved")
            await expect(valid_create).to.not.emit(escrow, "TradesPartialyMatched")

            // check trades
            const trades = await escrow.tradesOf(seller.address)
            await expect(trades.length).to.be.equal(1);

        });

        it("Create and not partialy match (Zen limit) Zen => tokenA and tokenA => zen trades, when not allowed", async function () {
            const { escrow, deployer, buyer, seller, fromTokenERC20,
                toTokenERC20, fromTokenERC721, toTokenERC721 } = await loadFixture(deployEscrowFixture);
            const zen_amount1 = ethers.utils.parseEther("1000")
            const zen_amount0 = ethers.utils.parseEther("200")
            const amount1 = 100
            const amount0 = 20
            const erc20_amount0 = ethers.utils.parseEther(amount0.toString())
            const erc20_amount1 = ethers.utils.parseEther(amount1.toString())
            const duration = 100
            let fromAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.NATIVE_ZEN,
                assetAddress: ethers.constants.AddressZero,
                amount: zen_amount0
            };

            let toAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: fromTokenERC20.address,
                amount: erc20_amount0
            };

            const orig_from_asset0 =
                [
                    ethers.BigNumber.from("0"),
                    Number(AssetTypes.NATIVE_ZEN),
                    ethers.constants.AddressZero,
                    zen_amount0
                ];
            const orig_to_asset0 =
                [
                    ethers.BigNumber.from("1"),
                    Number(AssetTypes.ERC20_TOKEN),
                    fromTokenERC20.address,
                    erc20_amount0
                ];

            const orig_to_asset1 =
                [
                    ethers.BigNumber.from("3"),
                    Number(AssetTypes.NATIVE_ZEN),
                    ethers.constants.AddressZero,
                    zen_amount1
                ];
            const orig_from_asset1 =
                [
                    ethers.BigNumber.from("2"),
                    Number(AssetTypes.ERC20_TOKEN),
                    fromTokenERC20.address,
                    erc20_amount1
                ];

            let valid_create = await escrow.createTrade(seller.address, fromAsset, [], toAsset, true, duration, { value: zen_amount0.add(FLAT_FEES) })
            await expect(valid_create).to.not.be.reverted
            const expTime0 = (await ethers.provider.getBlock(valid_create.blockNumber!)).timestamp + duration

            await expect(valid_create).to.emit(escrow, "TradeCreated")
            await expect(valid_create).to.not.emit(escrow, "TradesMatched")
            await expect(valid_create).to.not.emit(escrow, "TradesPartialyMatched")

            const orig_trade0 = [
                ethers.BigNumber.from("0"),
                seller.address,
                orig_from_asset0,
                orig_to_asset0,
                false,
                expTime0
            ]

            toAsset = {
                assetId: 0,
                assetType: AssetTypes.NATIVE_ZEN,
                assetAddress: ethers.constants.AddressZero,
                amount: zen_amount1
            };

            fromAsset = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: fromTokenERC20.address,
                amount: erc20_amount1
            };


            await tokenERC20SetUp(fromTokenERC20, escrow, deployer, buyer, amount1)
            valid_create = await escrow.createTrade(buyer.address, fromAsset, [], toAsset, false, duration, { value: FLAT_FEES })
            await expect(valid_create).to.not.be.reverted
            const expTime1 = (await ethers.provider.getBlock(valid_create.blockNumber!)).timestamp + duration

            const orig_trade1 = [
                ethers.BigNumber.from("0"),
                seller.address,
                orig_from_asset1,
                orig_to_asset1,
                false,
                expTime1
            ]

            await expect(valid_create).to.emit(escrow, "TradeCreated")
            await expect(valid_create).to.not.emit(escrow, "TradesMatched")
            await expect(valid_create).to.not.emit(escrow, "TradeRemoved")
            await expect(valid_create).to.not.emit(escrow, "TradesPartialyMatched")

            // check trades
            let trades = await escrow.tradesOf(seller.address)
            await expect(trades.length).to.be.equal(1);
            trades = await escrow.tradesOf(buyer.address)
            await expect(trades.length).to.be.equal(1);

            // check fees
            await expect(await escrow.availableFees()).to.be.equal(FLAT_FEES.mul(2))

        });

        it("Create and partialy match (Zen limit) Zen => tokenA and tokenA => zen trades, when allowed", async function () {
            const { escrow, deployer, buyer, seller, fromTokenERC20,
                toTokenERC20, fromTokenERC721, toTokenERC721 } = await loadFixture(deployEscrowFixture);
            const zen_amount0 = ethers.utils.parseEther("200")
            const zen_amount1 = ethers.utils.parseEther("1000")
            const amount0 = 20
            const amount1 = 100
            const erc20_amount0 = ethers.utils.parseEther(amount0.toString())
            const erc20_amount1 = ethers.utils.parseEther(amount1.toString())
            const duration = 100
            let fromAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.NATIVE_ZEN,
                assetAddress: ethers.constants.AddressZero,
                amount: zen_amount0
            };

            let toAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: fromTokenERC20.address,
                amount: erc20_amount0
            };

            let valid_create = await escrow.createTrade(seller.address, fromAsset, [], toAsset, true, duration, { value: zen_amount0.add(FLAT_FEES) })
            await expect(valid_create).to.not.be.reverted
            // const expTime0 = (await ethers.provider.getBlock(valid_create.blockNumber!)).timestamp + duration

            await expect(valid_create).to.emit(escrow, "TradeCreated")
            await expect(valid_create).to.not.emit(escrow, "TradesMatched")
            await expect(valid_create).to.not.emit(escrow, "TradesPartialyMatched")

            toAsset = {
                assetId: 0,
                assetType: AssetTypes.NATIVE_ZEN,
                assetAddress: ethers.constants.AddressZero,
                amount: zen_amount1
            };

            fromAsset = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: fromTokenERC20.address,
                amount: erc20_amount1
            };


            await tokenERC20SetUp(fromTokenERC20, escrow, deployer, buyer, amount1)
            valid_create = await escrow.createTrade(buyer.address, fromAsset, [], toAsset, true, duration, { value: FLAT_FEES })
            await expect(valid_create).to.not.be.reverted
            // const expTime1 = (await ethers.provider.getBlock(valid_create.blockNumber!)).timestamp + duration

            await expect(valid_create).to.emit(escrow, "TradeCreated")
            await expect(valid_create).to.not.emit(escrow, "TradesMatched")
            await expect(valid_create).to.emit(escrow, "TradeRemoved")
            await expect(valid_create).to.emit(escrow, "TradesPartialyMatched")

            // check trades
            let trades = await escrow.tradesOf(seller.address)
            await expect(trades.length).to.be.equal(0);
            trades = await escrow.tradesOf(buyer.address)
            await expect(trades.length).to.be.equal(1);

            // check balances


        });


        it("Create correctly TokenA => tokenB and token C => token D trades", async function () {
            const { escrow, deployer, buyer, seller, fromTokenERC20,
                toTokenERC20, fromTokenERC721, toTokenERC721 } = await loadFixture(deployEscrowFixture);
            const beforeEscrowBal = await ethers.provider.getBalance(escrow.address)
            const amount = 100
            const erc20_amount = ethers.utils.parseEther(amount.toString())
            const duration = 100
            let fromAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: fromTokenERC20.address,
                amount: erc20_amount
            };

            let toAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: toTokenERC20.address,
                amount: erc20_amount
            };

            // Add first Trade
            await tokenERC20SetUp(fromTokenERC20, escrow, deployer, seller, amount)
            const sellerBeforeCreateBal = await fromTokenERC20.balanceOf(seller.address)
            let valid_create = await escrow.connect(seller)
                .createTrade(seller.address, fromAsset, [], toAsset, false, duration, { value: FLAT_FEES })
            await expect(valid_create).to.not.be.reverted
            const receipt = await valid_create.wait();
            const gasUsedSeller = receipt.cumulativeGasUsed.mul(receipt.effectiveGasPrice)
            const expTime0 = (await ethers.provider.getBlock(valid_create.blockNumber!)).timestamp + duration
            const sellerAfterCreateBal = await fromTokenERC20.balanceOf(seller.address)


            expect(sellerBeforeCreateBal.sub(sellerAfterCreateBal)).to.be.equal(erc20_amount)
            await expect(valid_create).to.emit(escrow, "TradeCreated")

            // Add second Trade

            const newFromToken = await createERC20("Another from token", "AFTK", (amount * 100).toString())
            const newToToken = await createERC20("Another to token", "ATTK", (amount * 100).toString())
            await tokenERC20SetUp(newFromToken, escrow, deployer, buyer, amount)

            fromAsset = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: newFromToken.address,
                amount: erc20_amount
            };

            toAsset = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: newToToken.address,
                amount: erc20_amount
            };

            const buyerBeforeCreateBal = await newFromToken.balanceOf(buyer.address)
            valid_create = await escrow.createTrade(buyer.address, fromAsset, [], toAsset, false, duration, { value: FLAT_FEES })
            await expect(valid_create).to.not.be.reverted
            const buyerAfterCreateBal = await newFromToken.balanceOf(buyer.address)
            expect(buyerBeforeCreateBal.sub(buyerAfterCreateBal)).to.equal(erc20_amount)
            const expTime1 = (await ethers.provider.getBlock(valid_create.blockNumber!)).timestamp + duration

            await expect(valid_create).to.emit(escrow, "TradeCreated")
            await expect(valid_create).to.not.emit(escrow, "TradeRemoved")
            await expect(valid_create).to.not.emit(escrow, "TradesPartialyMatched")
            await expect(valid_create).to.not.emit(escrow, "TradesMatched")

            // check trades
            let trades = await escrow.tradesOf(seller.address)
            await expect(trades.length).to.be.equal(1);
            trades = await escrow.tradesOf(buyer.address)
            await expect(trades.length).to.be.equal(1);

            // check contract balances
            const afterEscrowBal = await ethers.provider.getBalance(escrow.address)
            await expect(afterEscrowBal.sub(beforeEscrowBal)).to.be.equal(FLAT_FEES.mul(2))
            await expect(await fromTokenERC20.balanceOf(escrow.address)).to.be.equal(erc20_amount)
            await expect(await newFromToken.balanceOf(escrow.address)).to.be.equal(erc20_amount)
            await expect(await escrow.availableFees()).to.equal(FLAT_FEES.mul(2))
        });

        it("Create and match TokenA => tokenB and token B => token A trades", async function () {
            const { escrow, deployer, buyer, seller, fromTokenERC20,
                toTokenERC20, fromTokenERC721, toTokenERC721 } = await loadFixture(deployEscrowFixture);
            const beforeEscrowBal = await ethers.provider.getBalance(escrow.address)
            const amount = 100
            const erc20_amount = ethers.utils.parseEther(amount.toString())
            const duration = 100
            let fromAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: fromTokenERC20.address,
                amount: erc20_amount
            };

            let toAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: toTokenERC20.address,
                amount: erc20_amount
            };

            // Add first Trade
            await tokenERC20SetUp(fromTokenERC20, escrow, deployer, seller, amount)
            const sellerBeforeCreateBal = await fromTokenERC20.balanceOf(seller.address)
            let valid_create = await escrow.connect(seller)
                .createTrade(seller.address, fromAsset, [], toAsset, false, duration, { value: FLAT_FEES })
            await expect(valid_create).to.not.be.reverted
            const receipt = await valid_create.wait();
            const gasUsedSeller = receipt.cumulativeGasUsed.mul(receipt.effectiveGasPrice)
            const expTime0 = (await ethers.provider.getBlock(valid_create.blockNumber!)).timestamp + duration
            const sellerAfterCreateBal = await fromTokenERC20.balanceOf(seller.address)


            expect(sellerBeforeCreateBal.sub(sellerAfterCreateBal)).to.be.equal(erc20_amount)
            await expect(valid_create).to.emit(escrow, "TradeCreated")

            // Add second Trade


            await tokenERC20SetUp(toTokenERC20, escrow, deployer, buyer, amount)

            fromAsset = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: toTokenERC20.address,
                amount: erc20_amount
            };

            toAsset = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: fromTokenERC20.address,
                amount: erc20_amount
            };

            const buyerBeforeCreateBal = await toTokenERC20.balanceOf(buyer.address)
            valid_create = await escrow.createTrade(buyer.address, fromAsset, [], toAsset, false, duration, { value: FLAT_FEES })
            await expect(valid_create).to.not.be.reverted
            const buyerAfterCreateBal = await toTokenERC20.balanceOf(buyer.address)
            expect(buyerBeforeCreateBal.sub(buyerAfterCreateBal)).to.equal(erc20_amount)
            const expTime1 = (await ethers.provider.getBlock(valid_create.blockNumber!)).timestamp + duration

            await expect(valid_create).to.emit(escrow, "TradeCreated")
            await expect(valid_create).to.emit(escrow, "TradeRemoved")
            await expect(valid_create).to.not.emit(escrow, "TradesPartialyMatched")
            await expect(valid_create).to.emit(escrow, "TradesMatched")

            // check trades
            let trades = await escrow.tradesOf(seller.address)
            await expect(trades.length).to.be.equal(0);
            trades = await escrow.tradesOf(buyer.address)
            await expect(trades.length).to.be.equal(0);

            // check contract balances
            const afterEscrowBal = await ethers.provider.getBalance(escrow.address)
            await expect(afterEscrowBal.sub(beforeEscrowBal)).to.be.equal(FLAT_FEES.mul(2))
            await expect(await fromTokenERC20.balanceOf(escrow.address)).to.be.equal(0)
            await expect(await toTokenERC20.balanceOf(escrow.address)).to.be.equal(0)
            await expect(await fromTokenERC20.balanceOf(seller.address)).to.be.equal(0)
            await expect(await toTokenERC20.balanceOf(seller.address)).to.be.equal(erc20_amount)
            await expect(await fromTokenERC20.balanceOf(buyer.address)).to.be.equal(erc20_amount)
            await expect(await toTokenERC20.balanceOf(buyer.address)).to.be.equal(0)
            await expect(await escrow.availableFees()).to.equal(FLAT_FEES.mul(2))
        });

        it("Create and match partial TokenA => tokenB and token B => token A trades", async function () {
            const { escrow, deployer, buyer, seller, fromTokenERC20,
                toTokenERC20, fromTokenERC721, toTokenERC721 } = await loadFixture(deployEscrowFixture);
            const beforeEscrowBal = await ethers.provider.getBalance(escrow.address)
            const amount = 100
            const erc20_amount = ethers.utils.parseEther(amount.toString())
            const duration = 100
            let fromAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: fromTokenERC20.address,
                amount: erc20_amount
            };

            let toAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: toTokenERC20.address,
                amount: erc20_amount
            };

            // Add first Trade
            await tokenERC20SetUp(fromTokenERC20, escrow, deployer, seller, amount)
            const sellerBeforeCreateBal = await fromTokenERC20.balanceOf(seller.address)
            let valid_create = await escrow.connect(seller)
                .createTrade(seller.address, fromAsset, [], toAsset, true, duration, { value: FLAT_FEES })
            await expect(valid_create).to.not.be.reverted
            const receipt = await valid_create.wait();
            const gasUsedSeller = receipt.cumulativeGasUsed.mul(receipt.effectiveGasPrice)
            const expTime0 = (await ethers.provider.getBlock(valid_create.blockNumber!)).timestamp + duration
            const sellerAfterCreateBal = await fromTokenERC20.balanceOf(seller.address)


            expect(sellerBeforeCreateBal.sub(sellerAfterCreateBal)).to.be.equal(erc20_amount)
            await expect(valid_create).to.emit(escrow, "TradeCreated")

            // Add second Trade
            const newAmount = 30
            const newErc20Amount = ethers.utils.parseEther(newAmount.toString())
            await tokenERC20SetUp(toTokenERC20, escrow, deployer, buyer, newAmount)

            fromAsset = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: toTokenERC20.address,
                amount: newErc20Amount
            };

            toAsset = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: fromTokenERC20.address,
                amount: newErc20Amount
            };

            const buyerBeforeCreateBal = await toTokenERC20.balanceOf(buyer.address)
            valid_create = await escrow.createTrade(buyer.address, fromAsset, [], toAsset, true, duration, { value: FLAT_FEES })
            await expect(valid_create).to.not.be.reverted
            const buyerAfterCreateBal = await toTokenERC20.balanceOf(buyer.address)
            expect(buyerBeforeCreateBal.sub(buyerAfterCreateBal)).to.equal(newErc20Amount)
            const expTime1 = (await ethers.provider.getBlock(valid_create.blockNumber!)).timestamp + duration

            await expect(valid_create).to.emit(escrow, "TradeCreated")
            await expect(valid_create).to.emit(escrow, "TradeRemoved")
            await expect(valid_create).to.emit(escrow, "TradesPartialyMatched")
            await expect(valid_create).to.not.emit(escrow, "TradesMatched")

            // check trades
            let trades = await escrow.tradesOf(seller.address)
            await expect(trades.length).to.be.equal(1);
            trades = await escrow.tradesOf(buyer.address)
            await expect(trades.length).to.be.equal(0);

            // check contract balances
            const afterEscrowBal = await ethers.provider.getBalance(escrow.address)
            await expect(afterEscrowBal.sub(beforeEscrowBal)).to.be.equal(FLAT_FEES.mul(2))
            await expect(await fromTokenERC20.balanceOf(escrow.address)).to.be.equal(erc20_amount.sub(newErc20Amount))
            await expect(await toTokenERC20.balanceOf(escrow.address)).to.be.equal(0)
            await expect(await fromTokenERC20.balanceOf(seller.address)).to.be.equal(0)
            await expect(await toTokenERC20.balanceOf(seller.address)).to.be.equal(newErc20Amount)
            await expect(await fromTokenERC20.balanceOf(buyer.address)).to.be.equal(newErc20Amount)
            await expect(await toTokenERC20.balanceOf(buyer.address)).to.be.equal(0)
            await expect(await escrow.availableFees()).to.equal(FLAT_FEES.mul(2))
        });

        it("Create and match Zen => nftsA and nftsA => zen trades", async function () {
            const { escrow, deployer, buyer, seller, fromTokenERC20,
                toTokenERC20, fromTokenERC721, toTokenERC721 } = await loadFixture(deployEscrowFixture);
            const beforeEscrowBal = await ethers.provider.getBalance(escrow.address)
            const zen_amount = ethers.utils.parseEther("1000")
            const amount = 100
            const erc20_amount = ethers.utils.parseEther(amount.toString())
            const duration = 100
            let fromAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.NATIVE_ZEN,
                assetAddress: ethers.constants.AddressZero,
                amount: zen_amount
            };

            let toAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.ERC721_NFT,
                assetAddress: toTokenERC721.address,
                amount: amount
            };


            // Add first Trade
            const sellerBeforeCreateBal = await ethers.provider.getBalance(seller.address);
            let valid_create = await escrow.connect(seller).createTrade(seller.address, fromAsset, [], toAsset, false, duration, { value: zen_amount.add(FLAT_FEES) })
            await expect(valid_create).to.not.be.reverted
            const receipt = await valid_create.wait();
            const gasUsedSeller = receipt.cumulativeGasUsed.mul(receipt.effectiveGasPrice)
            const expTime0 = (await ethers.provider.getBlock(valid_create.blockNumber!)).timestamp + duration
            const sellerAfterCreateBal = await ethers.provider.getBalance(seller.address);

            expect(sellerBeforeCreateBal.sub(sellerAfterCreateBal)).to.be.equal(zen_amount.add(gasUsedSeller).add(FLAT_FEES))

            await expect(valid_create).to.emit(escrow, "TradeCreated")

            // Add second Trade
            fromAsset = {
                assetId: 0,
                assetType: AssetTypes.ERC721_NFT,
                assetAddress: toTokenERC721.address,
                amount: amount
            };

            toAsset = {
                assetId: 0,
                assetType: AssetTypes.NATIVE_ZEN,
                assetAddress: ethers.constants.AddressZero,
                amount: zen_amount
            };
            const tokensIds = await tokenERC721SetUp(toTokenERC721, escrow, deployer, buyer, amount)
            expect(await toTokenERC721.balanceOf(buyer.address)).to.be.equal(tokensIds.length)

            const buyerBeforeCreateBal = await toTokenERC721.balanceOf(buyer.address)
            const buyerZenBefore = await ethers.provider.getBalance(buyer.address)
            valid_create = await escrow.createTrade(buyer.address, fromAsset, tokensIds, toAsset, false, duration, { value: FLAT_FEES })
            await expect(valid_create).to.not.be.reverted
            const buyerAfterCreateBal = await toTokenERC721.balanceOf(buyer.address)
            const buyerZenAfter = await ethers.provider.getBalance(buyer.address)
            expect(buyerBeforeCreateBal.sub(buyerAfterCreateBal)).to.equal(amount)
            expect(await toTokenERC721.balanceOf(buyer.address)).to.be.equal(0)
            expect(await toTokenERC721.balanceOf(escrow.address)).to.be.equal(0)


            await expect(valid_create).to.emit(escrow, "TradeCreated")
            await expect(valid_create).to.emit(escrow, "TradeRemoved")
            await expect(valid_create).to.emit(escrow, "TradesMatched")
            await expect(valid_create).to.not.emit(escrow, "TradesPartialyMatched")

            // check trades
            let trades = await escrow.tradesOf(seller.address)
            await expect(trades.length).to.be.equal(0);
            trades = await escrow.tradesOf(buyer.address)
            await expect(trades.length).to.be.equal(0);

            // check contract balances
            const afterEscrowBal = await ethers.provider.getBalance(escrow.address)
            await expect(afterEscrowBal.sub(beforeEscrowBal)).to.be.equal(FLAT_FEES.mul(2))
            await expect(await toTokenERC721.balanceOf(escrow.address)).to.be.equal(0)
            await expect(await toTokenERC721.balanceOf(seller.address)).to.be.equal(amount)
            await expect(await toTokenERC721.balanceOf(buyer.address)).to.be.equal(0)
            await expect(buyerZenAfter.sub(buyerZenBefore)).to.be.equal(zen_amount)
            await expect(await escrow.availableFees()).to.equal(FLAT_FEES.mul(2))
        });

        it("Create and match partial Zen => nftsA and nftsA => zen trades", async function () {
            const { escrow, deployer, buyer, seller, fromTokenERC20,
                toTokenERC20, fromTokenERC721, toTokenERC721 } = await loadFixture(deployEscrowFixture);
            const beforeEscrowBal = await ethers.provider.getBalance(escrow.address)
            const zen_amount0 = ethers.utils.parseEther("1000")
            const amount0 = 100
            const duration = 100
            let fromAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.NATIVE_ZEN,
                assetAddress: ethers.constants.AddressZero,
                amount: zen_amount0
            };

            let toAsset: Escrow.AssetStruct = {
                assetId: 1,
                assetType: AssetTypes.ERC721_NFT,
                assetAddress: toTokenERC721.address,
                amount: amount0
            };


            // Add first Trade
            const sellerBeforeCreateBal = await ethers.provider.getBalance(seller.address);
            let valid_create = await escrow.connect(seller).createTrade(seller.address, fromAsset, [],
                toAsset, true, duration, { value: zen_amount0.add(FLAT_FEES) })
            await expect(valid_create).to.not.be.reverted
            const receipt = await valid_create.wait();
            const gasUsedSeller = receipt.cumulativeGasUsed.mul(receipt.effectiveGasPrice)
            const expTime0 = (await ethers.provider.getBlock(valid_create.blockNumber!)).timestamp + duration
            const sellerAfterCreateBal = await ethers.provider.getBalance(seller.address);

            expect(sellerBeforeCreateBal.sub(sellerAfterCreateBal)).to.be.equal(zen_amount0.add(gasUsedSeller).add(FLAT_FEES))

            await expect(valid_create).to.emit(escrow, "TradeCreated")

            const zen_amount1 = ethers.utils.parseEther("900")
            const amount1 = 90
            // Add second Trade
            fromAsset = {
                assetId: 2,
                assetType: AssetTypes.ERC721_NFT,
                assetAddress: toTokenERC721.address,
                amount: amount1
            };

            toAsset = {
                assetId: 3,
                assetType: AssetTypes.NATIVE_ZEN,
                assetAddress: ethers.constants.AddressZero,
                amount: zen_amount1
            };
            const tokensIds = await tokenERC721SetUp(toTokenERC721, escrow, deployer, buyer, amount1)
            expect(await toTokenERC721.balanceOf(buyer.address)).to.be.equal(tokensIds.length)

            const buyerBeforeCreateBal = await toTokenERC721.balanceOf(buyer.address)
            const buyerZenBefore = await ethers.provider.getBalance(buyer.address)
            valid_create = await escrow.createTrade(buyer.address, fromAsset, tokensIds, toAsset, false, duration, { value: FLAT_FEES })
            await expect(valid_create).to.not.be.reverted
            const buyerAfterCreateBal = await toTokenERC721.balanceOf(buyer.address)
            const buyerZenAfter = await ethers.provider.getBalance(buyer.address)
            expect(buyerBeforeCreateBal.sub(buyerAfterCreateBal)).to.equal(amount1)
            expect(await toTokenERC721.balanceOf(buyer.address)).to.be.equal(0)
            expect(await toTokenERC721.balanceOf(escrow.address)).to.be.equal(0)


            await expect(valid_create).to.emit(escrow, "TradeCreated")
            await expect(valid_create).to.emit(escrow, "TradeRemoved")
            await expect(valid_create).to.not.emit(escrow, "TradesMatched")
            await expect(valid_create).to.emit(escrow, "TradesPartialyMatched")

            // check trades
            let trades = await escrow.tradesOf(seller.address)
            await expect(trades.length).to.be.equal(1);
            trades = await escrow.tradesOf(buyer.address)
            await expect(trades.length).to.be.equal(0);

            // check contract balances
            const afterEscrowBal = await ethers.provider.getBalance(escrow.address)
            await expect(afterEscrowBal.sub(beforeEscrowBal)).to.be.equal(FLAT_FEES.mul(2).add(zen_amount0).sub(zen_amount1))
            await expect(await toTokenERC721.balanceOf(escrow.address)).to.be.equal(0)
            await expect(await toTokenERC721.balanceOf(seller.address)).to.be.equal(amount1)
            await expect(await toTokenERC721.balanceOf(buyer.address)).to.be.equal(0)
            await expect(buyerZenAfter.sub(buyerZenBefore)).to.be.equal(zen_amount1)
            await expect(await escrow.availableFees()).to.equal(FLAT_FEES.mul(2))
        });

        it("Create and match partial nftsA => zen and zen => nftsA trades", async function () {
            const { escrow, deployer, buyer, seller, fromTokenERC20,
                toTokenERC20, fromTokenERC721, toTokenERC721 } = await loadFixture(deployEscrowFixture);
            const beforeEscrowBal = await ethers.provider.getBalance(escrow.address)
            const zen_amount0 = ethers.utils.parseEther("1000")
            const zen_amount1 = ethers.utils.parseEther("900")
            const amount0 = 100
            const amount1 = 90
            const duration = 100
            const fromAsset0 = {
                assetId: 0,
                assetType: AssetTypes.ERC721_NFT,
                assetAddress: fromTokenERC721.address,
                amount: amount0
            };

            const toAsset0 = {
                assetId: 0,
                assetType: AssetTypes.NATIVE_ZEN,
                assetAddress: ethers.constants.AddressZero,
                amount: zen_amount0
            };

            // Add first Trade
            const tokensIds = await tokenERC721SetUp(fromTokenERC721, escrow, deployer, seller, amount0)

            let valid_create = await escrow.connect(seller).createTrade(seller.address, fromAsset0, tokensIds,
                toAsset0, true, duration, { value: FLAT_FEES })
            await expect(valid_create).to.not.be.reverted
            const expTime0 = (await ethers.provider.getBlock(valid_create.blockNumber!)).timestamp + duration
            expect(await toTokenERC721.balanceOf(seller.address)).to.be.equal(0)
            const sellerZenBalBeforeMatch = await ethers.provider.getBalance(seller.address)
            await expect(valid_create).to.emit(escrow, "TradeCreated")

            // Add second Trade
            const fromAsset1 = {
                assetId: 0,
                assetType: AssetTypes.NATIVE_ZEN,
                assetAddress: ethers.constants.AddressZero,
                amount: zen_amount1
            };

            const toAsset1 = {
                assetId: 0,
                assetType: AssetTypes.ERC721_NFT,
                assetAddress: fromTokenERC721.address,
                amount: amount1
            };

            const buyerZenBefore = await ethers.provider.getBalance(buyer.address)
            const buyerBeforeCreateBal = await fromTokenERC721.balanceOf(buyer.address)
            valid_create = await escrow.createTrade(buyer.address, fromAsset1, [], toAsset1, true, duration, { value: zen_amount1.add(FLAT_FEES) })
            await expect(valid_create).to.not.be.reverted
            const buyerAfterCreateBal = await fromTokenERC721.balanceOf(buyer.address)
            const buyerZenAfter = await ethers.provider.getBalance(buyer.address)
            const sellerZenBalAfterMatch = await ethers.provider.getBalance(seller.address)
            expect(buyerAfterCreateBal.sub(buyerBeforeCreateBal)).to.equal(amount1)
            expect(await fromTokenERC721.balanceOf(buyer.address)).to.be.equal(amount1)
            expect(await fromTokenERC721.balanceOf(escrow.address)).to.be.equal(amount0 - amount1)


            await expect(valid_create).to.emit(escrow, "TradeCreated")
            await expect(valid_create).to.emit(escrow, "TradeRemoved")
            await expect(valid_create).to.not.emit(escrow, "TradesMatched")
            await expect(valid_create).to.emit(escrow, "TradesPartialyMatched")

            // check trades
            let trades = await escrow.tradesOf(seller.address)
            await expect(trades.length).to.be.equal(1);
            trades = await escrow.tradesOf(buyer.address)
            await expect(trades.length).to.be.equal(0);

            // check contract balances
            const afterEscrowBal = await ethers.provider.getBalance(escrow.address)
            await expect(afterEscrowBal.sub(beforeEscrowBal)).to.be.equal(FLAT_FEES.mul(2))
            await expect(await fromTokenERC721.balanceOf(escrow.address)).to.be.equal(amount0 - amount1)
            await expect(await fromTokenERC721.balanceOf(seller.address)).to.be.equal(0)
            await expect(await fromTokenERC721.balanceOf(buyer.address)).to.be.equal(amount1)
            await expect(buyerZenAfter.sub(buyerZenBefore)).to.be.equal(0)
            await expect(sellerZenBalAfterMatch.sub(sellerZenBalBeforeMatch)).to.equal(zen_amount1)
            await expect(await escrow.availableFees()).to.equal(FLAT_FEES.mul(2))
        });

    });

    describe("Fees handling", function () {

        it("Should change adminstrator correctly", async function () {
            const { escrow, deployer, buyer: newAdmin, seller, fromTokenERC20, toTokenERC20, fromTokenERC721, toTokenERC721 }
                = await loadFixture(deployEscrowFixture);

            await expect(escrow.connect(seller).transferOwnership(newAdmin.address)).to.revertedWith('Only owner is allowed')
            await expect(await escrow.transferOwnership(newAdmin.address)).to.not.reverted
            await expect(await escrow.administrator()).to.be.equal(newAdmin.address)

        });

        it("Should set Fees correctly", async function () {
            const { escrow, deployer, buyer: newAdmin, seller, fromTokenERC20, toTokenERC20, fromTokenERC721, toTokenERC721 }
                = await loadFixture(deployEscrowFixture);

            await expect(escrow.connect(seller).setFee(ethers.utils.parseUnits("10", "ether"))).to.revertedWith('Only owner is allowed')
            await expect(await escrow.setFee(ethers.utils.parseUnits("10", "mwei"))).to.not.reverted
            await expect(await escrow.flat_fee()).to.be.equal(ethers.utils.parseUnits("10", "mwei"))

        });

        it("Should collect flat fee on each trade creation", async function () {
            const { escrow, deployer, buyer: feesCollector, seller, fromTokenERC20, toTokenERC20, fromTokenERC721, toTokenERC721 }
                = await loadFixture(deployEscrowFixture);
            // Trade 1: Zen => tokenA
            const zen_amount_ethers = ethers.utils.parseEther("10")
            const erc20_amount = 0.2
            const erc20_amount_ethers = ethers.utils.parseEther(erc20_amount.toString())
            let feesCollectorOriginalBal = await ethers.provider.getBalance(feesCollector.address)

            let fromAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.NATIVE_ZEN,
                assetAddress: ethers.constants.AddressZero,
                amount: zen_amount_ethers
            };

            let toAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: toTokenERC20.address,
                amount: erc20_amount_ethers
            };
            let create = await escrow.createTrade(seller.address, fromAsset, [], toAsset, false, 100, { value: zen_amount_ethers.add(FLAT_FEES) })
            await expect(create).to.not.reverted
            await expect(create).to.emit(escrow, "TradeCreated")
            await expect(create).to.not.emit(escrow, "TradeRemoved")
            await expect(await escrow.availableFees()).to.be.equal(FLAT_FEES)
            await expect(await escrow.collectedFees()).to.be.equal(0)

            // Trade 2 tokenA => tokenB
            fromAsset = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: fromTokenERC20.address,
                amount: erc20_amount_ethers
            };

            toAsset = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: toTokenERC20.address,
                amount: erc20_amount_ethers
            };
            await tokenERC20SetUp(fromTokenERC20, escrow, deployer, seller, erc20_amount)
            create = await escrow.createTrade(seller.address, fromAsset, [], toAsset, false, 100, { value: FLAT_FEES })
            await expect(create).to.not.reverted
            await expect(create).to.emit(escrow, "TradeCreated")
            await expect(create).to.not.emit(escrow, "TradeRemoved")
            await expect(await escrow.availableFees()).to.be.equal(FLAT_FEES.mul(2))
            await expect(await escrow.collectedFees()).to.be.equal(0)

            // collect fees
            const invalid_collect = escrow.connect(seller).withdrawFees(feesCollector.address)
            await expect(invalid_collect).to.be.revertedWith('Only owner is allowed')
            let collect = await escrow.withdrawFees(feesCollector.address)
            await expect(collect).to.not.reverted

            let feesCollectorNewBal = await ethers.provider.getBalance(feesCollector.address)
            expect(feesCollectorNewBal.sub(feesCollectorOriginalBal)).to.be.equal(FLAT_FEES.mul(2))
            await expect(await escrow.availableFees()).to.be.equal(0)
            await expect(await escrow.collectedFees()).to.be.equal(FLAT_FEES.mul(2))
            feesCollectorOriginalBal = feesCollectorNewBal

            // Trade 3 tokenA => NFTA
            fromAsset = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: fromTokenERC20.address,
                amount: erc20_amount_ethers
            };

            toAsset = {
                assetId: 0,
                assetType: AssetTypes.ERC721_NFT,
                assetAddress: toTokenERC721.address,
                amount: 10
            };

            await tokenERC20SetUp(fromTokenERC20, escrow, deployer, seller, erc20_amount)
            create = await escrow.createTrade(seller.address, fromAsset, [], toAsset, false, 100, { value: FLAT_FEES })
            await expect(create).to.not.reverted
            await expect(create).to.emit(escrow, "TradeCreated")
            await expect(create).to.not.emit(escrow, "TradeRemoved")
            await expect(await escrow.availableFees()).to.be.equal(FLAT_FEES.mul(1))
            await expect(await escrow.collectedFees()).to.be.equal(FLAT_FEES.mul(2))
        });
    });

    describe("Handle Trades Withdraws", function () {
        it("Should handle trades withdraw coorectly", async function () {
            const { escrow, deployer, buyer, seller, fromTokenERC20, toTokenERC20, fromTokenERC721, toTokenERC721 }
                = await loadFixture(deployEscrowFixture);

            // Trade 1: Zen => tokenA
            const duration = 100
            const zen_amount_ethers = ethers.utils.parseEther("10")
            const erc20_amount = 0.2
            const erc20_amount_ethers = ethers.utils.parseEther(erc20_amount.toString())

            let fromAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.NATIVE_ZEN,
                assetAddress: ethers.constants.AddressZero,
                amount: zen_amount_ethers
            };

            let toAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: toTokenERC20.address,
                amount: erc20_amount_ethers
            };
            let create = await escrow.createTrade(seller.address, fromAsset, [], toAsset, false, duration, { value: zen_amount_ethers.add(FLAT_FEES) })
            await expect(create).to.not.reverted
            await expect(create).to.emit(escrow, "TradeCreated")
            await expect(create).to.not.emit(escrow, "TradeRemoved")
            let bn = create.blockNumber!
            const time1 = (await ethers.provider.getBlock(bn)).timestamp + duration


            // Trade 2 tokenA => tokenB
            fromAsset = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: fromTokenERC20.address,
                amount: erc20_amount_ethers
            };

            toAsset = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: toTokenERC20.address,
                amount: erc20_amount_ethers
            };
            await tokenERC20SetUp(fromTokenERC20, escrow, deployer, seller, erc20_amount)
            create = await escrow.createTrade(seller.address, fromAsset, [], toAsset, false, 100, { value: FLAT_FEES })
            await expect(create).to.not.reverted
            await expect(create).to.emit(escrow, "TradeCreated")
            await expect(create).to.not.emit(escrow, "TradeRemoved")
            bn = create.blockNumber!
            const time2 = (await ethers.provider.getBlock(bn)).timestamp + duration
            const sellerOriginalERC20Bal = await fromTokenERC20.balanceOf(seller.address)
            const sellerOriginalZenBal = await ethers.provider.getBalance(seller.address)

            // Trade 3 tokenA => NFTA
            fromAsset = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: fromTokenERC20.address,
                amount: erc20_amount_ethers
            };

            toAsset = {
                assetId: 0,
                assetType: AssetTypes.ERC721_NFT,
                assetAddress: toTokenERC721.address,
                amount: 10
            };

            await tokenERC20SetUp(fromTokenERC20, escrow, deployer, buyer, erc20_amount)
            create = await escrow.createTrade(buyer.address, fromAsset, [], toAsset, false, 100, { value: FLAT_FEES })
            await expect(create).to.not.reverted
            await expect(create).to.emit(escrow, "TradeCreated")
            await expect(create).to.not.emit(escrow, "TradeRemoved")
            bn = create.blockNumber!
            const time3 = (await ethers.provider.getBlock(bn)).timestamp + duration


            // Trade 4 NFTA => tokenB
            const erc721_amount = 10
            fromAsset = {
                assetId: 0,
                assetType: AssetTypes.ERC721_NFT,
                assetAddress: fromTokenERC721.address,
                amount: erc721_amount
            };

            toAsset = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: toTokenERC20.address,
                amount: erc20_amount_ethers
            };

            const tokenIds = await tokenERC721SetUp(fromTokenERC721, escrow, deployer, buyer, erc721_amount)
            create = await escrow.createTrade(buyer.address, fromAsset, tokenIds, toAsset, false, 100, { value: FLAT_FEES })
            await expect(create).to.not.reverted
            await expect(create).to.emit(escrow, "TradeCreated")
            await expect(create).to.not.emit(escrow, "TradeRemoved")
            bn = create.blockNumber!
            const time4 = (await ethers.provider.getBlock(bn)).timestamp + duration
            const buyerOriginalERC721Bal = await fromTokenERC721.balanceOf(buyer.address)
            const buyerOriginalERC20Bal = await fromTokenERC20.balanceOf(buyer.address)

            // check trades in contract
            let trades = await escrow.tradesOf(seller.address)
            expect(trades.length).to.be.equal(2)
            trades = await escrow.tradesOf(buyer.address)
            expect(trades.length).to.be.equal(2)

            // check balances
            expect(await ethers.provider.getBalance(escrow.address)).to.be.equal(zen_amount_ethers.add(FLAT_FEES.mul(4)))
            expect(await fromTokenERC20.balanceOf(escrow.address)).to.be.equal(erc20_amount_ethers.mul(2))
            expect(await fromTokenERC721.balanceOf(escrow.address)).to.be.equal(erc721_amount)

            // first withdraw nothing 
            let withdrawSeller = await escrow.withdrawTrades(seller.address)
            let withdrawBuyer = await escrow.withdrawTrades(buyer.address)
            expect(withdrawSeller).to.not.emit(escrow, "TradeRemoved")
            expect(withdrawBuyer).to.not.emit(escrow, "TradeRemoved")
            let newSellerZenBal = await ethers.provider.getBalance(seller.address)
            let newSellerERC20Bal = await fromTokenERC20.balanceOf(seller.address)
            let newBuyerERC20Bal = await fromTokenERC20.balanceOf(buyer.address)
            let newBuyerERC721Bal = await fromTokenERC721.balanceOf(buyer.address)
            expect(newSellerZenBal.sub(sellerOriginalZenBal)).to.be.equal(0)
            expect(newSellerERC20Bal.sub(sellerOriginalERC20Bal)).to.be.equal(0)
            expect(newBuyerERC20Bal.sub(buyerOriginalERC20Bal)).to.be.equal(0)
            expect(newBuyerERC721Bal.sub(buyerOriginalERC721Bal)).to.be.equal(0)
            expect(await ethers.provider.getBalance(escrow.address)).to.be.equal(zen_amount_ethers.add(FLAT_FEES.mul(4)))
            expect(await fromTokenERC20.balanceOf(escrow.address)).to.be.equal(erc20_amount_ethers.mul(2))
            expect(await fromTokenERC721.balanceOf(escrow.address)).to.be.equal(erc721_amount)

            // advance time
            time.increaseTo(time1 + 1)
            // second withdraw
            withdrawSeller = await escrow.withdrawTrades(seller.address)
            withdrawBuyer = await escrow.withdrawTrades(buyer.address)
            await expect(withdrawSeller).to.emit(escrow, "TradeRemoved")
            await expect(withdrawBuyer).to.not.emit(escrow, "TradeRemoved")
            newSellerZenBal = await ethers.provider.getBalance(seller.address)
            newSellerERC20Bal = await fromTokenERC20.balanceOf(seller.address)
            newBuyerERC20Bal = await fromTokenERC20.balanceOf(buyer.address)
            newBuyerERC721Bal = await fromTokenERC721.balanceOf(buyer.address)
            await expect(newSellerZenBal.sub(sellerOriginalZenBal)).to.be.equal(zen_amount_ethers)
            await expect(newSellerERC20Bal.sub(sellerOriginalERC20Bal)).to.be.equal(0)
            await expect(newBuyerERC20Bal.sub(buyerOriginalERC20Bal)).to.be.equal(0)
            await expect(newBuyerERC721Bal.sub(buyerOriginalERC721Bal)).to.be.equal(0)
            await expect(await ethers.provider.getBalance(escrow.address)).to.be.equal(FLAT_FEES.mul(4))
            await expect(await fromTokenERC20.balanceOf(escrow.address)).to.be.equal(erc20_amount_ethers.mul(2))
            await expect(await fromTokenERC721.balanceOf(escrow.address)).to.be.equal(erc721_amount)
            trades = await escrow.tradesOf(seller.address)
            expect(trades.length).to.be.equal(1)
            trades = await escrow.tradesOf(buyer.address)
            expect(trades.length).to.be.equal(2)
            await expect((await escrow.getNftTokensIds(6)).length).to.be.equal(erc721_amount)

            // advance time
            time.increaseTo(time4 + 1)

            // final withdraw
            withdrawSeller = await escrow.withdrawTrades(seller.address)
            withdrawBuyer = await escrow.withdrawTrades(buyer.address)
            await expect(withdrawSeller).to.emit(escrow, "TradeRemoved")
            await expect(withdrawBuyer).to.emit(escrow, "TradeRemoved")
            newSellerZenBal = await ethers.provider.getBalance(seller.address)
            newSellerERC20Bal = await fromTokenERC20.balanceOf(seller.address)
            newBuyerERC20Bal = await fromTokenERC20.balanceOf(buyer.address)
            newBuyerERC721Bal = await fromTokenERC721.balanceOf(buyer.address)
            await expect(newSellerZenBal.sub(sellerOriginalZenBal)).to.be.equal(zen_amount_ethers)
            await expect(newSellerERC20Bal.sub(sellerOriginalERC20Bal)).to.be.equal(erc20_amount_ethers)
            await expect(newBuyerERC20Bal.sub(buyerOriginalERC20Bal)).to.be.equal(erc20_amount_ethers)
            await expect(newBuyerERC721Bal.sub(buyerOriginalERC721Bal)).to.be.equal(erc721_amount)
            await expect(await ethers.provider.getBalance(escrow.address)).to.be.equal(FLAT_FEES.mul(4))
            await expect(await fromTokenERC20.balanceOf(escrow.address)).to.be.equal(0)
            await expect(await fromTokenERC721.balanceOf(escrow.address)).to.be.equal(0)
            trades = await escrow.tradesOf(seller.address)
            expect(trades.length).to.be.equal(0)
            trades = await escrow.tradesOf(buyer.address)
            expect(trades.length).to.be.equal(0)

            // check nftData empty
            await expect((await escrow.getNftTokensIds(6)).length).to.be.equal(0)

        });


    });

    describe("Handle more than 4 Trades", function () {

        const numberOfTrades = 13

        it(`Should handle ${numberOfTrades*2} complete trades zen => tokens and then match them`, async function (){
            const { escrow, deployer, buyer, seller, fromTokenERC20, toTokenERC20, fromTokenERC721, toTokenERC721 }
                = await loadFixture(deployEscrowFixture);

            //const numberOfTrades = 10
            let times1 = []
            let times2 = []
            let tokens = []

            for (let index = 1; index <= numberOfTrades; index++) {
                
            const duration = 100
            const zen_amount_ethers = ethers.utils.parseEther(index.toString())
            const erc20_amount = numberOfTrades - index + 1
            const erc20_amount_ethers = ethers.utils.parseEther(erc20_amount.toString())
            const token = await createERC20(`token ${index}`, `TCK${index}`, erc20_amount.toString());
            // await tokenERC20SetUp(token, escrow, deployer, seller, erc20_amount)
            let fromAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.NATIVE_ZEN,
                assetAddress: ethers.constants.AddressZero,
                amount: zen_amount_ethers
            };

            let toAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: token.address,
                amount: erc20_amount_ethers
            };
            const create = await escrow.createTrade(seller.address, fromAsset, [], toAsset, false, duration, 
                { value: zen_amount_ethers.add(FLAT_FEES) })
            await expect(create).to.not.reverted
            await expect(create).to.emit(escrow, "TradeCreated")
            await expect(create).to.not.emit(escrow, "TradeRemoved")
            await expect(create).to.not.emit(escrow, "TradesMatched")
            let bn = create.blockNumber!
            const time = (await ethers.provider.getBlock(bn)).timestamp + duration

            //add to arrays
            times1.push(time)
            tokens.push(token)
        }

        for (let index = 1; index <= numberOfTrades; index++) {
                
            const duration = 100
            const zen_amount_ethers = ethers.utils.parseEther(index.toString())
            const erc20_amount = numberOfTrades - index + 1
            const erc20_amount_ethers = ethers.utils.parseEther(erc20_amount.toString())
            await tokenERC20SetUp(tokens[index-1], escrow, deployer, buyer, erc20_amount)
            const toAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.NATIVE_ZEN,
                assetAddress: ethers.constants.AddressZero,
                amount: zen_amount_ethers
            };

            const fromAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: tokens[index-1].address,
                amount: erc20_amount_ethers
            };
            const create = await escrow.createTrade(buyer.address, fromAsset, [], toAsset, false, duration, { value: FLAT_FEES })
            await expect(create).to.not.reverted
            await expect(create).to.emit(escrow, "TradeCreated")
            await expect(create).to.emit(escrow, "TradeRemoved")
            await expect(create).to.emit(escrow, "TradesMatched")
            await expect(create).to.not.emit(escrow, "TradesPartialyMatched")
            let bn = create.blockNumber!
            const time = (await ethers.provider.getBlock(bn)).timestamp + duration

            //add to arrays
            times2.push(time)
        }

        //check no trades remain
        await expect((await escrow.tradesOf(seller.address)).length).to.be.equal(0)
        await expect((await escrow.tradesOf(buyer.address)).length).to.be.equal(0)
        await expect(await escrow.availableFees()).to.be.equal(FLAT_FEES.mul(2*numberOfTrades))

        });

        it(`Should handle ${numberOfTrades*2} partial trades zen => tokens (limit) and then match them`, async function () {
            const { escrow, deployer, buyer, seller, fromTokenERC20, toTokenERC20, fromTokenERC721, toTokenERC721 }
                = await loadFixture(deployEscrowFixture);

            
            let times1 = []
            let times2 = []
            let tokens = []

            for (let index = 1; index <= numberOfTrades; index++) {
                
            const duration = 100
            const zen_amount_ethers = ethers.utils.parseUnits(index.toString(), "gwei").mul(2)
            const erc20_amount = numberOfTrades - index + 1
            const erc20_amount_ethers = ethers.utils.parseEther(erc20_amount.toString()).mul(2)
            const token = await createERC20(`token ${index}`, `TCK${index}`, erc20_amount.toString());
            // await tokenERC20SetUp(token, escrow, deployer, seller, erc20_amount)
            let fromAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.NATIVE_ZEN,
                assetAddress: ethers.constants.AddressZero,
                amount: zen_amount_ethers
            };

            let toAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: token.address,
                amount: erc20_amount_ethers
            };
            const create = await escrow.createTrade(seller.address, fromAsset, [], toAsset, true, duration, 
                { value: zen_amount_ethers.add(FLAT_FEES) })
            await expect(create).to.not.reverted
            await expect(create).to.emit(escrow, "TradeCreated")
            await expect(create).to.not.emit(escrow, "TradeRemoved")
            await expect(create).to.not.emit(escrow, "TradesMatched")
            let bn = create.blockNumber!
            const time = (await ethers.provider.getBlock(bn)).timestamp + duration

            //add to arrays
            times1.push(time)
            tokens.push(token)
        }

        for (let index = 1; index <= numberOfTrades; index++) {
                
            const duration = 100
            const zen_amount_ethers = ethers.utils.parseUnits(index.toString(), "gwei")
            const erc20_amount = numberOfTrades - index + 1
            const erc20_amount_ethers = ethers.utils.parseEther(erc20_amount.toString())
            await tokenERC20SetUp(tokens[index-1], escrow, deployer, buyer, erc20_amount)
            const toAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.NATIVE_ZEN,
                assetAddress: ethers.constants.AddressZero,
                amount: zen_amount_ethers
            };

            const fromAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: tokens[index-1].address,
                amount: erc20_amount_ethers
            };
            const create = await escrow.createTrade(buyer.address, fromAsset, [], toAsset, false, duration, { value: FLAT_FEES })
            await expect(create).to.not.reverted
            await expect(create).to.emit(escrow, "TradeCreated")
            await expect(create).to.emit(escrow, "TradeRemoved")
            await expect(create).to.not.emit(escrow, "TradesMatched")
            await expect(create).to.emit(escrow, "TradesPartialyMatched")
            let bn = create.blockNumber!
            const time = (await ethers.provider.getBlock(bn)).timestamp + duration

            //add to arrays
            times2.push(time)
        }

        //check no trades remain
        await expect((await escrow.tradesOf(seller.address)).length).to.be.equal(numberOfTrades)
        await expect((await escrow.tradesOf(buyer.address)).length).to.be.equal(0)
        await expect(await escrow.availableFees()).to.be.equal(FLAT_FEES.mul(2*numberOfTrades))

        });

        it(`Should handle ${numberOfTrades*2} partial trades zen (limit) => tokens and then match them`, async function () {
            const { escrow, deployer, buyer, seller, fromTokenERC20, toTokenERC20, fromTokenERC721, toTokenERC721 }
                = await loadFixture(deployEscrowFixture);

            
            let times1 = []
            let times2 = []
            let tokens = []

            for (let index = 1; index <= numberOfTrades; index++) {
                
            const duration = 100
            const zen_amount_ethers = ethers.utils.parseUnits(index.toString(), "gwei")
            const erc20_amount = numberOfTrades - index + 1
            const erc20_amount_ethers = ethers.utils.parseEther(erc20_amount.toString())
            const token = await createERC20(`token ${index}`, `TCK${index}`, (erc20_amount*2).toString());
            // await tokenERC20SetUp(token, escrow, deployer, seller, erc20_amount)
            let fromAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.NATIVE_ZEN,
                assetAddress: ethers.constants.AddressZero,
                amount: zen_amount_ethers
            };

            let toAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: token.address,
                amount: erc20_amount_ethers
            };
            const create = await escrow.createTrade(seller.address, fromAsset, [], toAsset, false, duration, 
                { value: zen_amount_ethers.add(FLAT_FEES) })
            await expect(create).to.not.reverted
            await expect(create).to.emit(escrow, "TradeCreated")
            await expect(create).to.not.emit(escrow, "TradeRemoved")
            await expect(create).to.not.emit(escrow, "TradesMatched")
            let bn = create.blockNumber!
            const time = (await ethers.provider.getBlock(bn)).timestamp + duration

            //add to arrays
            times1.push(time)
            tokens.push(token)
        }

        for (let index = 1; index <= numberOfTrades; index++) {
                
            const duration = 100
            const zen_amount_ethers = ethers.utils.parseUnits(index.toString(), "gwei").mul(2)
            const erc20_amount = numberOfTrades - index + 1
            const erc20_amount_ethers = ethers.utils.parseEther((erc20_amount*2).toString())
            await tokenERC20SetUp(tokens[index-1], escrow, deployer, buyer, erc20_amount*2)
            const toAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.NATIVE_ZEN,
                assetAddress: ethers.constants.AddressZero,
                amount: zen_amount_ethers
            };

            const fromAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: tokens[index-1].address,
                amount: erc20_amount_ethers
            };
            const create = await escrow.createTrade(buyer.address, fromAsset, [], toAsset, true, duration, { value: FLAT_FEES })
            await expect(create).to.not.reverted
            await expect(create).to.emit(escrow, "TradeCreated")
            await expect(create).to.emit(escrow, "TradeRemoved")
            await expect(create).to.not.emit(escrow, "TradesMatched")
            await expect(create).to.emit(escrow, "TradesPartialyMatched")
            let bn = create.blockNumber!
            const time = (await ethers.provider.getBlock(bn)).timestamp + duration

            //add to arrays
            times2.push(time)
        }

        //check no trades remain
        await expect((await escrow.tradesOf(seller.address)).length).to.be.equal(0)
        await expect((await escrow.tradesOf(buyer.address)).length).to.be.equal(numberOfTrades)
        await expect(await escrow.availableFees()).to.be.equal(FLAT_FEES.mul(2*numberOfTrades))

        });

        it(`Should handle ${numberOfTrades*2} complete trades zen => nfts and then match them`, async function () {
            const { escrow, deployer, buyer, seller, fromTokenERC20, toTokenERC20, fromTokenERC721, toTokenERC721 }
                = await loadFixture(deployEscrowFixture);

            //const numberOfTrades = 10
            let times1 = []
            let times2 = []
            let tokens = []

            for (let index = 1; index <= numberOfTrades; index++) {
                
            const duration = 100
            const zen_amount_ethers = ethers.utils.parseEther(index.toString())
            const erc721_amount = numberOfTrades - index + 1
            const token = await createERC721(`token ${index}`, `TCK${index}`);
            // await tokenERC20SetUp(token, escrow, deployer, seller, erc20_amount)
            let fromAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.NATIVE_ZEN,
                assetAddress: ethers.constants.AddressZero,
                amount: zen_amount_ethers
            };

            let toAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.ERC721_NFT,
                assetAddress: token.address,
                amount: erc721_amount
            };
            const create = await escrow.createTrade(seller.address, fromAsset, [], toAsset, false, duration, 
                { value: zen_amount_ethers.add(FLAT_FEES) })
            await expect(create).to.not.reverted
            await expect(create).to.emit(escrow, "TradeCreated")
            await expect(create).to.not.emit(escrow, "TradeRemoved")
            await expect(create).to.not.emit(escrow, "TradesMatched")
            let bn = create.blockNumber!
            const time = (await ethers.provider.getBlock(bn)).timestamp + duration

            //add to arrays
            times1.push(time)
            tokens.push(token)
        }

        for (let index = 1; index <= numberOfTrades; index++) {
                
            const duration = 100
            const zen_amount_ethers = ethers.utils.parseEther(index.toString())
            const erc721_amount = numberOfTrades - index + 1
            const tokIds = await tokenERC721SetUp(tokens[index-1], escrow, deployer, buyer, erc721_amount)
            const toAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.NATIVE_ZEN,
                assetAddress: ethers.constants.AddressZero,
                amount: zen_amount_ethers
            };

            const fromAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.ERC721_NFT,
                assetAddress: tokens[index-1].address,
                amount: erc721_amount
            };
            const create = await escrow.createTrade(buyer.address, fromAsset, tokIds, toAsset, false, duration, { value: FLAT_FEES })
            await expect(create).to.not.reverted
            await expect(create).to.emit(escrow, "TradeCreated")
            await expect(create).to.emit(escrow, "TradeRemoved")
            await expect(create).to.emit(escrow, "TradesMatched")
            await expect(create).to.not.emit(escrow, "TradesPartialyMatched")
            let bn = create.blockNumber!
            const time = (await ethers.provider.getBlock(bn)).timestamp + duration

            //add to arrays
            times2.push(time)
        }

        //check no trades remain
        await expect((await escrow.tradesOf(seller.address)).length).to.be.equal(0)
        await expect((await escrow.tradesOf(buyer.address)).length).to.be.equal(0)
        await expect(await escrow.availableFees()).to.be.equal(FLAT_FEES.mul(2*numberOfTrades))

        });

        it(`Should handle ${numberOfTrades*2} partial trades zen (limit) => nfts and then match them`, async function () {
            const { escrow, deployer, buyer, seller, fromTokenERC20, toTokenERC20, fromTokenERC721, toTokenERC721 }
                = await loadFixture(deployEscrowFixture);

            //const numberOfTrades = 10
            let times1 = []
            let times2 = []
            let tokens = []

            for (let index = 1; index <= numberOfTrades; index++) {
                
            const duration = 100
            const zen_amount_ethers = ethers.utils.parseEther(index.toString())
            const erc721_amount = numberOfTrades - index + 1
            const token = await createERC721(`token ${index}`, `TCK${index}`);
            // await tokenERC20SetUp(token, escrow, deployer, seller, erc20_amount)
            let fromAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.NATIVE_ZEN,
                assetAddress: ethers.constants.AddressZero,
                amount: zen_amount_ethers
            };

            let toAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.ERC721_NFT,
                assetAddress: token.address,
                amount: erc721_amount
            };
            const create = await escrow.createTrade(seller.address, fromAsset, [], toAsset, false, duration, 
                { value: zen_amount_ethers.add(FLAT_FEES) })
            await expect(create).to.not.reverted
            await expect(create).to.emit(escrow, "TradeCreated")
            await expect(create).to.not.emit(escrow, "TradeRemoved")
            await expect(create).to.not.emit(escrow, "TradesMatched")
            let bn = create.blockNumber!
            const time = (await ethers.provider.getBlock(bn)).timestamp + duration

            //add to arrays
            times1.push(time)
            tokens.push(token)
        }

        for (let index = 1; index <= numberOfTrades; index++) {
                
            const duration = 100
            const zen_amount_ethers = ethers.utils.parseEther(index.toString()).mul(2)
            const erc721_amount = (numberOfTrades - index + 1)*2
            const tokIds = await tokenERC721SetUp(tokens[index-1], escrow, deployer, buyer, erc721_amount)
            const toAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.NATIVE_ZEN,
                assetAddress: ethers.constants.AddressZero,
                amount: zen_amount_ethers
            };

            const fromAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.ERC721_NFT,
                assetAddress: tokens[index-1].address,
                amount: erc721_amount
            };
            const create = await escrow.createTrade(buyer.address, fromAsset, tokIds, toAsset, true, duration, { value: FLAT_FEES })
            await expect(create).to.not.reverted
            await expect(create).to.emit(escrow, "TradeCreated")
            await expect(create).to.emit(escrow, "TradeRemoved")
            await expect(create).to.not.emit(escrow, "TradesMatched")
            await expect(create).to.emit(escrow, "TradesPartialyMatched")
            let bn = create.blockNumber!
            const time = (await ethers.provider.getBlock(bn)).timestamp + duration

            //add to arrays
            times2.push(time)
        }

        //check no trades remain
        await expect((await escrow.tradesOf(seller.address)).length).to.be.equal(0)
        await expect((await escrow.tradesOf(buyer.address)).length).to.be.equal(numberOfTrades)
        await expect(await escrow.availableFees()).to.be.equal(FLAT_FEES.mul(2*numberOfTrades))

        });

        it(`Should handle ${numberOfTrades*2} partial trades zen => nfts (limit) and then match them`, async function () {
            const { escrow, deployer, buyer, seller, fromTokenERC20, toTokenERC20, fromTokenERC721, toTokenERC721 }
                = await loadFixture(deployEscrowFixture);

            //const numberOfTrades = 10
            let times1 = []
            let times2 = []
            let tokens = []

            for (let index = 1; index <= numberOfTrades; index++) {
                
            const duration = 100
            const zen_amount_ethers = ethers.utils.parseEther(index.toString()).mul(2)
            const erc721_amount = (numberOfTrades - index + 1)*2
            const token = await createERC721(`token ${index}`, `TCK${index}`);
            // await tokenERC20SetUp(token, escrow, deployer, seller, erc20_amount)
            let fromAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.NATIVE_ZEN,
                assetAddress: ethers.constants.AddressZero,
                amount: zen_amount_ethers
            };

            let toAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.ERC721_NFT,
                assetAddress: token.address,
                amount: erc721_amount
            };
            const create = await escrow.createTrade(seller.address, fromAsset, [], toAsset, true, duration, 
                { value: zen_amount_ethers.add(FLAT_FEES) })
            await expect(create).to.not.reverted
            await expect(create).to.emit(escrow, "TradeCreated")
            await expect(create).to.not.emit(escrow, "TradeRemoved")
            await expect(create).to.not.emit(escrow, "TradesMatched")
            await expect(create).to.not.emit(escrow, "TradesPartialyMatched")
            let bn = create.blockNumber!
            const time = (await ethers.provider.getBlock(bn)).timestamp + duration

            //add to arrays
            times1.push(time)
            tokens.push(token)
        }

        for (let index = 1; index <= numberOfTrades; index++) {
                
            const duration = 100
            const zen_amount_ethers = ethers.utils.parseEther(index.toString())
            const erc721_amount = (numberOfTrades - index + 1)
            const tokIds = await tokenERC721SetUp(tokens[index-1], escrow, deployer, buyer, erc721_amount)
            const toAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.NATIVE_ZEN,
                assetAddress: ethers.constants.AddressZero,
                amount: zen_amount_ethers
            };

            const fromAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.ERC721_NFT,
                assetAddress: tokens[index-1].address,
                amount: erc721_amount
            };
            const create = await escrow.createTrade(buyer.address, fromAsset, tokIds, toAsset, true, duration, { value: FLAT_FEES })
            await expect(create).to.not.reverted
            await expect(create).to.emit(escrow, "TradeCreated")
            await expect(create).to.emit(escrow, "TradeRemoved")
            await expect(create).to.not.emit(escrow, "TradesMatched")
            await expect(create).to.emit(escrow, "TradesPartialyMatched")
            let bn = create.blockNumber!
            const time = (await ethers.provider.getBlock(bn)).timestamp + duration

            //add to arrays
            times2.push(time)
        }

        //check no trades remain
        await expect((await escrow.tradesOf(seller.address)).length).to.be.equal(numberOfTrades)
        await expect((await escrow.tradesOf(buyer.address)).length).to.be.equal(0)
        await expect(await escrow.availableFees()).to.be.equal(FLAT_FEES.mul(2*numberOfTrades))

        });

        it(`Should handle ${numberOfTrades*3} multiple partial trades zen (limit) => tokens and then match them`, async function () {
            const { escrow, deployer, buyer, seller, other, fromTokenERC20, toTokenERC20, fromTokenERC721, toTokenERC721 }
                = await loadFixture(deployEscrowFixture);

            
            let times1 = []
            let times2 = []
            let tokens = []

            for (let index = 1; index <= numberOfTrades; index++) {
                
            const duration = 100
            const zen_amount_ethers = ethers.utils.parseUnits(index.toString(), "gwei")
            const erc20_amount = numberOfTrades - index + 1
            const erc20_amount_ethers = ethers.utils.parseEther(erc20_amount.toString())
            const token = await createERC20(`token ${index}`, `TCK${index}`, (erc20_amount*2).toString());
            // await tokenERC20SetUp(token, escrow, deployer, seller, erc20_amount)
            let fromAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.NATIVE_ZEN,
                assetAddress: ethers.constants.AddressZero,
                amount: zen_amount_ethers
            };

            let toAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: token.address,
                amount: erc20_amount_ethers
            };
            let create = await escrow.connect(seller).createTrade(seller.address, fromAsset, [], toAsset, true, duration, 
                { value: zen_amount_ethers.add(FLAT_FEES) })
            await expect(create).to.not.reverted
            await expect(create).to.emit(escrow, "TradeCreated")
            await expect(create).to.not.emit(escrow, "TradeRemoved")
            await expect(create).to.not.emit(escrow, "TradesMatched")
            await expect(create).to.not.emit(escrow, "TradesPartialyMatched")
            await expect(create).changeEtherBalance(seller, zen_amount_ethers.add(FLAT_FEES).mul(-1))
            await expect(create).changeEtherBalance(escrow, zen_amount_ethers.add(FLAT_FEES))
            let bn = create.blockNumber!
            let time = (await ethers.provider.getBlock(bn)).timestamp + duration
            times1.push(time)

            create = await escrow.connect(other).createTrade(other.address, fromAsset, [], toAsset, true, duration, 
                { value: zen_amount_ethers.add(FLAT_FEES) })
            await expect(create).to.not.reverted
            await expect(create).to.emit(escrow, "TradeCreated")
            await expect(create).to.not.emit(escrow, "TradeRemoved")
            await expect(create).to.not.emit(escrow, "TradesPartialyMatched")
            await expect(create).changeEtherBalance(other, zen_amount_ethers.add(FLAT_FEES).mul(-1))
            await expect(create).changeEtherBalance(escrow, zen_amount_ethers.add(FLAT_FEES))
            bn = create.blockNumber!
            time = (await ethers.provider.getBlock(bn)).timestamp + duration

            //add to arrays
            times1.push(time)
            tokens.push(token)
        }

        const buyerBalBefore = await ethers.provider.getBalance(buyer.address)
        let total = ethers.BigNumber.from(0)

        for (let index = 1; index <= numberOfTrades; index++) {
                
            const duration = 100
            const zen_amount_ethers = ethers.utils.parseUnits(index.toString(), "gwei").mul(2)
            total = total.add(zen_amount_ethers)
            const erc20_amount = numberOfTrades - index + 1
            const erc20_amount_ethers = ethers.utils.parseEther(erc20_amount.toString()).mul(2)
            const bal0 = await ethers.provider.getBalance(buyer.address)
            await tokenERC20SetUp(tokens[index-1], escrow, deployer, buyer, erc20_amount*2)
            const bal1 = await ethers.provider.getBalance(buyer.address)
            total = total.sub(bal0.sub(bal1))
            const toAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.NATIVE_ZEN,
                assetAddress: ethers.constants.AddressZero,
                amount: zen_amount_ethers
            };

            const fromAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: tokens[index-1].address,
                amount: erc20_amount_ethers
            };
            const create = await escrow.createTrade(buyer.address, fromAsset, [], toAsset, true, duration, { value: FLAT_FEES })
            await expect(create).changeTokenBalance(tokens[index-1], buyer, erc20_amount_ethers.mul(-1))
            await expect(create).changeEtherBalance(buyer, zen_amount_ethers)
            await expect(create).changeTokenBalance(tokens[index-1], seller, erc20_amount_ethers.div(2))
            await expect(create).changeTokenBalance(tokens[index-1], other, erc20_amount_ethers.div(2))
            await expect(create).changeEtherBalance(escrow, FLAT_FEES.sub(zen_amount_ethers))
            await expect(create).to.not.reverted
            await expect(create).to.emit(escrow, "TradeCreated")
            await expect(create).to.emit(escrow, "TradeRemoved")
            await expect(create).to.emit(escrow, "TradesMatched")
            await expect(create).to.emit(escrow, "TradesPartialyMatched")
            let bn = create.blockNumber!
            const time = (await ethers.provider.getBlock(bn)).timestamp + duration

            //add to arrays
            times2.push(time)
        }

        const buyerBalAfter = await ethers.provider.getBalance(buyer.address)

        //check no trades remain
        await expect((await escrow.tradesOf(seller.address)).length).to.be.equal(0)
        await expect((await escrow.tradesOf(other.address)).length).to.be.equal(0)
        await expect((await escrow.tradesOf(buyer.address)).length).to.be.equal(0)
        await expect(await escrow.availableFees()).to.be.equal(FLAT_FEES.mul(3*numberOfTrades))
        await expect(await ethers.provider.getBalance(escrow.address)).to.be.equal(FLAT_FEES.mul(3*numberOfTrades))
        await expect(buyerBalAfter.sub(buyerBalBefore)).to.equal(total)

        });


        it(`Should handle ${numberOfTrades*3} multiple partial trades zen  => tokens (limit) and then match them`, async function () {
            const { escrow, deployer, buyer, seller, other, fromTokenERC20, toTokenERC20, fromTokenERC721, toTokenERC721 }
                = await loadFixture(deployEscrowFixture);

            
            let times1 = []
            let times2 = []
            let tokens = []

            for (let index = 1; index <= numberOfTrades; index++) {
                
            const duration = 100
            const zen_amount_ethers = ethers.utils.parseUnits(index.toString(), "gwei").mul(2)
            const erc20_amount = (numberOfTrades - index + 1)*2
            const erc20_amount_ethers = ethers.utils.parseEther(erc20_amount.toString())
            const token = await createERC20(`token ${index}`, `TCK${index}`, (erc20_amount*2).toString());
            // await tokenERC20SetUp(token, escrow, deployer, seller, erc20_amount)
            let fromAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.NATIVE_ZEN,
                assetAddress: ethers.constants.AddressZero,
                amount: zen_amount_ethers
            };

            let toAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: token.address,
                amount: erc20_amount_ethers
            };
            let create = await escrow.connect(seller).createTrade(seller.address, fromAsset, [], toAsset, true, duration, 
                { value: zen_amount_ethers.add(FLAT_FEES) })
            await expect(create).to.not.reverted
            await expect(create).to.emit(escrow, "TradeCreated")
            await expect(create).to.not.emit(escrow, "TradeRemoved")
            await expect(create).to.not.emit(escrow, "TradesMatched")
            await expect(create).to.not.emit(escrow, "TradesPartialyMatched")
            await expect(create).changeEtherBalance(seller, zen_amount_ethers.add(FLAT_FEES).mul(-1))
            await expect(create).changeEtherBalance(escrow, zen_amount_ethers.add(FLAT_FEES))
            let bn = create.blockNumber!
            let time = (await ethers.provider.getBlock(bn)).timestamp + duration

            //add to arrays
            times1.push(time)
            tokens.push(token)
        }

        const buyerBalBefore = await ethers.provider.getBalance(buyer.address)
        const otherBalBefore = await ethers.provider.getBalance(other.address)
        let total = ethers.BigNumber.from(0)

        for (let index = 1; index <= numberOfTrades; index++) {
                
            const duration = 100
            const zen_amount_ethers = ethers.utils.parseUnits(index.toString(), "gwei")
            total = total.add(zen_amount_ethers)
            const erc20_amount = numberOfTrades - index + 1
            const erc20_amount_ethers = ethers.utils.parseEther(erc20_amount.toString())
            const bal0 = await ethers.provider.getBalance(buyer.address)
            await tokenERC20SetUp(tokens[index-1], escrow, deployer, buyer, erc20_amount)
            await tokenERC20SetUp(tokens[index-1], escrow, deployer, other, erc20_amount)
            const bal1 = await ethers.provider.getBalance(buyer.address)
            total = total.sub(bal0.sub(bal1))
            const toAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.NATIVE_ZEN,
                assetAddress: ethers.constants.AddressZero,
                amount: zen_amount_ethers
            };

            const fromAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.ERC20_TOKEN,
                assetAddress: tokens[index-1].address,
                amount: erc20_amount_ethers
            };
            let create = await escrow.createTrade(buyer.address, fromAsset, [], toAsset, true, duration, { value: FLAT_FEES })
            await expect(create).changeTokenBalance(tokens[index-1], buyer, erc20_amount_ethers.mul(-1))
            await expect(create).changeEtherBalance(buyer, zen_amount_ethers)
            await expect(create).changeTokenBalance(tokens[index-1], seller, erc20_amount_ethers)
            await expect(create).changeTokenBalance(tokens[index-1], other, 0)
            await expect(create).changeEtherBalance(escrow, FLAT_FEES.sub(zen_amount_ethers))
            await expect(create).to.not.reverted
            await expect(create).to.emit(escrow, "TradeCreated")
            await expect(create).to.emit(escrow, "TradeRemoved")
            await expect(create).to.not.emit(escrow, "TradesMatched")
            await expect(create).to.emit(escrow, "TradesPartialyMatched")
            let bn = create.blockNumber!
            let time = (await ethers.provider.getBlock(bn)).timestamp + duration

            //add to arrays
            times2.push(time)

            create = await escrow.createTrade(other.address, fromAsset, [], toAsset, true, duration, { value: FLAT_FEES })
            await expect(create).changeTokenBalance(tokens[index-1], buyer, 0)
            await expect(create).changeEtherBalance(other, zen_amount_ethers)
            await expect(create).changeTokenBalance(tokens[index-1], seller, erc20_amount_ethers)
            await expect(create).changeTokenBalance(tokens[index-1], other, erc20_amount_ethers.mul(-1))
            await expect(create).changeEtherBalance(escrow, FLAT_FEES.sub(zen_amount_ethers))
            await expect(create).to.not.reverted
            await expect(create).to.emit(escrow, "TradeCreated")
            await expect(create).to.emit(escrow, "TradeRemoved")
            await expect(create).to.emit(escrow, "TradesMatched")
            await expect(create).to.not.emit(escrow, "TradesPartialyMatched")
            bn = create.blockNumber!
            time = (await ethers.provider.getBlock(bn)).timestamp + duration

            //add to arrays
            times2.push(time)
        }

        const buyerBalAfter = await ethers.provider.getBalance(buyer.address)
        const otherBalAfter = await ethers.provider.getBalance(buyer.address)

        //check no trades remain
        await expect((await escrow.tradesOf(seller.address)).length).to.be.equal(0)
        await expect((await escrow.tradesOf(other.address)).length).to.be.equal(0)
        await expect((await escrow.tradesOf(buyer.address)).length).to.be.equal(0)
        await expect(await escrow.availableFees()).to.be.equal(FLAT_FEES.mul(3*numberOfTrades))
        await expect(await ethers.provider.getBalance(escrow.address)).to.be.equal(FLAT_FEES.mul(3*numberOfTrades))
        await expect(buyerBalAfter.sub(buyerBalBefore)).to.equal(total)
        await expect(otherBalAfter.sub(otherBalBefore)).to.equal(total)
        for (let index = 0; index < tokens.length; index++) {
            const tok = tokens[index];
            const erc20_amount = numberOfTrades - index
            const erc20_amount_ethers = ethers.utils.parseEther(erc20_amount.toString())
            await expect(await tok.balanceOf(seller.address)).to.be.equal(erc20_amount_ethers.mul(2))
        }

        });

        it(`Should handle ${numberOfTrades*3} multiple partial trades zen  => nfts (limit) and then match them`, async function () {
            const { escrow, deployer, buyer, seller, other, fromTokenERC20, toTokenERC20, fromTokenERC721, toTokenERC721 }
                = await loadFixture(deployEscrowFixture);

            
            let times1 = []
            let times2 = []
            let nfts = []

            for (let index = 1; index <= numberOfTrades; index++) {
                
            const duration = 100
            const zen_amount_ethers = ethers.utils.parseUnits(index.toString(), "gwei").mul(2)
            const erc721_amount = (numberOfTrades - index + 1)*2
            const nft = await createERC721(`nft ${index}`, `TCK${index}`);
            // await tokenERC20SetUp(token, escrow, deployer, seller, erc20_amount)
            let fromAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.NATIVE_ZEN,
                assetAddress: ethers.constants.AddressZero,
                amount: zen_amount_ethers
            };

            let toAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.ERC721_NFT,
                assetAddress: nft.address,
                amount: erc721_amount
            };
            let create = await escrow.connect(seller).createTrade(seller.address, fromAsset, [], toAsset, true, duration, 
                { value: zen_amount_ethers.add(FLAT_FEES) })
            await expect(create).to.not.reverted
            await expect(create).to.emit(escrow, "TradeCreated")
            await expect(create).to.not.emit(escrow, "TradeRemoved")
            await expect(create).to.not.emit(escrow, "TradesMatched")
            await expect(create).to.not.emit(escrow, "TradesPartialyMatched")
            await expect(create).changeEtherBalance(seller, zen_amount_ethers.add(FLAT_FEES).mul(-1))
            await expect(create).changeEtherBalance(escrow, zen_amount_ethers.add(FLAT_FEES))
            let bn = create.blockNumber!
            let time = (await ethers.provider.getBlock(bn)).timestamp + duration

            //add to arrays
            times1.push(time)
            nfts.push(nft)
        }

        const buyerBalBefore = await ethers.provider.getBalance(buyer.address)
        const otherBalBefore = await ethers.provider.getBalance(other.address)
        let total = ethers.BigNumber.from(0)

        for (let index = 1; index <= numberOfTrades; index++) {
                
            const duration = 100
            const zen_amount_ethers = ethers.utils.parseUnits(index.toString(), "gwei")
            total = total.add(zen_amount_ethers)
            const erc721_amount = numberOfTrades - index + 1
            const bal0 = await ethers.provider.getBalance(buyer.address)
            const tokIds1 = await tokenERC721SetUp(nfts[index-1], escrow, deployer, buyer, erc721_amount)
            const tokIds2 =await tokenERC721SetUp(nfts[index-1], escrow, deployer, other, erc721_amount)
            const bal1 = await ethers.provider.getBalance(buyer.address)
            total = total.sub(bal0.sub(bal1))
            const toAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.NATIVE_ZEN,
                assetAddress: ethers.constants.AddressZero,
                amount: zen_amount_ethers
            };

            const fromAsset: Escrow.AssetStruct = {
                assetId: 0,
                assetType: AssetTypes.ERC721_NFT,
                assetAddress: nfts[index-1].address,
                amount: erc721_amount
            };
            let create = await escrow.createTrade(buyer.address, fromAsset, tokIds1, toAsset, true, duration, { value: FLAT_FEES })
            await expect(create).changeTokenBalance(nfts[index-1], buyer, -erc721_amount)
            await expect(create).changeEtherBalance(buyer, zen_amount_ethers)
            await expect(create).changeTokenBalance(nfts[index-1], seller, erc721_amount)
            await expect(create).changeTokenBalance(nfts[index-1], other, 0)
            await expect(create).changeEtherBalance(escrow, FLAT_FEES.sub(zen_amount_ethers))
            await expect(create).to.not.reverted
            await expect(create).to.emit(escrow, "TradeCreated")
            await expect(create).to.emit(escrow, "TradeRemoved")
            await expect(create).to.not.emit(escrow, "TradesMatched")
            await expect(create).to.emit(escrow, "TradesPartialyMatched")
            let bn = create.blockNumber!
            let time = (await ethers.provider.getBlock(bn)).timestamp + duration

            //add to arrays
            times2.push(time)

            create = await escrow.createTrade(other.address, fromAsset, tokIds2, toAsset, true, duration, { value: FLAT_FEES })
            await expect(create).changeTokenBalance(nfts[index-1], buyer, 0)
            await expect(create).changeEtherBalance(other, zen_amount_ethers)
            await expect(create).changeTokenBalance(nfts[index-1], seller, erc721_amount)
            await expect(create).changeTokenBalance(nfts[index-1], other, -erc721_amount)
            await expect(create).changeEtherBalance(escrow, FLAT_FEES.sub(zen_amount_ethers))
            await expect(create).to.not.reverted
            await expect(create).to.emit(escrow, "TradeCreated")
            await expect(create).to.emit(escrow, "TradeRemoved")
            await expect(create).to.emit(escrow, "TradesMatched")
            await expect(create).to.not.emit(escrow, "TradesPartialyMatched")
            bn = create.blockNumber!
            time = (await ethers.provider.getBlock(bn)).timestamp + duration

            //add to arrays
            times2.push(time)
        }

        const buyerBalAfter = await ethers.provider.getBalance(buyer.address)
        const otherBalAfter = await ethers.provider.getBalance(buyer.address)

        //check no trades remain
        await expect((await escrow.tradesOf(seller.address)).length).to.be.equal(0)
        await expect((await escrow.tradesOf(other.address)).length).to.be.equal(0)
        await expect((await escrow.tradesOf(buyer.address)).length).to.be.equal(0)
        await expect(await escrow.availableFees()).to.be.equal(FLAT_FEES.mul(3*numberOfTrades))
        await expect(await ethers.provider.getBalance(escrow.address)).to.be.equal(FLAT_FEES.mul(3*numberOfTrades))
        await expect(buyerBalAfter.sub(buyerBalBefore)).to.equal(total)
        await expect(otherBalAfter.sub(otherBalBefore)).to.equal(total)
        for (let index = 0; index < nfts.length; index++) {
            const tok = nfts[index];
            const erc721_amount = numberOfTrades - index
            await expect(await tok.balanceOf(seller.address)).to.be.equal(erc721_amount*2)
        }

        });
    });
});