import { Layout, Menu, Typography } from 'antd'
import type { MenuProps } from 'antd'
import logo from './assets/logo.svg'
import './App.css'

import { DashboardOutlined, SettingOutlined, TagsOutlined, WalletOutlined } from '@ant-design/icons'

const mainMenuItems: MenuProps['items'] = [
  { key: 'dashboard', label: 'Dashboard', icon: <DashboardOutlined /> },
  { key: 'accounts', label: 'Accounts', icon: <WalletOutlined /> },
  { key: 'categories', label: 'Categories', icon: <TagsOutlined /> },
]

const bottomMenuItems: MenuProps['items'] = [
  { key: 'settings', label: 'Settings', icon: <SettingOutlined /> },
]

function App() {
  return (
    <Layout className="app-shell">
      <Layout.Sider width={260} className="app-sider" theme="dark">
        <div className="sider-inner">
          <div className="brand">
            <img className="brand-logo" src={logo} alt="Pennywise Logo" />
            <Typography.Text className="brand-name">Pennywise</Typography.Text>
          </div>

          <Menu
            mode="inline"
            theme="dark"
            className="main-menu"
            items={mainMenuItems}
            selectedKeys={['dashboard']}
          />

          <Menu
            mode="inline"
            theme="dark"
            className="main-menu sidebar-bottom-menu"
            items={bottomMenuItems}
            selectedKeys={[]}
          />
        </div>
      </Layout.Sider>

      <Layout>
        <Layout.Content className="dashboard-content">
          <Typography.Title level={2} className="dashboard-title">
            Dashboard
          </Typography.Title>
          <div className="dashboard-placeholder" />
        </Layout.Content>
      </Layout>
    </Layout>
  )
}

export default App
