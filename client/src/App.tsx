import { Layout, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AppSidebar } from './components/AppSidebar'
import { DEFAULT_ROUTE, navItems } from './navigation/navConfig'
import './App.css'

function App() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()

  const selectedMenuKey = navItems.some((item) => item.key === location.pathname) ? location.pathname : DEFAULT_ROUTE
  const activePageTitle = t(navItems.find((item) => item.key === selectedMenuKey)?.labelKey ?? 'common.page')

  return (
    <Layout className="app-shell app-dark">
      <AppSidebar selectedMenuKey={selectedMenuKey} onNavigate={(key) => void navigate(key)} />

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
