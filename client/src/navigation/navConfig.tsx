import { DashboardOutlined, SettingOutlined, SwapOutlined, TagsOutlined, WalletOutlined } from '@ant-design/icons'
import type { ReactNode } from 'react'

export type NavSection = 'main' | 'bottom'

export type NavItem = {
  key: string
  labelKey: string
  section: NavSection
  icon: ReactNode
}

export const navItems: NavItem[] = [
  {
    key: '/dashboard',
    labelKey: 'nav.dashboard',
    section: 'main',
    icon: <DashboardOutlined />,
  },
  {
    key: '/accounts',
    labelKey: 'nav.accounts',
    section: 'main',
    icon: <WalletOutlined />,
  },
  {
    key: '/categories',
    labelKey: 'nav.categories',
    section: 'main',
    icon: <TagsOutlined />,
  },
  {
    key: '/transactions',
    labelKey: 'nav.transactions',
    section: 'main',
    icon: <SwapOutlined />,
  },
  {
    key: '/settings',
    labelKey: 'nav.settings',
    section: 'bottom',
    icon: <SettingOutlined />,
  },
]

export const DEFAULT_ROUTE = '/dashboard'
