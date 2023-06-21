import { useContractEvent } from "wagmi";
import { ESCROW_ABI, ESCROW_ADDRESS } from "../../models/escrow";
import { NotificationInstance } from "antd/es/notification/interface";

export default function CreateTradeEvent(props: { api: NotificationInstance, address: `0x${string}` }) {

    // Contract event
    useContractEvent({
        address: ESCROW_ADDRESS,
        abi: ESCROW_ABI,
        eventName: 'TradeCreated',
        listener(log) {
            for (let index = 0; index < log.length; index++) {
                const event = log[index].args.t
                if (event?.owner == props.address) {
                    props.api.info({
                        message: `Trade Created Event`,
                        description:
                            <ul>
                                <li>
                                    {`Trade ID: ${event?.tradeId}`}</li>
                                <li>
                                    {`Expire time: ${event?.expireTime}`}</li>
                            </ul>,
                        duration: 5,
                    });
                }
            }

        },
    })

    return <></>
}