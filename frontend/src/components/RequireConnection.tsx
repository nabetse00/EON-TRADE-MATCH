import { Alert, Typography } from "antd";
import Link from "antd/es/typography/Link";
import WalletConnector from "./WalletConnector";
const { Paragraph } = Typography;

export default function RequireConnection() {
    
    const message = 
    <>
    <Paragraph>Please connect metamask to this dapp</Paragraph>
    <Paragraph>
        if you haven't installed it already: follow &nbsp;
    <Link href="https://metamask.io/download/" target="_blank">
    this link.
    </Link>
    </Paragraph>

    <WalletConnector/>

    </>
    

    return (
        <Alert
            message="Please connect metamask !"
            description={message}
            type="error"
            showIcon
        />
    );
}