import { Layout, Menu, Typography } from 'antd'
import type { MenuProps } from 'antd'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import logo from './assets/logo.svg'
import { DEFAULT_ROUTE, navItems } from './navigation/navConfig'
import './App.css'

const mainMenuItems: MenuProps['items'] = navItems
  .filter((item) => item.section === 'main')
  .map(({ key, label, icon }) => ({ key, label, icon }))

const bottomMenuItems: MenuProps['items'] = navItems
  .filter((item) => item.section === 'bottom')
  .map(({ key, label, icon }) => ({ key, label, icon }))

const bottomMenuKeys = new Set(
  navItems.filter((item) => item.section === 'bottom').map((item) => item.key),
)

function App() {
  const location = useLocation()
  const navigate = useNavigate()

  const selectedMenuKey = navItems.some((item) => item.key === location.pathname) ? location.pathname : DEFAULT_ROUTE
  const activePageTitle = navItems.find((item) => item.key === selectedMenuKey)?.label ?? 'Page'

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
            selectedKeys={[selectedMenuKey]}
            onClick={({ key }) => void navigate(key as string)}
          />

          <Menu
            mode="inline"
            theme="dark"
            className="main-menu sidebar-bottom-menu"
            items={bottomMenuItems}
            selectedKeys={bottomMenuKeys.has(selectedMenuKey) ? [selectedMenuKey] : []}
            onClick={({ key }) => void navigate(key as string)}
          />
        </div>
      </Layout.Sider>

      <Layout>
        <Layout.Content className="page-content">
          <Typography.Title level={2} className="page-title">
            {activePageTitle}
          </Typography.Title>
          <div className="page-placeholder">
            <Outlet />
          </div>
        </Layout.Content>
      </Layout>
    </Layout>
  )
}

export default App
