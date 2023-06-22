import { useEffect, useState } from "react";
import { AssetContract, ESCROW_ABI, ESCROW_ADDRESS, Trade } from "../../models/escrow";
import { useContractRead } from "wagmi";
import { AssetStruct, AssetTypes, PRICE_DECIMALS } from "../../models/assets";
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

    function adaptAmount(asset: AssetContract) {
        if (asset.assetType == AssetTypes.ERC721_NFT) {
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

    function computePrice(p: bigint): number {
        const val = Number(p) / Number(DECIMALS)
        return val
    }
    function formatPrice(p: number): string {
        return p.toFixed(PRICE_DECIMALS)
    }

    function getMean(): number {
        const sum = pricesList.reduce((t, v) => t + v, 0n)
        const mean = sum / BigInt(pricesList.length)
        return computePrice(mean)
    }

    function formatMean(): string {
        return formatPrice(getMean());
    }

    function getMin(): number {
        const min = pricesList.reduce((min, p) => p < min ? p : min, pricesList[0]);
        return computePrice(min)
    }

    function formatMin(): string {
        return formatPrice(getMin());
    }

    function getMax(): number {
        const max = pricesList.reduce((max, p) => p > max ? p : max, pricesList[0]);
        return computePrice(max)
    }

    function formatMax(): string {
        return formatPrice(getMax());
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
                    <li>Avaiable mininum price: {formatMin()} {priceUnit()} enter ~ {getMin() * Number(props.assetFrom.amount)} </li>
                    <li>Available maximun price: {formatMax()} {priceUnit()} enter ~ {getMax() * Number(props.assetFrom.amount)} </li>
                    <li>mean price: {formatMean()}   {priceUnit()} enter ~ {getMean() * Number(props.assetFrom.amount)}</li>
                </ul> : "No data available"}
            type="info"
            showIcon
        />

    );
} 