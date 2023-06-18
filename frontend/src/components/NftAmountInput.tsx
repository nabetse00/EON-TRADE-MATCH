import { useEffect, useState } from "react";
import { erc721ABI } from "wagmi";
import { readContract } from '@wagmi/core'
import RenderNFT from "./RenderNFT";
import Transfer, { TransferDirection } from "antd/es/transfer";



interface RecordType {
    key: string;
    title: string;
    tokenId: bigint;
    chosen: boolean;
}



export default function NftAmountInput(props: {
    address: string,
    nftAddress: string,
    amount: number,
    balance: number,
    setAmount: (arg0: number) => void;
    setTokesnIdsToTrade: (arg0: bigint[]) => void,
}) {

    const [tokenIds, setTokenIds] = useState<bigint[]>([]);

    async function findUserTokens(): Promise<bigint[]> {
        const totalSupply = await readContract({
            address: props.nftAddress as `0x${string}`,
            abi: erc721ABI,
            functionName: 'totalSupply',
        })
        const tIds: bigint[] = []

        console.log(`supply is: ${totalSupply}`)

        for (let index = 0; index < Number(totalSupply); index++) {
            const tokId = await readContract({
                address: props.nftAddress as `0x${string}`,
                abi: erc721ABI,
                functionName: 'tokenByIndex',
                args: [BigInt(index)]
            })

            const owner = await readContract({
                address: props.nftAddress as `0x${string}`,
                abi: erc721ABI,
                functionName: 'ownerOf',
                args: [BigInt(tokId)]
            })
            console.log(`owner ${owner}`)

            if (owner == props.address) {
                tIds.push(tokId)
                console.log(`push ${tokId}`)
            }
        }
        return tIds
    }

    useEffect(
        () => {
            findUserTokens().then(
                (v) => {
                    setTokenIds(v)
                }
            )
        },
        [props.address, props.nftAddress]
    )

    useEffect(
        () => {
            setTransferData()
        },
        [tokenIds]
    )

    const [tradeData, setTradeData] = useState<RecordType[]>([]);
    const [targetKeys, setTargetKeys] = useState<string[]>([]);

    useEffect(
        () => {
            // console.log(`target keys: ${targetKeys}`)
            const tradeTokensIds = []
            for (let index = 0; index < targetKeys.length; index++) {
                tradeTokensIds.push(tradeData[parseInt(targetKeys[index])].tokenId )
            }
            // console.log(`target keys: ${tradeTokensIds}`)
            props.setTokesnIdsToTrade(tradeTokensIds)
            props.setAmount(tradeTokensIds.length)
        },
        [targetKeys]
    )

    const setTransferData = () => {
        const tempTargetKeys = [];
        const tempMockData = [];
        for (let i = 0; i < tokenIds.length; i++) {
            const data = {
                key: i.toString(),
                title: `NFT ${tokenIds[i]}`,
                tokenId: tokenIds[i],
                chosen: false,
            };
            if (data.chosen) {
                tempTargetKeys.push(data.key);
            }
            tempMockData.push(data);
        }
        setTradeData(tempMockData);
        setTargetKeys(tempTargetKeys);
    };



    const filterOption = (inputValue: string, option: RecordType) =>
        option.title.indexOf(inputValue) > -1;

    const handleChange = (newTargetKeys: string[]) => {
        setTargetKeys(newTargetKeys);
    };

    const handleSearch = (dir: TransferDirection, value: string) => {
        console.log('search:', dir, value);
    };


    return (
        <Transfer
            listStyle={{
                width: 250,
                height: 300,
            }}
            dataSource={tradeData}
            showSearch
            filterOption={filterOption}
            targetKeys={targetKeys}
            onChange={handleChange}
            onSearch={handleSearch}
            operations={['Add to trade', 'Remove from trade']}
            render={(item) => <RenderNFT key={item.key} added={true} tokenId={item.tokenId} nftAddress={props.nftAddress as `0x${string}`} />}
            titles={["Your NFTs", "NFTs to trade"]}
        />
    );
}