import {
    useAccount,
    useBalance,
    useConnect,
    useDisconnect,
} from 'wagmi'


import { Avatar, Button, Space, Typography } from "antd";

import Blockies from "react-blockies";
import { LogoutOutlined } from '@ant-design/icons';


const { Text } = Typography;

export default function WalletConnector() {
    const { address, isConnected } = useAccount()
    const { data } = useBalance({
        address: address
    })
    const { connect, connectors, error, isLoading, pendingConnector } =
        useConnect()
    const { disconnect } = useDisconnect()

    const displayText = (txt: string, size: number) => {
        return txt.slice(0, size) + "..." + address?.slice(-size);
    }
    
    if (isConnected) {
        return (
            <Space.Compact>
                <Button type="default" size="large" style={{ height: 'auto' }}>
                    <Space direction="horizontal">
                        <Avatar size="default" icon={<Blockies seed={address!.toLowerCase()} size={8} />} />
                        <Space.Compact direction="vertical">
                            <Text copyable={{ text: address, format: 'text/plain' }} >
                                {displayText(address!, 10)}
                            </Text>
                            <Text>{data?.formatted.slice(0, 12)} {data?.symbol}</Text>
                        </Space.Compact>

                    </Space>
                </Button>
                <Button size="large" style={{ height: 'auto', minWidth: '40px' }} icon={<LogoutOutlined />}
                    onClick={(_) => disconnect()}
                >
                </Button>
            </Space.Compact>
        )
    }

    return (
        <Space.Compact direction='vertical'>
            {connectors.map((connector) => (
                <Button
                    disabled={!connector.ready}
                    key={connector.id}
                    onClick={() => connect({ connector })}
                    loading={isLoading &&
                        connector.id === pendingConnector?.id}
                >
                    {`Connect to ${connector.name}`}
                    {!connector.ready && ' (not installed)'}
                    {isLoading &&
                        connector.id === pendingConnector?.id &&
                        ' (connecting)'}
                </Button>
            ))}

            {error && <div>{error.message}</div>}
        </Space.Compact>
    )
}