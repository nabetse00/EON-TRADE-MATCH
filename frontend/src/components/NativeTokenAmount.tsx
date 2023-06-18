import { InputNumber, Slider, Space } from "antd";
import { useState } from "react";

export default function NativeAmountInput(props: { from: boolean, amount:string, balance: string, setAmount: (arg0: string) => void; }) {
    const [inputValuePercent, setInputValuePercent] = useState(parseFloat(props.amount)/parseFloat(props.balance)*100);
    const [inputValue, setInputValue] = useState(props.amount);

    const onChangePercent = (newValue: number | null) => {
        setInputValuePercent(newValue!);
        const val = parseFloat(props.balance) * newValue! / 100
        setInputValue(val.toString());
        props.setAmount(val.toString())
    };

    const onChangeValue = (newValue: string | null) => {
        setInputValue(newValue!);
        props.setAmount(newValue!)
        console.log(newValue)
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