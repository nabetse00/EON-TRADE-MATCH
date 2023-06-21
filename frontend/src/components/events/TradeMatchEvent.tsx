import { useContractEvent } from "wagmi";
import { ESCROW_ABI, ESCROW_ADDRESS } from "../../models/escrow";
import { NotificationInstance } from "antd/es/notification/interface";

export default function TradeMatchEvent(props: { api: NotificationInstance }) {
    useContractEvent({
        address: ESCROW_ADDRESS,
        abi: ESCROW_ABI,
        eventName: 'TradesMatched',
        listener(log) {
            for (let index = 0; index < log.length; index++) {
                const args = log[index].args
                openNotification(args.ta!.tradeId, args.tb!.tradeId, false)
            }
        },
    })

    useContractEvent({
        address: ESCROW_ADDRESS,
        abi: ESCROW_ABI,
        eventName: 'TradesPartialyMatched',
        listener(log) {
            for (let index = 0; index < log.length; index++) {
                const args = log[index].args
                openNotification(args.ta!.tradeId, args.tb!.tradeId, true)
            }
        },
    })

    const openNotification = (tradeIdA:bigint, tradeIdB: bigint, partial: boolean) => {
        props.api.info({
          message: `Trades ${partial? "paritaly": ""} Matched`,
          description:
            `Trade #${tradeIdA.toString()} matched with Trade #${tradeIdB.toString()}`,
          duration: 5,
        });
      };

    return (
        <>
        </>);
}