import { Alert, Button, Input, InputRef, Space, Spin, Switch, Table, Tag, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import { useContractRead } from "wagmi";
import { AssetContract, ESCROW_ABI, ESCROW_ADDRESS, Trade } from "../models/escrow";
import { useEffect, useRef, useState } from "react";
import { formatEther } from "viem";
import { AssetTypes } from "../models/assets";
import { ColumnType, FilterConfirmProps } from "antd/es/table/interface";
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from 'react-highlight-words'

const { Title, Paragraph } = Typography;
type DataIndex = keyof Trade


export function RenderAssetAmount(props: { asset: AssetContract }) {
  const asset = props.asset;

  switch (asset.assetType) {
    case AssetTypes.NATIVE_ZEN:
      return <> {formatEther(asset.amount)} ZEN
      </>
      break;

    case AssetTypes.ERC20_TOKEN:
      return <> {formatEther(asset.amount)} Tokens (ZEN unit)
      </>

      break;
    case AssetTypes.ERC721_NFT:
      return <> {asset.amount.toString()} NFTs
      </>

      break;

    default:
      break;
  }

  return <>
  </>
}

export default function ShowTrades() {

  const [tradesData, setTradeData] = useState<Trade[]>()
  const [showVirtual, setShowVirtual] = useState<boolean>(false)



  const { data: trades, isError: isErrorTrade, isLoading: isLoadingTrade } = useContractRead({
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
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      // if(element.owner != ESCROW_ADDRESS){
      element.key = element.tradeId.toString()
      trades.push(element)
      // }
    }
    setTradeData(trades)
  }

  useEffect(
    () => {
      if (trades) {
        if (!showVirtual) {
          console.log("filter")
          const newTrades = trades!.filter(
            v => (v.owner != ESCROW_ADDRESS)
          )
          setTradeData(newTrades)
        } else {
          const newTrades = trades.filter(_v => true);
          setTradeData(newTrades)
        }
      }
    },
    [showVirtual, trades]
  )

  function formatAddressLink(addr: string, size: number = 0) {
    let a: string;
    if (size > 0) {
      a = `${addr.slice(0, size)}...${addr.slice(-size)}`
    } else {
      a = addr
    }

    return (
      <a
        target="_blank"
        href={`https://gobi-explorer.horizen.io/address/${addr}`}>
        {a}
      </a>
    );
  }

  function formatDate(timestamp: bigint) {
    const date = new Date(parseInt(timestamp.toString()) * 1000)
    return date.toLocaleDateString() + " - " + date.toLocaleTimeString()
  }

  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef<InputRef>(null);

  const handleSearch = (
    selectedKeys: string[],
    confirm: (param?: FilterConfirmProps) => void,
    dataIndex: DataIndex,
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (confirm: (param?: FilterConfirmProps) => void, clearFilters: () => void) => {
    clearFilters();
    setSearchText('');
    confirm()
  };

  const getColumnSearchProps = (dataIndex: DataIndex, property?: string): ColumnType<Trade> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(confirm, clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
    ),
    onFilter: (value, record) => {
      // @ts-ignore: Object is possibly 'null'.
      const v = property ? record[dataIndex][property] : record[dataIndex]
      return v.toString()
        .toLowerCase()
        .includes((value as string).toLowerCase())
    },
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const columnsTrades: ColumnsType<Trade> = [
    {
      title: 'TradeId',
      dataIndex: 'tradeId',
      key: 'tradeId',
      defaultSortOrder: 'descend',
      sorter: (a, b) => Number(a.tradeId - b.tradeId),
      render: (id: bigint) => <strong>{id.toString()}</strong>,
    },
    {
      title: 'Owner',
      dataIndex: 'owner',
      key: 'owner',
      ellipsis: {
        showTitle: false,
      },
      ...getColumnSearchProps('owner'),
      render: (addr: string) => <>{(addr == ESCROW_ADDRESS) ? <Tag color={"pink"}>VIRTUAL TRADE</Tag>: formatAddressLink(addr)}</>
    },

    {
      title: "From",
      dataIndex: 'fromAsset',
      align: "left",
      key: "from",
      children: [{
        title: "Address",
        dataIndex: 'fromAsset',
        key: 'fromAssetAddres',
        ellipsis: {
          showTitle: false,
        },
        ...getColumnSearchProps('fromAsset', 'assetAddress'),
        render: (asset: AssetContract) => <>{(asset.assetType == AssetTypes.NATIVE_ZEN) ? "NATIVE ZEN" : formatAddressLink(asset.assetAddress)}</>
      },
      {
        title: "Type",
        dataIndex: 'fromAsset',
        key: 'fromAssetType',
        filters: [
          {
            text: 'NATIVE ZEN',
            value: AssetTypes.NATIVE_ZEN,
          },
          {
            text: 'TOKENS',
            value: AssetTypes.ERC20_TOKEN,
          },
          {
            text: 'NFTs',
            value: AssetTypes.ERC721_NFT,
          },],
        onFilter: (value: any, record) => record.fromAsset.assetType.toString() == value.toString(),
        render: (asset: AssetContract) => <>
          {asset.assetType == AssetTypes.NATIVE_ZEN && <Tag color={"red"}>NATIVE ZEN</Tag>}
          {asset.assetType == AssetTypes.ERC20_TOKEN && <Tag color={"blue"}>TOKENS</Tag>}
          {asset.assetType == AssetTypes.ERC721_NFT && <Tag color={"green"}>NFTs</Tag>}
        </>
      },

      {
        title: "Amount",
        dataIndex: 'fromAsset',
        key: 'fromAssetAmount',
        render: (asset: AssetContract) => <RenderAssetAmount asset={asset} />
      },
      ]
    },
    {
      title: "To",
      dataIndex: 'toAsset',
      align: "left",
      key: "to",
      children: [
        {
          title: "Address",
          dataIndex: 'toAsset',
          key: "toAssetAddres",
          ellipsis: {
            showTitle: false,
          },
          ...getColumnSearchProps('toAsset', 'assetAddress'),
          render: (asset: AssetContract) => <>{(asset.assetType == AssetTypes.NATIVE_ZEN) ? "NATIVE ZEN" : formatAddressLink(asset.assetAddress)}</>
        },
        {
          title: "Type",
          dataIndex: 'toAsset',
          key: 'toAssetType',
          filters: [
            {
              text: 'NATIVE ZEN',
              value: AssetTypes.NATIVE_ZEN,
            },
            {
              text: 'TOKENS',
              value: AssetTypes.ERC20_TOKEN,
            },
            {
              text: 'NFTs',
              value: AssetTypes.ERC721_NFT,
            },],
          onFilter: (value: any, record) => record.toAsset.assetType.toString() == value.toString(),
          render: (asset: AssetContract) => <>
            {asset.assetType == AssetTypes.NATIVE_ZEN && <Tag color={"red"}>NATIVE ZEN</Tag>}
            {asset.assetType == AssetTypes.ERC20_TOKEN && <Tag color={"blue"}>TOKENS</Tag>}
            {asset.assetType == AssetTypes.ERC721_NFT && <Tag color={"green"}>NFTs</Tag>}
          </>
        },

        {
          title: "Amount",
          dataIndex: 'toAsset',
          key: 'toAssetAmount',
          render: (asset: AssetContract) => <RenderAssetAmount asset={asset} />
        },]
    },
    {
      title: "Allows Partial?",
      dataIndex: 'allowPartial',
      key: 'allowPartial',
      filters: [
        {
          text: 'YES',
          value: true,
        },
        {
          text: 'NO',
          value: false,
        },],
      onFilter: (value: any, record) => record.allowPartial.toString() == value.toString(),
      render: (allow: boolean) => <>{allow ? "YES" : "NO"}</>
    },
    {
      title: "Unlock Date",
      dataIndex: 'expireTime',
      key: 'expireTime',
      render: (exp: bigint) => <>{(Number(exp) == 0)? "NONE" :formatDate(exp)}</>
    }

  ]

  return (
    <>

      <Typography>
        <Title>Escrow Contract Trades</Title>
        <Paragraph>Address: {formatAddressLink(ESCROW_ADDRESS, 0)}</Paragraph>
        <Paragraph>
          <Switch style={{marginRight:"1rem"}} defaultChecked={showVirtual} onChange={() => setShowVirtual(!showVirtual)} />
          Show Virtual Trades
        </Paragraph>
      </Typography>

      {isLoadingTrade && <Spin key={"spin"} />}
      {isErrorTrade && <Alert key={"alert"} message={"Error reitring trade data"} />}
      {trades && !isLoadingTrade && !isErrorTrade &&
        <Table key={"trades"} columns={columnsTrades} dataSource={tradesData} pagination={{ defaultPageSize: 10 }} />
      }
    </>
  );
}