import { Input } from "antd";
import { AssetStruct } from "../../models/assets";
import { fetchErc20Balance } from "../ContractFunctions";
import { useState } from "react";

export default function ContractERC20Input(
    props: {
        address: `0x${string}`
        balanceToken: bigint,
        validation: boolean,
        setValidation: (arg: boolean) => void,
        setBalanceToken: (args: bigint | undefined) => void,
        asset: AssetStruct,
        setAsset: (asset: AssetStruct) => void
    },
) {

    const [value, setValue] = useState("")

    function onAddressChange(contract_address: string) {
        setValue(contract_address)
        props.setValidation(false)
        fetchErc20Balance(contract_address as `0x${string}`, props.address).then(
            v => {
                if (v != undefined) {
                    props.setBalanceToken(v)
                    const asset = props.asset
                    asset.assetAddress = contract_address as `0x${string}`
                    props.setAsset(asset)
                    props.setValidation(true)
                    return
                }
                props.setBalanceToken(undefined)
                props.setValidation(false)
                return
            }
        )
    }


    return (
        <Input maxLength={64}
            autoComplete={"off"}
            alt='Asset address'
            value={value}
            onChange={(e) => onAddressChange(e.currentTarget.value)}
        />
    );

}