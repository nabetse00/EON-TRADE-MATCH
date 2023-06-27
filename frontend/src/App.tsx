
import { ConfigProvider, notification, theme } from 'antd';
import './App.css'
import { useMediaQuery } from 'react-responsive';
import { useState } from 'react';
import { geekblue } from '@ant-design/colors';
import logo from "./assets/eon-escrow-logo.png"


import { CreditCardOutlined, DotChartOutlined, HomeOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined, ShoppingCartOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Col, Layout, Menu, Row, Space, Switch } from 'antd';


import { Footer } from 'antd/es/layout/layout';


import WalletConnector from './components/WalletConnector';
import { Link, Outlet } from 'react-router-dom';
import type { MenuProps } from 'antd';
import TradeMatchEvent from './components/events/TradeMatchEvent';
import CreateTradeEvent from './components/events/TradeCreatedEvent';
import { useAccount } from 'wagmi';
import RequireConnection from './components/RequireConnection';
import { ESCROW_ADDRESS } from './models/escrow';
import { ERC20_MOCK_ADDRESS_A, ERC20_MOCK_ADDRESS_B } from './models/erc20Mock';
import { ERC721_MOCK_ADDRESS_1, ERC721_MOCK_ADDRESS_2 } from './models/erc721';
import Flow from './pages/EyeCandyPage';

const { Header, Content, Sider } = Layout;
type MenuItem = Required<MenuProps>['items'][number];

const routes: MenuItem[] = [
  {
    key: String(0),
    icon: <HomeOutlined />,
    label: <Link to="">Home</Link>,
  },
  {
    key: String(1),
    icon: <CreditCardOutlined />,
    label: <Link to="create-trades">Add Trade</Link>,
  },
  {
    key: String(2),
    icon: <ShoppingCartOutlined />,
    label: <Link to="show-trades">Show Trades</Link>,
  },
  {
    key: String(3),
    icon: <UploadOutlined />,
    label: <Link to="dispenser">Dispensers</Link>,
  },
  {
    key: String(4),
    icon: <LogoutOutlined />,
    label: <Link to="withdraw">Withdraw Trades</Link>,
  },
  {
    key: String(5),
    icon: <DotChartOutlined />,
    label: <Link to="eyecandy">Eye candy</Link>,
  },

]

function App() {

  const toggleTheme = (_c: boolean, _event: any) => {
    setIsDark(!isDark)
  }

  const [collapsed, setCollapsed] = useState(false);

  const systemPrefersDark = useMediaQuery(
    {
      query: "(prefers-color-scheme: dark)"
    },
    undefined,
    prefersDark => {
      setIsDark(prefersDark);
    }
  );

  const [isDark, setIsDark] = useState(systemPrefersDark);
  const [api, contextHolder] = notification.useNotification();
  const { address, isDisconnected, isConnecting } = useAccount()

  return (

    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: geekblue[5],
        },
      }}
    >
      <Layout style={{ minHeight: "100vh" }}>
        {contextHolder}
        <Sider
          breakpoint="lg"
          collapsedWidth="0"
          width={180}
          theme='dark'
          // style={{background:"transparent"}}
          // style={{background: colorBgContainer}}
          onBreakpoint={(broken) => {
            setCollapsed(broken)

          }}
          onCollapse={(collapsed, type) => {
            console.log(collapsed, type);
          }}

          trigger={null}
          collapsed={collapsed}

        >
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={['0']}
            items={routes}
          />
          <Space direction="vertical" align='center' style={{ display: 'flex' }}>
            <Switch
              unCheckedChildren={"Dark"}
              checkedChildren={"Light"}
              onChange={toggleTheme}
              checked={isDark}
            />

          </Space>
        </Sider>
        <Layout>
          <Header style={{ padding: 0, paddingTop: "14px", paddingBottom: "14px", height: "auto", background: "transparent" }}>
            <Row align={"middle"} justify={"center"}>
              <Col  span={6}>
                <Button
                  type="text"
                  icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                  onClick={() => setCollapsed(!collapsed)}
                  style={{
                    fontSize: '16px',
                    width: 64,
                    height: 64,
                  }}
                />
              </Col>
              <Col flex={"auto"}>
                <img src={logo} alt="logo" height={"40px"}/>
                <span style={{fontFamily:'Neuro', fontSize:'1.5em'}}>
                  EonTradeMatch
                  </span>
                  
              </Col>

              <Col flex={"none"} style={{ marginRight: "1rem" }}>
                <WalletConnector />
              </Col>

            </Row>

          </Header>
          <Content style={{ margin: '16px 16px 0' }}>

            <>
              {(address && !isConnecting && !isDisconnected) ?
                <>
                  <TradeMatchEvent api={api} />
                  <CreateTradeEvent api={api} address={address} />
                  <Outlet />
                </> : <RequireConnection />
              }
            </>
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            ©2023
          </Footer>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}

export default App
