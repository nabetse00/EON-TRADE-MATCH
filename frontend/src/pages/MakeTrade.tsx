import { useEffect, useState } from "react";
import AssetSelectionComponent from "../components/AssetSelection";
import { AssetStruct, AssetTypes } from "../models/assets";
import { Button, Col, InputNumber, Modal, Row, Segmented, Space, Switch, Timeline, TimelineItemProps} from "antd";
import AssetInfo from "../components/AssetInfo";
import { ArrowRightOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

import { useAccount } from "wagmi";
import { approveEscrowERC20, approveEscrowERC721, checkApprovedRC721, createTrade, getEscrowTokenAllowance } from "../components/ContractFunctions";
import RequireConnection from "../components/RequireConnection";





export default function MakeTradePage() {

    const { address, isConnecting, isDisconnected } = useAccount()
    const [assetFrom, setAssetFrom] = useState<AssetStruct>()
    const [assetTo, setAssetTo] = useState<AssetStruct>()
    const [allowPartialTrade, setAllowPartialTrade] = useState<boolean>(true)
    const [lockDuration, setLockDuration] = useState<number>(100)

    const [isModalFromOpen, setIsModalFromOpen] = useState(false);
    const [isModalToOpen, setIsModalToOpen] = useState(false);
    const [isModalExecuteOpen, setIsModalExecuteOpen] = useState(false);

    const showModalFrom = () => {
        setIsModalFromOpen(true);
    };
    const showModalTo = () => {
        setIsModalToOpen(true);
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
                    setAssetFrom(undefined)
                    setAssetTo(undefined)
                    //setIsModalExecuteOpen(false)
                }
            }
        )
    };

    const handleCancelFrom = () => {
        setIsModalFromOpen(false);
    };

    const handleCancelTo = () => {
        setIsModalToOpen(false);
    };

    const handleCancelExcute = () => {
        setIsModalExecuteOpen(false);
        setIsPending(false)
        setItems([{
            label: "Init",
            color: 'blue',
            children: 'Create Trade',
        }])
    };

    const setAssetFromModal = (asset: AssetStruct) => {
        setAssetFrom(asset)
        setIsModalFromOpen(false)
    }

    const setAssetToModal = (asset: AssetStruct) => {
        setAssetTo(asset)
        setIsModalToOpen(false)
    }

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




    return (
        <>
            {address && !isConnecting && !isDisconnected ?
                <>
                    <Row justify={"center"} gutter={[16, 16]}>
                       
                        <Col lg={10} >

                            <AssetInfo title={"Asset to exchange"} asset={assetFrom} />

                            <Space.Compact style={{ marginTop: "10px" }}>
                                <Button type="primary" onClick={showModalFrom} icon={<CheckCircleOutlined />} >
                                    Select Asset
                                </Button>
                                <Button type="primary" icon={<CloseCircleOutlined />} onClick={
                                    () => {
                                        setAssetFrom(undefined)
                                    }
                                } danger>
                                    Reset Asset
                                </Button>
                            </Space.Compact>
                            <Modal width={720} title="Asset From" open={isModalFromOpen} footer={null} closable={true} onCancel={handleCancelFrom} >
                                <AssetSelectionComponent from={true} setAsset={setAssetFromModal} />
                            </Modal>
                        </Col>

                        <Col>
                            <ArrowRightOutlined size={100} />
                        </Col>

                        <Col lg={10}>
                            <AssetInfo title={"Asset to get"} asset={assetTo} />
                            <Space.Compact style={{ marginTop: "10px" }}>
                                <Button type="primary" icon={<CheckCircleOutlined />} onClick={showModalTo} disabled={!assetFrom}>
                                    Select Asset
                                </Button>
                                <Button type="primary" icon={<CloseCircleOutlined />}
                                    onClick={() => {
                                        setAssetTo(undefined)
                                    }}
                                    disabled={!assetFrom} danger>
                                    Reset Asset
                                </Button>
                            </Space.Compact>
                            <Modal width={720} title="Asset From" open={isModalToOpen} footer={null} closable={true} onCancel={handleCancelTo} >
                                <AssetSelectionComponent from={false} setAsset={setAssetToModal} forbidenAsset={assetFrom} />
                            </Modal>
                        </Col>
                    </Row>

                    <Row style={{ marginTop: "2em" }}>

                        <Space style={{ marginTop: "10px", marginLeft: "1em" }} direction="vertical">
                            <Button type="primary" onClick={showModalExecute} disabled={!assetFrom || !assetTo}>
                                Create Trade
                            </Button>
                            Partial Trade:
                            <Switch onChange={() => setAllowPartialTrade(!allowPartialTrade)} checkedChildren="ON" unCheckedChildren="OFF" defaultChecked />
                            Lock duration (Any one can remove your trade passed lock time):
                            <Segmented value={timeSegmented} options={lockTimesDesc} onChange={(e) => changeLockSegmented(e.toString())} />
                            <InputNumber style={{ width: "auto" }}
                                value={lockDuration}
                                min={100}
                                about={"Set lock time duration"}
                                onChange={(e) => setLockDuration(e!)}
                            />
                        </Space>
                        <Modal width={720} title={"Trade execution"} open={isModalExecuteOpen} footer={null} closable={true} onCancel={handleCancelExcute} >
                            <Timeline mode={"left"} items={items} pending={isPending ? "waiting for confirmations" : undefined}>
                            </Timeline>
                        </Modal>

                    </Row>
                </>
                :
                <RequireConnection />
            }
        </>
    );
}