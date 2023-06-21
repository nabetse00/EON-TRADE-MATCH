import { InputNumber, Slider, Space } from "antd";
import { useState } from "react";
import { AssetStruct } from "../../models/assets";
import { formatEther, parseEther } from "viem";

export default function NativeAmountAssetInput(props: { from: boolean, balance: string, asset:AssetStruct, setAsset: (args:AssetStruct)=> void }) {
    const [inputValuePercent, setInputValuePercent] = useState(parseFloat(props.asset.amount)/parseFloat(props.balance)*100);
    const [inputValue, setInputValue] = useState(props.asset.amount);


    const onChangePercent = (newValue: number | null) => {
        setInputValuePercent(newValue!);

        // operations with bigin
        const bbal = parseEther(props.balance as `${number}`)
        const bper = BigInt(newValue!)
        
        const newAmount = formatEther(bbal * bper / BigInt(100));

        //let val = parseFloat(props.balance)
        //console.log(props.balance)
        //if(newValue != 100)
        //val = val * newValue! / 100
        //console.log(val)
        
        setInputValue(newAmount);
        const newAsset:AssetStruct = {
            assetId: props.asset.assetId,
            assetType: props.asset.assetType,
            assetAddress: props.asset.assetAddress,
            amount: newAmount,
            tokekenIds: []
        }
        props.setAsset(newAsset)
    };

    const onChangeValue = (newValue: string | null) => {
        setInputValue(newValue!);
        const newAsset:AssetStruct = {
            assetId: props.asset.assetId,
            assetType: props.asset.assetType,
            assetAddress: props.asset.assetAddress,
            amount: newValue!,
            tokekenIds: []
        }
        props.setAsset(newAsset)
        const percent = parseFloat(newValue!) / parseFloat(props.balance) * 100
        setInputValuePercent(Number(percent));
    };

    return (<Space.Compact direction='vertical'>
        {props.from ?
        <>
        <InputNumber
            id='1'
            style={{ width: '260px' }}
            min="0"
            max={props.balance}
            stringMode
            step="0.000000000000000001"
            value={inputValue}
            onChange={onChangeValue}
            addonAfter={"ZEN"} defaultValue={"0"} />
        <Slider

            style={{ width: "250px" }}
            tooltip={{ placement: 'bottom', formatter: (v: any) => `${v}%`, }}
            //defaultValue={0}
            marks={{
                0: '0%',
                50: '50%',
                100: {
                    style: {
                        color: '#f50',
                    },
                    label: <strong>max</strong>,
                },
            }}
            min={0}
            max={100}
            onChange={onChangePercent}
            value={typeof inputValuePercent === 'number' ? inputValuePercent : 0}
        />
        </>
        :
        <>
        <InputNumber
            id='1'
            style={{ width: '260px' }}
            min="0"
            //max={props.balance}
            stringMode
            step="0.000000000000000001"
            value={inputValue}
            onChange={onChangeValue}
            addonAfter={"ZEN"} defaultValue={"0"} />
        </>
        }

    </Space.Compact>
    );

}