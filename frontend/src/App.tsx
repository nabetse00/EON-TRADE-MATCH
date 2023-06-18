
import { ConfigProvider, theme } from 'antd';
import './App.css'
import { useMediaQuery } from 'react-responsive';
import { useState } from 'react';
import { geekblue } from '@ant-design/colors';


import { MenuFoldOutlined, MenuUnfoldOutlined, UploadOutlined, UserOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { Button, Card, Col, Layout, Menu, Row, Space, Switch } from 'antd';


import { Footer } from 'antd/es/layout/layout';


import WalletConnector from './components/WalletConnector';
import { Link, Outlet } from 'react-router-dom';
import type { MenuProps } from 'antd';

const { Header, Content, Sider } = Layout;
type MenuItem = Required<MenuProps>['items'][number];

const routes: MenuItem[] = [
  {
    key: String(1),
    icon: <UserOutlined />,
    label: <Link to="test">test route</Link>,
  },
  {
    key: String(2),
    icon: <VideoCameraOutlined />,
    label: <Link to="test">test route</Link>,
  },
  {
    key: String(3),
    icon: <UploadOutlined />,
    label: <Link to="test">test route</Link>,
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
          <div className="demo-logo-vertical" />
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={['4']}
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
              <Col flex="auto">
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

              <Col flex={"none"} style={{ marginRight: "1rem" }}>
                <WalletConnector />
              </Col>

            </Row>

          </Header>
          <Content style={{ margin: '16px 16px 0' }}>
            <Card>
              <Outlet />
            </Card>
          </Content>
          <Footer style={{ textAlign: 'center' }}>
          <ul>
            <li>Escrow : 0x6ec034FaBccb5AF17b5eC2460bf36A39D797425c</li>
            <li>ERC20 1: 0x4de78d5cee888c581cbaeb41da6813bfeb95f21a</li>
            <li>ERC20 2: 0x96E7Cc0a9f026B2Fbf9a2B2e0e57C66F1aebADD7</li>
            <li>Nft 1: 0x233F7515005271FB96DBd2112B60160bA03fc4Ec</li>
            <li>Nft 1: 0x43a81C362ac267f053E9687FFCfcb22049636184</li>
            <li>Me     : 0x62882C892c580a109a51C71a7D644C42f63F5c26</li>
          </ul>
            ©2023 
            </Footer>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}

export default App
