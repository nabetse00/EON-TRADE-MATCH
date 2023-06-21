import { InputNumber, Space } from "antd";
import { useState } from "react";
import { AssetStruct } from "../../models/assets";

export default function NftAssetNumberInput(props: {
    asset: AssetStruct, setAsset: (arg0: AssetStruct) => void;
}
) {
    const [inputValue, setInputValue] = useState(parseInt(props.asset.amount));

    const onChangeValue = (newValue: number | null) => {
        setInputValue(newValue!);
        const newAsset: AssetStruct = {
            assetId: props.asset.assetId,
            assetType: props.asset.assetType,
            assetAddress: props.asset.assetAddress,
            amount: newValue!.toString(),
            tokekenIds: []
        }
        props.setAsset(newAsset)
    };

    return (<Space.Compact direction='vertical'>
        <InputNumber
            id='1'
            style={{ width: '260px' }}
            min={0}
            //max={props.balance}
            step={1}
            value={inputValue}
            onChange={onChangeValue}
            addonAfter={"NFTs"}
            defaultValue={0} />

    </Space.Compact>
    );

}