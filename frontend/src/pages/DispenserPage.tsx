import { Button, Card, Col, Row, Typography } from 'antd';
import { ERC20_MOCK_ABI, ERC20_MOCK_ADDRESS_A, ERC20_MOCK_ADDRESS_B } from '../models/erc20Mock';
import { useContractWrite, usePrepareContractWrite } from 'wagmi'
import { ERC721_MOCK_ADDRESS_1, ERC721_MOCK_ADDRESS_2 } from '../models/erc721';
import { ERC721_MOCK_ABI } from '../models/erc721';
const base = import.meta.env.BASE_URL

const { Paragraph, Link } = Typography;

export default function DispenserPage() {

    const { config: configTokenA } = usePrepareContractWrite({
        address: ERC20_MOCK_ADDRESS_A,
        abi: ERC20_MOCK_ABI,
        functionName: 'dispense',
    })
    const { data: dataA, isLoading: isLoadingA, isSuccess: isSuccessA, write: writeA } = useContractWrite(configTokenA)

    const { config: configTokenB } = usePrepareContractWrite({
        address: ERC20_MOCK_ADDRESS_B,
        abi: ERC20_MOCK_ABI,
        functionName: 'dispense',
    })
    const { data: dataB, isLoading: isLoadingB, isSuccess: isSuccessB, write: writeB } = useContractWrite(configTokenB)

    function randomInteger(min: number, max: number) {
        const rng = Math.floor(Math.random() * (max - min + 1)) + min;
        return rng
    }

    const { config: configNFT1 } = usePrepareContractWrite({
        address: ERC721_MOCK_ADDRESS_1,
        abi: ERC721_MOCK_ABI,
        functionName: 'dispense',
        args: [`${base}/nft0-item-${randomInteger(0, 5)}.json`],
    })
    const { data: dataNFT1, isLoading: isLoadingNFT1, isSuccess: isSuccessNFT1, write: writeNFT1 } = useContractWrite(configNFT1)

    const { config: configNFT2 } = usePrepareContractWrite({
        address: ERC721_MOCK_ADDRESS_2,
        abi: ERC721_MOCK_ABI,
        functionName: 'dispense',
        args: [`${base}/nft0-item-${randomInteger(0, 5)}.json`],
    })
    const { data: dataNFT2, isLoading: isLoadingNFT2, isSuccess: isSuccessNFT2, write: writeNFT2 } = useContractWrite(configNFT2)

    return (
        <Row align={"middle"} justify={"center"} gutter={[20, 20]}>
            <Col>
                <Card title={`tZen dispenser`}>
                    <Paragraph>
                        Gobi tesnet faucet transfers TZEN tokens on Horizen testnet chains.
                    </Paragraph>
                    <Paragraph>
                        The tokens are for testnet only and cannot be redeemed for real funds.
                    </Paragraph>
                    <Paragraph>
                        Withdrawals are limited to one request per 24 hours and the amount received is 0.51 TZEN.
                    </Paragraph>
                    <Link href={"https://faucet.horizen.io/"}> Horizen Test Token Faucet</Link>
                </Card>
            </Col>
            <Col>
                <Card title={`ERC20 Mock token A dispenser`}>
                    <Paragraph>
                        Mock ERC20 dispenser. Sends 10 Tokens A (Zen unit)
                    </Paragraph>
                    <Paragraph>
                        {ERC20_MOCK_ADDRESS_A}
                    </Paragraph>
                    {writeA &&
                        <Button type='primary' onClick={() => writeA()}>
                            Dispense Token A
                        </Button>
                    }
                    {isLoadingA && <div>Check Wallet</div>}
                    {isSuccessA && <div>Transaction: {JSON.stringify(dataA)}</div>}
                </Card>
            </Col>
            <Col>
                <Card title={`ERC20 Mock token B dispenser`}>
                    <Paragraph>
                        Mock ERC20 dispenser. Sends 10 Tokens B (Zen unit)
                    </Paragraph>
                    <Paragraph>
                        {ERC20_MOCK_ADDRESS_B}
                    </Paragraph>
                    {writeB &&
                        <Button type='primary' onClick={() => writeB()}>
                            Dispense Token B
                        </Button>
                    }
                    {isLoadingB && <div>Check Wallet</div>}
                    {isSuccessB && <div>Transaction: {JSON.stringify(dataB)}</div>}
                </Card>
            </Col>

            <Col>
                <Card title={`Mock ERC721 -NFT A- dispenser`}>
                    <Paragraph>
                        Mock ERC721 dispenser. Sends 1 NFT A
                        url {`${base}/nft0-item-${randomInteger(0, 5)}.json`}
                    </Paragraph>
                    <Paragraph>
                        {ERC721_MOCK_ADDRESS_1}
                    </Paragraph>
                    {writeNFT1 &&
                        <Button type='primary' onClick={() => writeNFT1()}>
                            Dispense NFT A
                        </Button>
                    }
                    {isLoadingNFT1 && <div>Check Wallet</div>}
                    {isSuccessNFT1 && <div>Transaction: {JSON.stringify(dataNFT1)}</div>}
                </Card>
            </Col>
            <Col>
                <Card title={`Mock ERC721 -NFT B- dispenser`}>
                    <Paragraph>
                        Mock ERC721 dispenser. Sends 1 NFT B
                    </Paragraph>
                    <Paragraph>
                        {ERC721_MOCK_ADDRESS_2}
                    </Paragraph>
                    {writeNFT2 &&
                        <Button type='primary' onClick={() => writeNFT2()}>
                            Dispense NFT B
                        </Button>
                    }
                    {isLoadingNFT2 && <div>Check Wallet</div>}
                    {isSuccessNFT2 && <div>Transaction: {JSON.stringify(dataNFT2)}</div>}
                </Card>
            </Col>
        </Row>
    );

} 