import { DashboardOutlined, SettingOutlined, SwapOutlined, TagsOutlined, WalletOutlined } from '@ant-design/icons'
import type { ReactNode } from 'react'

export type NavSection = 'main' | 'bottom'

export type NavItem = {
  key: string
  label: string
  section: NavSection
  icon: ReactNode
}

export const navItems: NavItem[] = [
  {
    key: '/dashboard',
    label: 'Dashboard',
    section: 'main',
    icon: <DashboardOutlined />,
  },
  {
    key: '/accounts',
    label: 'Accounts',
    section: 'main',
    icon: <WalletOutlined />,
  },
  {
    key: '/categories',
    label: 'Categories',
    section: 'main',
    icon: <TagsOutlined />,
  },
  {
    key: '/transactions',
    label: 'Transactions',
    section: 'main',
    icon: <SwapOutlined />,
  },
  {
    key: '/settings',
    label: 'Settings',
    section: 'bottom',
    icon: <SettingOutlined />,
  },
]

export const DEFAULT_ROUTE = '/dashboard'
