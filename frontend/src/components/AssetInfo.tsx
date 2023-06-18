import { List } from "antd";
import { AssetStruct, AssetTypes } from "../models/assets";
import { useEffect, useState } from "react";


export default function AssetInfo(props: { title: string, asset: AssetStruct | undefined}) {

    const [data, setData] = useState<string[]>()
    useEffect(
        () => {


            if(props.asset != undefined){

            
            const newData = []

            switch (props.asset.assetType) {
                case AssetTypes.NATIVE_ZEN:
                    newData.push("Native Zen")
                    newData.push(`${props.asset.amount} ZEN`)
                    break;

                case AssetTypes.ERC20_TOKEN:
                    newData.push("ERC20 token")
                    newData.push(`Adress: ${props.asset.assetAddress}`)
                    newData.push(`${props.asset.amount} TOKENS (Unit Zen)`)
                    break;

                case AssetTypes.ERC721_NFT:
                    newData.push("ERC721 token")
                    newData.push(`Adress: ${props.asset.assetAddress}`)
                    newData.push(`${props.asset.amount} NFTs`)
                    break;

                default:
                    newData.push("No asset selected")
                    break;
            }

            setData(newData)
        }else{
            setData(["No asset"])
        }

        }, [props.asset]

    )

    return (

        <List
            size="small"
            header={<strong>{props.title}</strong>}
            bordered
            dataSource={data}
            renderItem={(item) => <List.Item>{item}</List.Item>}
        />

    );
}