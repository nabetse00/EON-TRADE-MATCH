import { Button, Card, Row, Space, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
const { Paragraph } = Typography;

export default function HomePage() {

    const gridStyle: React.CSSProperties = {
        width: '100%',
        textAlign: 'center',
    };

    const navigate = useNavigate();


    return (
        <Row justify={"center"} align={"middle"} >
            <Card style={{ width: "550px" }} title={`Eon Trade Match`} >


                <Card.Grid style={gridStyle}>

                    <Paragraph>

                        Welcome to EonTrade, the premier platform for automated trades between users without the need for a direct counterparty.
                        Our innovative system matches users based on their desired assets, enabling seamless and secure transactions.
                    </Paragraph>
                    <Paragraph>
                        With EonTradeMatch, you have the power to take control of your investments and unlock the potential of your assets. Say goodbye to the limitations of traditional trading methods and embrace the convenience and flexibility of automated trades.

                    </Paragraph>
                    <Paragraph>
                        Experience a new era of automated trading with EonTrade. Join our community of traders, eliminate the hassle of finding a direct counterparty, and unlock the full potential of your assets. Embrace the future of trading with EonTrade – where seamless and secure transactions become a reality.
                    </Paragraph>
                </Card.Grid>

                <Card.Grid style={gridStyle}>
                    <Space>

                        <Button onClick={() => { navigate("show-trades"); }}>
                            Show trades
                        </Button>
                        <Button onClick={() => { navigate("create-trades"); }}>
                            Create Trades
                        </Button>
                        <Button onClick={() => { navigate("withdraw"); }}>
                            Withdraw trades
                        </Button>
                        <Button onClick={() => { navigate("dispenser"); }}>
                            Dispencer
                        </Button>
                    </Space>
                </Card.Grid>
            </Card>
        </Row>
    );
}