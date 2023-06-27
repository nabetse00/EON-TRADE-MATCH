import ReactFlow, { Background, Connection, Controls, Edge, EdgeChange, MarkerType, NodeChange } from 'reactflow';
import 'reactflow/dist/style.css';
import { ESCROW_ABI, ESCROW_ADDRESS, Trade } from '../models/escrow';
import { useContractRead } from 'wagmi';
import { useCallback, useState } from 'react';
import {
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
} from 'reactflow';
import AssetNode from '../components/flow/node';
import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

type Node = {
    id: string;
    data: { label: string, type:string};
    position: { x: number, y: number };
    type?: string;
}
//const edgeType = 'smoothstep';

const nodeTypes = { AssetUpdater: AssetNode };


export default function Flow() {

    //const [tradesData, setTradeData] = useState<Trade[]>()
    const [nodesData, setNodesData] = useState<Node[]>()
    const [edgesData, setEdgesData] = useState<Edge[]>()

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => setNodesData((nds) => applyNodeChanges(changes, nds!)),
        []
    );
    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) => setEdgesData((eds) => applyEdgeChanges(changes, eds!)),
        []
    );

    const onConnect = useCallback((params: Edge | Connection) => setEdgesData((eds) => addEdge(params, eds!)), []);

    let current: position = { x: 0, y: 0 };
    type position = {
        x: number;
        y: number;
    }
    function newPosition(pos: position) {
        if ((pos.x + pos.y) % 400 == 0) {
            const x = (pos.x + 200);
            current = { x: x, y: pos.y }
            return current

        } else {
            const y = (pos.y + 200);
            current = { x: pos.x, y: y }
            return current
        }

    }

    useContractRead({
        address: ESCROW_ADDRESS,
        abi: ESCROW_ABI,
        functionName: 'getTrades',
        cacheTime: 2_000,
        onSuccess(data) {
            generateTradesData(data)
        },
    })

    function generateTradesData(data: string |
        any[] |
        readonly {
            tradeId: bigint;
            owner: `0x${string}`;
            fromAsset: { assetId: bigint; assetType: number; assetAddress: `0x${string}`; amount: bigint; };
            toAsset: { assetId: bigint; assetType: number; assetAddress: `0x${string}`; amount: bigint; };
            allowPartial: boolean;
            expireTime: bigint;
        }[]
    ): void {
        const trades: Trade[] = []
        const nodes: Node[] = []
        const edges: Edge[] = []
        for (let index = 0; index < data.length; index++) {
            const element = data[index];

            let foundFrom = false;
            let foundTo = false;
            for (const n of nodes) {
                if ((n.id == element.fromAsset.assetAddress)) {
                    foundFrom = true;
                    //break;
                }
                if ((n.id == element.toAsset.assetAddress)) {
                    foundTo = true;
                    //break;
                }

            }

            if (!foundFrom) {
                nodes.push(
                    {
                        id: element.fromAsset.assetAddress,
                        data: { label: `${element.fromAsset.assetAddress}`, type:`${element.fromAsset.assetType}`, },
                        position: newPosition(current),
                        type: 'AssetUpdater',
                    },
                )
            }

            if (!foundTo) {
                nodes.push(
                    {
                        id: element.toAsset.assetAddress,
                        data: { label: `${element.toAsset.assetAddress}`, type:`${element.toAsset.assetType}`, },
                        position: newPosition(current),
                        type: 'AssetUpdater',
                    },
                )
            }
            edges.push(
                {
                    id: `${element.tradeId}`,
                    source: element.fromAsset.assetAddress,
                    target: element.toAsset.assetAddress,
                    //type: edgeType, 
                    animated: true,
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                    },
                },
            )


            if (element.owner != ESCROW_ADDRESS) {
                element.key = element.tradeId.toString()
                trades.push(element)
            }
        }
        setNodesData(nodes)
        setEdgesData(edges)
        //setTradeData(trades)
    }
    return (

        <>
        <Typography>
        <Title>Graph representation of current trades</Title>
        <Paragraph>Drag nodes to have a better view</Paragraph>
       
        </Typography>

            <ReactFlow
                nodes={nodesData}
                edges={edgesData}
                style={{ margin: "4em" }}
                fitView
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                >
                <Background />
                <Controls />
            </ReactFlow>
               

      

        </>


    );
}