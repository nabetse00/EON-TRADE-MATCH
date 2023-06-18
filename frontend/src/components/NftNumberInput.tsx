import { InputNumber, Slider, Space } from "antd";
import { useState } from "react";

export default function NftNumberInput(props: { amount:number, balance: number, setAmount: (arg0: number) => void; }) {
    const [inputValuePercent, setInputValuePercent] = useState(props.amount/props.balance*100);
    const [inputValue, setInputValue] = useState(props.amount);

    const onChangePercent = (newValue: number | null) => {
        setInputValuePercent(newValue!);
        const val = Math.ceil(props.balance * newValue! / 100)
        setInputValue(val);
        props.setAmount(val)
    };

    const onChangeValue = (newValue: number | null) => {
        setInputValue(newValue!);
        props.setAmount(newValue!)
        const percent = newValue! / props.balance * 100
        setInputValuePercent(Number(percent));
    };

    return (<Space.Compact direction='vertical'>
        <InputNumber
            id='1'
            style={{ width: '260px' }}
            min={0}
            max={props.balance}
            step={1}
            value={inputValue}
            onChange={onChangeValue}
            addonAfter={"NFTs"} 
            defaultValue={0} />
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

    </Space.Compact>
    );

}