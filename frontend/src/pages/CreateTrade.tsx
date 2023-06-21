import { useEffect, useState } from "react";
import { ADDRESS_ZERO, AssetStruct, AssetTypes } from "../models/assets";
import { Button, Card, Col, Divider, Form, InputNumber, Modal, Radio, RadioChangeEvent, Row, Segmented, Space, Spin, Switch, Timeline, TimelineItemProps } from "antd";
import { useAccount, useBalance } from "wagmi";
import RequireConnection from "../components/RequireConnection";
import NativeAmountAssetInput from "../components/asset/NativeAssetInput";
import ContractERC20Input from "../components/asset/ContractERC20Input";
import ContractERC721Input from "../components/asset/ContractERC721Input";
import { formatEther, parseEther } from "viem";
import NFTTokensInput from "../components/asset/NftsAmountInput";
import PriceComponent from "../components/asset/PriceComponent";
import NftAssetNumberInput from "../components/asset/NftAssetNumberInput";
import { approveEscrowERC20, approveEscrowERC721, checkApprovedRC721, createTrade, getEscrowTokenAllowance } from "../components/ContractFunctions";
import { ArrowDownOutlined, DoubleRightOutlined, DownSquareOutlined } from "@ant-design/icons";

export default function CreateTrade() {

    const INIT_ASSET: AssetStruct = {
        assetId: 0,
        assetType: AssetTypes.NATIVE_ZEN,
        assetAddress: `0x0000000000000000000000000000000000000000`,
        amount: "",
        tokekenIds: []
    }

    const [form] = Form.useForm();
    const { address, isConnecting, isDisconnected } = useAccount()
    const { data: balance, isLoading } = useBalance({
        address: address,
    })
    // Asset From state
    const [assetFrom, setAssetFrom] = useState<AssetStruct>(INIT_ASSET)
    const [isValidAssetFrom, setIsValidAssetFrom] = useState(false)
    const assetTypesOptions = ['Native ZEN', 'Tokens', 'NFTs'];

    const [fromAssetType, setFromAssetType] = useState(assetTypesOptions[0]);
    const [fromAssetBalance, setFromAssetBalance] = useState<bigint>();
    const [fromBalanceValidation, setFromBalanceValidation] = useState<boolean>();

    const onChangeFromAssetType = ({ target: { value } }: RadioChangeEvent) => {
        setFromBalanceValidation(false)
        setFromAssetType(value);
        let asset = INIT_ASSET
        switch (value) {
            case assetTypesOptions[0]:
                asset.assetType = AssetTypes.NATIVE_ZEN
                setAssetFrom(asset)
                break;

            case assetTypesOptions[1]:
                asset.assetType = AssetTypes.ERC20_TOKEN
                setAssetFrom(asset)
                break;

            case assetTypesOptions[2]:
                asset.assetType = AssetTypes.ERC721_NFT
                setAssetFrom(asset)
                break;

            default:
                console.error("undefined type")
                break;
        }
    };

    // Asset To state
    const [assetTo, setAssetTo] = useState<AssetStruct>(INIT_ASSET)
    const [isValidAssetTo, setIsValidAssetTo] = useState(false)

    const [toAssetType, setToAssetType] = useState<string | undefined>(undefined);
    const [toAssetBalance, setToAssetBalance] = useState<bigint>();
    const [toBalanceValidation, setToBalanceValidation] = useState<boolean>();

    const onChangeToAssetType = ({ target: { value } }: RadioChangeEvent) => {
        setToBalanceValidation(false)
        setToAssetType(value);
        let asset = INIT_ASSET
        switch (value) {
            case assetTypesOptions[0]:
                asset.assetType = AssetTypes.NATIVE_ZEN
                setAssetTo(asset)
                break;

            case assetTypesOptions[1]:
                asset.assetType = AssetTypes.ERC20_TOKEN
                setAssetTo(asset)
                break;

            case assetTypesOptions[2]:
                asset.assetType = AssetTypes.ERC721_NFT
                setAssetTo(asset)
                break;

            default:
                console.error("undefined type")
                break;
        }
    };

    function validateAssetFrom(asset: AssetStruct): boolean {
        switch (asset.assetType) {
            case AssetTypes.NATIVE_ZEN:
                if (asset.assetAddress != ADDRESS_ZERO)
                    return false
                if (parseEther(asset.amount as `${number}`) == BigInt(0))
                    return false
                if (asset.tokekenIds.length > 0)
                    return false
                break;
            case AssetTypes.ERC20_TOKEN:
                if (asset.assetAddress == ADDRESS_ZERO)
                    return false
                if (parseEther(asset.amount as `${number}`) == BigInt(0))
                    return false
                if (asset.tokekenIds.length > 0)
                    return false
                break;
            case AssetTypes.ERC721_NFT:
                if (asset.assetAddress == ADDRESS_ZERO)
                    return false
                if (BigInt(asset.amount) == BigInt(0))
                    return false
                if (asset.tokekenIds.length != Number(asset.amount))
                    return false
                break;

            default:
                return false
                break;
        }

        return true
    }


    function validateAssetTo(asset: AssetStruct): boolean {
        switch (asset.assetType) {
            case AssetTypes.NATIVE_ZEN:
                if (asset.assetAddress != ADDRESS_ZERO)
                    return false
                if (parseEther(asset.amount as `${number}`) == BigInt(0))
                    return false
                if (asset.tokekenIds.length > 0)
                    return false
                break;
            case AssetTypes.ERC20_TOKEN:
                if (asset.assetAddress == ADDRESS_ZERO)
                    return false
                if (parseEther(asset.amount as `${number}`) == BigInt(0))
                    return false
                if (asset.tokekenIds.length > 0)
                    return false
                break;
            case AssetTypes.ERC721_NFT:
                if (asset.assetAddress == ADDRESS_ZERO)
                    return false
                if (BigInt(asset.amount) == BigInt(0))
                    return false
                // if (asset.tokekenIds.length != Number(asset.amount))
                //     return false
                break;

            default:
                return false
                break;
        }

        return true
    }


    useEffect(
        () => {
            const valid = validateAssetFrom(assetFrom)
            setIsValidAssetFrom(valid)
        },
        [assetFrom]
    )


    useEffect(
        () => {
            const valid = validateAssetTo(assetTo)
            setIsValidAssetTo(valid)
        },
        [assetTo]
    )

    const [allowPartialTrade, setAllowPartialTrade] = useState<boolean>(true)
    const [lockDuration, setLockDuration] = useState<number>(100)

    const lockTimesDesc = ['min', '1 hour', '1 Day', '30 Days', '1 Year (365 Days)', 'Custom (seconds)']
    const lockTimes = [100, 3600, 3600 * 24, 3600 * 24 * 30, 3600 * 24 * 365]

    const [timeSegmented, setTimeSegmented] = useState("min")
    function changeLockSegmented(val: string) {
        setTimeSegmented(val)
        switch (val) {
            case lockTimesDesc[0]:
                setLockDuration(lockTimes[0])
                break;
            case lockTimesDesc[1]:
                setLockDuration(lockTimes[1])
                break;

            case lockTimesDesc[2]:
                setLockDuration(lockTimes[2])
                break;
            case lockTimesDesc[3]:
                setLockDuration(lockTimes[3])

                break;
            case lockTimesDesc[4]:
                setLockDuration(lockTimes[4])
                break;
            default:
                break;
        }
    }

    useEffect(
        () => {
            const index = lockTimes.indexOf(lockDuration)
            if (index == -1) {
                setTimeSegmented(lockTimesDesc[5])
            } else {
                setTimeSegmented(lockTimesDesc[index])
            }
        }, [lockDuration]
    )

    const [isModalExecuteOpen, setIsModalExecuteOpen] = useState(false);

    const [isPending, setIsPending] = useState<boolean>()
    const [items, setItems] = useState<TimelineItemProps[]>([
        {
            label: "Init",
            color: 'blue',
            children: 'Create Trade',
        },
    ])

    const [itemToAdd, setItemToAdd] = useState<TimelineItemProps>()

    useEffect(
        () => {
            if (itemToAdd)
                addItem(itemToAdd)

        },
        [itemToAdd]
    )

    function addItem(item: TimelineItemProps) {
        const newItems = [...items]
        newItems.push(item)
        setItems(newItems)
    }

    async function approveStepERC20(): Promise<boolean> {
        let r = await getEscrowTokenAllowance(address!, assetFrom!)
        if (r) {
            setItemToAdd({
                //label: "Allowance",
                color: 'green',
                children: 'Escrow Token Allowance satisfied',
                // dot: <CheckCircleOutlined />,
            })
            return true
        }
        setItemToAdd({
            //label: "Allowance",
            color: 'yellow',
            children: 'ERC20 Allowance NOT satisfied',
            // dot: <CloseCircleOutlined />,
        })
        r = await approveEscrowERC20(assetFrom!)
        if (r) {
            setItemToAdd({
                //label: "Allowance",
                color: 'green',
                children: 'Escorw Token Allowance set',
                // dot: <CheckCircleOutlined />,
            })

            r = await getEscrowTokenAllowance(address!, assetFrom!)
            if (r) {
                setItemToAdd({
                    //label: "Allowance",
                    color: 'green',
                    children: 'Escrow Token Allowance satisfied',
                    // dot: <CheckCircleOutlined />,
                })
                return true
            }
        }

        setItemToAdd({
            //label: "Allowance",
            color: 'red',
            children: 'Token Approval failed',
            // dot: <CloseCircleOutlined />,
        })
        return false
    }

    async function approveStepERC721(): Promise<boolean> {
        for (let index = 0; index < assetFrom!.tokekenIds!.length; index++) {
            let r = await checkApprovedRC721(assetFrom!, index)
            if (!r) {
                r = await approveEscrowERC721(assetFrom!, index)
                if (!r) {
                    setItemToAdd({
                        //label: "Allowance",
                        color: 'red',
                        children: `Escrow not approved for token id ${assetFrom?.tokekenIds![index]}`,
                    })
                    return false
                }
            }
        }
        setItemToAdd({
            //label: "Allowance",
            color: 'green',
            children: `Escrow Approved for ${assetFrom?.tokekenIds?.length} NFTs`,
            // dot: <CheckCircleOutlined />,
        })
        return true
    }


    async function approveStep(): Promise<boolean> {
        setItemToAdd({
            label: "Approval step",
            color: 'blue',
            children: 'Check asset is approved',
            // dot: <ClockCircleOutlined />,
        })
        switch (assetFrom!.assetType) {
            case AssetTypes.ERC20_TOKEN:
                return await approveStepERC20()
                break;

            case AssetTypes.ERC721_NFT:
                return await approveStepERC721()
                break;

            case AssetTypes.NATIVE_ZEN:
                setItemToAdd({
                    // label: "Approval step",
                    color: 'green',
                    children: 'Native Zen doesn`t need to be approved',
                    // dot: <CheckCircleOutlined />,
                })
                return true
                break;

            default:
                break;
        }

        return false
    }

    async function executeTrade(): Promise<boolean> {
        let r = await approveStep()
        if (!r) {
            return false
        }
        setItemToAdd({
            label: "Creating Trade",
            color: 'blue',
            children: `Sending trade to Escrow contract`,
            // dot: <CheckCircleOutlined />,
        })

        r = await createTrade(address!, assetFrom!, assetTo!, allowPartialTrade, lockDuration)
        if (!r) {
            setItemToAdd({
                // label: "Creating Trade",
                color: 'red',
                children: `Escrow contract reverted, Trade not added`,
                // dot: <CheckCircleOutlined />,
            })
            return false
        }
        setItemToAdd({
            // label: "Creating Trade",
            color: 'green',
            children: `Escrow contract succes, Trade added`,
            // dot: <CheckCircleOutlined />,
        })

        return r
    }

    const handleCancelExcute = () => {
        setIsModalExecuteOpen(false);
        setIsPending(false)
        setItems([{
            label: "Init",
            color: 'blue',
            children: 'Create Trade',
        }])
    };

    const showModalExecute = () => {
        setIsModalExecuteOpen(true);
        setItems([{
            label: "Init",
            color: 'blue',
            children: 'Create Trade',
        }])
        setIsPending(true)
        executeTrade().then(
            r => {
                setIsPending(false)
                if (r) {
                    setAssetFrom(INIT_ASSET)
                    setAssetTo(INIT_ASSET)
                    //setIsModalExecuteOpen(false)
                }
            }
        )
    };

    return (
        <>
            {(address && !isConnecting && !isDisconnected) ?
                <Form
                    form={form}
                    layout="vertical"
                >

                    <Row gutter={[16, 16]} align={"middle"} justify={"center"}>
                        <Col>

                            <Card title={`From Asset`}>

                                <Form.Item
                                    label="What asset you want to trade ?"
                                    name="fromAssetType"
                                    required
                                    initialValue={assetTypesOptions[0]}
                                >
                                    <Radio.Group
                                        optionType="button"
                                        buttonStyle="solid"
                                        options={assetTypesOptions} onChange={onChangeFromAssetType} value={fromAssetType} />

                                </Form.Item>
                                {(assetFrom?.assetType == AssetTypes.NATIVE_ZEN) &&
                                    <Form.Item
                                        label="How much Zen you want to spend?"
                                        name="fromAssetAmountZen"
                                        required
                                    >
                                        {!isLoading ?
                                            <NativeAmountAssetInput from={true} balance={balance!.formatted} asset={assetFrom} setAsset={setAssetFrom} />
                                            : <Spin />
                                        }
                                    </Form.Item>
                                }
                                {(assetFrom?.assetType == AssetTypes.ERC20_TOKEN) &&
                                    <>
                                        <Form.Item
                                            label="Enter ERC20 Token contract Address to exchange"
                                            name="fromAssetAddress"
                                            validateStatus={fromBalanceValidation ? "success" : "error"}
                                            help={fromBalanceValidation ? "" : "Contract address not valid"}
                                            hasFeedback
                                            required
                                        >
                                            {!isLoading ?
                                                <ContractERC20Input
                                                    address={address} asset={assetFrom}
                                                    setAsset={setAssetFrom}
                                                    balanceToken={fromAssetBalance!}
                                                    setBalanceToken={setFromAssetBalance}
                                                    validation={fromBalanceValidation!}
                                                    setValidation={setFromBalanceValidation}
                                                />
                                                : <Spin />
                                            }
                                        </Form.Item>
                                        {assetFrom?.assetAddress && fromBalanceValidation &&
                                            <Form.Item
                                                label="How much Tokens to spend?"
                                                name="fromAssetAmountZen"
                                                required
                                            >
                                                {!isLoading ?
                                                    <NativeAmountAssetInput from={true} balance={formatEther(fromAssetBalance!)} asset={assetFrom} setAsset={setAssetFrom} />
                                                    : <Spin />
                                                }
                                            </Form.Item>
                                        }
                                    </>

                                }
                                {(assetFrom?.assetType == AssetTypes.ERC721_NFT) &&
                                    <>
                                        <Form.Item
                                            label="Enter ERC721 NFTs contract Address to exchange"
                                            name="fromAssetAddress"
                                            validateStatus={fromBalanceValidation ? "success" : "error"}
                                            help={fromBalanceValidation ? "" : "Contract address not valid"}
                                            hasFeedback
                                            required
                                        >
                                            {!isLoading ?
                                                <ContractERC721Input
                                                    address={address} asset={assetFrom}
                                                    setAsset={setAssetFrom}
                                                    balanceNft={fromAssetBalance!}
                                                    setBalanceNfts={setFromAssetBalance}
                                                    validation={fromBalanceValidation!}
                                                    setValidation={setFromBalanceValidation}
                                                />
                                                : <Spin />
                                            }
                                        </Form.Item>
                                        {assetFrom?.assetAddress && fromBalanceValidation &&
                                            <Form.Item
                                                label="How much NFTs to spend?"
                                                name="fromAssetAmountZen"
                                                required
                                            >
                                                {!isLoading ?
                                                    <NFTTokensInput
                                                        balance={Number(fromAssetBalance)}
                                                        asset={assetFrom}
                                                        setAsset={setAssetFrom}
                                                        address={address}
                                                    />
                                                    : <Spin />
                                                }
                                            </Form.Item>
                                        }
                                    </>
                                }
                            </Card>
                        </Col>

                        <Col>
                            <DoubleRightOutlined /><DoubleRightOutlined />
                        </Col>

                        <Col>
                            <Card title={`To Asset`}>
                                <Form.Item
                                    label="What asset you want to get?"
                                    name="toAssetType"
                                    required
                                    initialValue={null}
                                >
                                    <Radio.Group
                                        optionType="button"
                                        buttonStyle="solid"
                                        options={(fromAssetType != 'Native ZEN') ? assetTypesOptions : assetTypesOptions.filter((v) => v != fromAssetType)} onChange={onChangeToAssetType} value={toAssetType} />

                                </Form.Item>

                                {toAssetType && (assetTo?.assetType == AssetTypes.NATIVE_ZEN) &&
                                    <>
                                        <PriceComponent assetFrom={assetFrom} assetTo={assetTo} />
                                        <Form.Item
                                            label="How much Zen do you want to get?"
                                            name="toAmountZen"
                                            required
                                        >
                                            {!isLoading ?
                                                <NativeAmountAssetInput from={false} balance={"0"} asset={assetTo} setAsset={setAssetTo} />
                                                : <Spin />
                                            }
                                        </Form.Item>

                                    </>
                                }
                                {toAssetType && (assetTo?.assetType == AssetTypes.ERC20_TOKEN) &&
                                    <>
                                        <Form.Item
                                            label="Enter ERC20 Token contract Address to get"
                                            name="toAssetAddress"
                                            validateStatus={toBalanceValidation ? "success" : "error"}
                                            help={toBalanceValidation ? "" : "Contract address not valid"}
                                            hasFeedback
                                            required
                                        >
                                            {!isLoading ?
                                                <ContractERC20Input
                                                    address={address} asset={assetTo}
                                                    setAsset={setAssetTo}
                                                    balanceToken={toAssetBalance!}
                                                    setBalanceToken={setToAssetBalance}
                                                    validation={toBalanceValidation!}
                                                    setValidation={setToBalanceValidation}
                                                />
                                                : <Spin />
                                            }
                                        </Form.Item>
                                        {assetTo?.assetAddress && toBalanceValidation &&
                                            <>
                                                <PriceComponent assetFrom={assetFrom} assetTo={assetTo} />
                                                <Form.Item
                                                    label="How much Tokens do you want to get?"
                                                    name="toAssetAmountZen"
                                                    required
                                                >
                                                    {!isLoading ?
                                                        <NativeAmountAssetInput from={false} balance={formatEther(toAssetBalance!)} asset={assetTo} setAsset={setAssetTo} />
                                                        : <Spin />
                                                    }
                                                </Form.Item>

                                            </>
                                        }
                                    </>

                                }



                                {toAssetType && (assetTo?.assetType == AssetTypes.ERC721_NFT) &&
                                    <>
                                        <Form.Item
                                            label="Enter ERC721 NFTs contract Address to get"
                                            name="fromAssetAddress"
                                            validateStatus={toBalanceValidation ? "success" : "error"}
                                            help={toBalanceValidation ? "" : "Contract address not valid"}
                                            hasFeedback
                                            required
                                        >
                                            {!isLoading ?
                                                <ContractERC721Input
                                                    address={address} asset={assetTo}
                                                    setAsset={setAssetTo}
                                                    balanceNft={toAssetBalance!}
                                                    setBalanceNfts={setToAssetBalance}
                                                    validation={toBalanceValidation!}
                                                    setValidation={setToBalanceValidation}
                                                />
                                                : <Spin />
                                            }
                                        </Form.Item>
                                        {assetTo?.assetAddress && toBalanceValidation &&
                                            <>
                                                <PriceComponent assetFrom={assetFrom} assetTo={assetTo} />
                                                <Form.Item
                                                    label="How much NFTs to get?"
                                                    name="toAssetAmountZen"
                                                    required
                                                >
                                                    {!isLoading ?
                                                        <NftAssetNumberInput
                                                            setAsset={setAssetTo}
                                                            asset={assetTo}
                                                        />
                                                        : <Spin />
                                                    }
                                                </Form.Item>
                                            </>
                                        }
                                    </>
                                }
                            </Card>
                        </Col>
                    </Row>

                    <Row align={"middle"} justify={"center"} gutter={[16, 16]} style={{ marginTop: "2em", marginBottom:"2em" }}>
                        <ArrowDownOutlined /><ArrowDownOutlined /><ArrowDownOutlined /><ArrowDownOutlined />
                    </Row>


                    <Row align={"middle"} justify={"center"} gutter={[16, 16]} style={{ margin: "2em" }}>
                        <Col>
                            <Card title={`Execute Trade`}>
                                <Form.Item>
                                    <Space style={{ marginTop: "10px", marginLeft: "1em" }} direction="vertical">
                                        <Button type="primary" onClick={showModalExecute} disabled={!isValidAssetFrom || !isValidAssetTo}>
                                            Add Trade to Escrow
                                        </Button>
                                        Allow Partial Trade Match:
                                        <Switch
                                            onChange={() => setAllowPartialTrade(!allowPartialTrade)}
                                            checkedChildren="Yes"
                                            unCheckedChildren="No"
                                            defaultChecked
                                            disabled={!isValidAssetFrom || !isValidAssetTo}
                                        />
                                        Lock duration (Any one can remove your trade passed lock time):
                                        <Segmented
                                            value={timeSegmented}
                                            options={lockTimesDesc}
                                            onChange={(e) => changeLockSegmented(e.toString())}
                                            disabled={!isValidAssetFrom || !isValidAssetTo}
                                        />
                                        <InputNumber style={{ width: "auto" }}
                                            value={lockDuration}
                                            min={100}
                                            about={"Set lock time duration"}
                                            onChange={(e) => setLockDuration(e!)}
                                        />

                                        <Modal width={720} title={"Trade execution"} open={isModalExecuteOpen} footer={null} closable={true} onCancel={handleCancelExcute} >
                                            <Timeline mode={"left"} items={items} pending={isPending ? "waiting for confirmations" : undefined}>
                                            </Timeline>
                                        </Modal>
                                    </Space>
                                </Form.Item>
                            </Card>
                        </Col>
                    </Row>
                </Form >
                : <RequireConnection />
            }
        </>
    );
}