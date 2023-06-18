import { erc20ABI, erc721ABI, prepareWriteContract, readContract, waitForTransaction, writeContract } from "@wagmi/core"
import { AssetStruct, AssetTypes } from "../models/assets"
import { parseEther } from "viem"
import { CONFIRMATIONS, ESCROW_ABI, ESCROW_ADDRESS } from "../models/escrow"

export async function getEscrowTokenAllowance(owner: `0x${string}`, asset: AssetStruct): Promise<boolean> {
    const data = await readContract({
        address: asset.assetAddress as `0x${string}`,
        abi: erc20ABI,
        functionName: 'allowance',
        args: [owner, ESCROW_ADDRESS]
    })

    if (data < parseEther(asset.amount as `${number}`)) {
        return false
    }

    return true
}

export async function approveEscrowERC20(asset: AssetStruct): Promise<boolean> {
    try {
        const { request } = await prepareWriteContract({
            address: asset.assetAddress as `0x${string}`,
            abi: erc20ABI,
            functionName: 'approve',
            args: [ESCROW_ADDRESS, parseEther(asset.amount as `${number}`)]
        })
        const { hash } = await writeContract(request)
        const data = await waitForTransaction({
            hash: hash,
            // confirmations: CONFIRMATIONS,
        })
        return (data.status == "success")
    } catch (error) {
        console.error(error)
        return false
    }

}

export async function checkApprovedRC721(asset: AssetStruct, index: number): Promise<boolean> {

    const data = await readContract({
        address: asset?.assetAddress as `0x${string}`,
        abi: erc721ABI,
        functionName: 'getApproved',
        args: [asset.tokekenIds![index]]
    })

    if (data != ESCROW_ADDRESS) {
        return false
    }

    return true
}


export async function approveEscrowERC721(asset: AssetStruct, index: number): Promise<boolean> {
    try {
        const { request } = await prepareWriteContract(
            {
                address: asset.assetAddress,
                abi: erc721ABI,
                functionName: 'approve',
                args: [ESCROW_ADDRESS, asset.tokekenIds![index]],
                value: BigInt(0)
            })
        const { hash } = await writeContract(request)
        const data = await waitForTransaction({
            hash: hash,
            // confirmations: CONFIRMATIONS
        })

        return (data.status == "success")

    } catch (error) {
        console.error(error)
        return false
    }
}


export async function get_flat_fee(): Promise<bigint> {
    const data = await readContract({
        address: ESCROW_ADDRESS as `0x${string}`,
        abi: ESCROW_ABI,
        functionName: 'flat_fee',
    })

    return data
}


type AssetContract = {
    assetId: bigint,
    assetType: number,
    assetAddress: `0x${string}`
    amount: bigint
}

function convertAssetType(asset: AssetStruct): AssetContract {

    const asset_contract: AssetContract = {
        assetId: BigInt(asset.assetId),
        assetType: asset.assetType,
        assetAddress: asset.assetAddress,
        amount: (asset.assetType == AssetTypes.ERC721_NFT)? BigInt(asset.amount): parseEther(asset.amount as `${number}`)
    }

    if (asset_contract.amount <= 0) {
        throw "Invalid Asset Amount!"
    }

    return asset_contract
}

export async function createTrade( owner: `0x${string}`, assetFrom: AssetStruct, assetTo: AssetStruct, allowPartial: boolean, duration: number): Promise<boolean> {
    try {

        const asset_from = convertAssetType(assetFrom)
        const asset_to = convertAssetType(assetTo)

        if(asset_from.assetAddress == asset_to.assetAddress){
            throw "Invalid assets: same from and to address"
        }
        let token_ids: bigint[] = []
        if (assetFrom.tokekenIds != undefined) {
            token_ids = assetFrom.tokekenIds
        }
        let value_ = await get_flat_fee()
        if (asset_from.assetType == AssetTypes.NATIVE_ZEN) {
            value_ += asset_from.amount
        }

        const { request } = await prepareWriteContract(
            {
                address: ESCROW_ADDRESS,
                abi: ESCROW_ABI,
                functionName: 'createTrade',
                args: [
                    owner,
                    asset_from,
                    token_ids,
                    asset_to,
                    allowPartial,
                    BigInt(duration)
                ],
                value: value_
            })
        const { hash } = await writeContract(request)
        const data = await waitForTransaction({
            hash: hash,
            // confirmations: CONFIRMATIONS
        })

        return (data.status == "success")

    } catch (error) {
        console.error(error)
        return false
    }

}









