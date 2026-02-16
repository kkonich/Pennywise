export const designTokens = {
  fontSans: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",

  // Core
  colorBgApp: '#0f1724',
  colorSurface: 'rgba(255, 255, 255, 0.02)',
  colorSurfaceElevated: '#152235',
  colorBorder: 'rgba(130, 155, 196, 0.2)',
  colorAccent: '#16315f',
  colorAccentHover: '#132950',
  colorSidebarBorder: '#121D30',
  colorSidebarBg: '#0C131F',

  // Text
  colorText1: '#f1f5ff',
  colorText2: 'rgba(215, 226, 243, 0.85)',
  colorText3: 'rgba(142, 165, 199, 0.85)',
  colorTextDisabled: 'rgba(142, 165, 199, 0.45)',

  // Interaction
  colorBorderHover: 'rgba(142, 165, 199, 0.55)',
  colorFocusRing: 'rgba(142, 165, 199, 0.35)',
  colorHoverFill: 'rgba(255, 255, 255, 0.035)',

  // Table
  colorTableBorder: 'rgba(140, 168, 214, 0.2)',
  colorRowHover: 'rgba(255, 255, 255, 0.015)',

  // Domain
  colorAmount: '#f4e2d7',
  colorPositive: '#239e33',
  colorNegative: '#d33852',
  colorAlertErrorBg: 'rgba(211, 56, 82, 0.16)',
  colorAlertErrorBorder: 'rgba(211, 56, 82, 0.42)',
  colorAlertErrorIcon: '#ff788d',

  radiusControl: '10px',
  radiusCard: '12px',
} as const

const cssVariables: Record<string, string> = {
  '--font-sans': designTokens.fontSans,

  // Existing CSS var names mapped to the reduced token set.
  '--color-bg-app': designTokens.colorBgApp,
  '--color-text-primary': designTokens.colorText1,
  '--color-border-soft': designTokens.colorBorder,
  '--color-sidebar-border': designTokens.colorSidebarBorder,
  '--color-sidebar-bg': designTokens.colorSidebarBg,
  '--color-surface-soft': designTokens.colorSurface,
  '--color-surface-faint': designTokens.colorSurface,
  '--color-surface-elevated': designTokens.colorSurfaceElevated,
  '--color-border-dashed': designTokens.colorBorder,
  '--color-menu-active-bg': designTokens.colorAccent,
  '--color-menu-hover-bg': designTokens.colorAccentHover,
  '--color-menu-active-text': designTokens.colorText1,
  '--color-text-secondary': designTokens.colorText2,
  '--color-text-muted': designTokens.colorText3,
  '--color-text-disabled': designTokens.colorTextDisabled,
  '--color-control-bg': designTokens.colorSurface,
  '--color-control-bg-hover': designTokens.colorHoverFill,
  '--color-control-border': designTokens.colorBorder,
  '--color-control-border-hover': designTokens.colorBorderHover,
  '--color-focus-ring': designTokens.colorFocusRing,
  '--color-selected-bg': designTokens.colorAccent,
  '--color-selected-text': designTokens.colorText1,
  '--color-table-border': designTokens.colorTableBorder,
  '--color-table-row-hover': designTokens.colorRowHover,
  '--color-antd-text': designTokens.colorText2,
  '--color-antd-text-secondary': designTokens.colorText2,
  '--color-antd-text-muted': designTokens.colorText3,
  '--color-antd-soft-fill': designTokens.colorHoverFill,
  '--color-pagination-active-bg': designTokens.colorAccent,
  '--color-date-range-bg': designTokens.colorAccent,
  '--color-date-range-hover-bg': designTokens.colorHoverFill,
  '--color-transaction-amount': designTokens.colorAmount,
  '--color-transaction-amount-positive': designTokens.colorPositive,
  '--color-transaction-amount-negative': designTokens.colorNegative,
  '--color-alert-error-bg': designTokens.colorAlertErrorBg,
  '--color-alert-error-border': designTokens.colorAlertErrorBorder,
  '--color-alert-error-icon': designTokens.colorAlertErrorIcon,
  '--radius-control': designTokens.radiusControl,
  '--radius-card': designTokens.radiusCard,
}

export function applyDesignTokens(root: HTMLElement = document.documentElement): void {
  Object.entries(cssVariables).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
}
