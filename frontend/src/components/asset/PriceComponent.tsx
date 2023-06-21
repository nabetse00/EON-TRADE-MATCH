import { useEffect, useState } from "react";
import { AssetContract, ESCROW_ABI, ESCROW_ADDRESS, Trade } from "../../models/escrow";
import { useContractRead } from "wagmi";
import { AssetStruct, AssetTypes } from "../../models/assets";
import { Alert } from "antd";


export default function PriceComponent(props: { assetFrom: AssetStruct, assetTo: AssetStruct }) {

    const [tradesData, setTradeData] = useState<Trade[]>([])
    const [pricesList, setPricesList] = useState<bigint[]>([])
    const DECIMALS = BigInt(Number(1e18).toString())

    useContractRead({
        address: ESCROW_ADDRESS,
        abi: ESCROW_ABI,
        functionName: 'getTrades',
        //cacheTime: 2_000,
        onSuccess(data) {
            generateTradesData(data)
        },
    })

    function adaptAmount(asset: AssetContract){
        if(asset.assetType == AssetTypes.ERC721_NFT){
            return asset.amount * DECIMALS
        }

        return asset.amount
    }

    function generateTradesData(data: string |
        any[] |
        readonly {
            tradeId: bigint;
            owner: `0x${string}`;
            fromAsset: { assetId: bigint; assetType: number; assetAddress: `0x${string}`; amount: bigint; };
            toAsset: { assetId: bigint; assetType: number; assetAddress: `0x${string}`; amount: bigint; };
            allowPartial: boolean;
            expireTime: bigint;
        }[]
    ): void {
        const trades: Trade[] = []
        for (let index = 0; index < data.length; index++) {
            const element = data[index];
            //element.key = element.tradeId.toString()
            trades.push(element)
        }
        setTradeData(trades)
    }

    function getPrice() {
        const pList = []

        for (let index = 0; index < tradesData.length; index++) {
            const t = tradesData[index];

            if (t.fromAsset.assetAddress.toLowerCase() == props.assetTo.assetAddress.toLowerCase()
                && t.toAsset.assetAddress.toLowerCase() == props.assetFrom.assetAddress.toLowerCase()) {
                // decimal adapt 
                const p = adaptAmount(t.fromAsset) * DECIMALS / adaptAmount(t.toAsset)
                pList.push(p)
            }
        }

        setPricesList(pList)
    }

    function parsePrice(p: bigint) {
        const val = Number(p) / Number(DECIMALS)
        return val
    }

    function getMean() {
        const sum = pricesList.reduce((t, v) => t + v, 0n)
        return parsePrice(sum) / pricesList.length
    }

    function getMin() {
        const min = pricesList.reduce((min, p) => p < min ? p : min, pricesList[0]);
        return parsePrice(min)
    }

    function getMax() {
        const max = pricesList.reduce((max, p) => p > max ? p : max, pricesList[0]);
        return parsePrice(max)
    }

    function formatUnits(asset: AssetStruct) {
        let unit = ""
        switch (asset.assetType) {
            case AssetTypes.NATIVE_ZEN:
                unit = "ZEN"
                break;
            case AssetTypes.ERC20_TOKEN:
                unit = "Tokens (ZEN)"
                break;

            case AssetTypes.ERC721_NFT:
                unit = "NFTs"
                break;

            default:
                break;
        }

        return unit

    }

    function priceUnit() {
        return `${formatUnits(props.assetTo)} per ${formatUnits(props.assetFrom)}`
    }


    useEffect(
        () => {
            getPrice()
        }, [tradesData]
    )

    return (

        <Alert
            message="Sugested Prices from current trades:"
            description={pricesList.length > 0 ?
                <ul>
                    <li>Avaiable mininum price: {getMin()} {priceUnit()} enter ~ {getMin()*Number(props.assetFrom.amount)} </li>
                    <li>Available maximun price: {getMax()} {priceUnit()} enter ~ {getMax()*Number(props.assetFrom.amount)} </li>
                    <li>mean price: {getMean()}   {priceUnit()} enter ~ {getMean()*Number(props.assetFrom.amount)}</li>
                </ul> : "No data available"}
            type="info"
            showIcon
        />

    );
} 