import { Layout, Menu, Typography } from 'antd'
import type { MenuProps } from 'antd'
import { useTranslation } from 'react-i18next'
import logo from '../assets/logo.svg'
import { navItems } from '../navigation/navConfig'

const bottomMenuKeys = new Set(
  navItems.filter((item) => item.section === 'bottom').map((item) => item.key),
)

type AppSidebarProps = {
  selectedMenuKey: string
  onNavigate: (key: string) => void
}

export function AppSidebar({ selectedMenuKey, onNavigate }: AppSidebarProps) {
  const { t } = useTranslation()

  const mainMenuItems: MenuProps['items'] = navItems
    .filter((item) => item.section === 'main')
    .map(({ key, labelKey, icon }) => ({ key, label: t(labelKey), icon }))

  const bottomMenuItems: MenuProps['items'] = navItems
    .filter((item) => item.section === 'bottom')
    .map(({ key, labelKey, icon }) => ({ key, label: t(labelKey), icon }))

  return (
    <Layout.Sider width={260} className="app-sider" theme="dark">
      <div className="sider-inner">
        <div className="brand">
          <img className="brand-logo" src={logo} alt={t('brand.logoAlt')} />
          <Typography.Text className="brand-name">Pennywise</Typography.Text>
        </div>

        <Menu
          mode="inline"
          theme="dark"
          className="main-menu"
          items={mainMenuItems}
          selectedKeys={[selectedMenuKey]}
          onClick={({ key }) => onNavigate(key as string)}
        />

        <Menu
          mode="inline"
          theme="dark"
          className="main-menu sidebar-bottom-menu"
          items={bottomMenuItems}
          selectedKeys={bottomMenuKeys.has(selectedMenuKey) ? [selectedMenuKey] : []}
          onClick={({ key }) => onNavigate(key as string)}
        />
      </div>
    </Layout.Sider>
  )
}
