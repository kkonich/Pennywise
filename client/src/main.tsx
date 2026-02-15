import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider } from 'antd'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import 'dayjs/locale/de'
import 'dayjs/locale/en'
import deDE from 'antd/locale/de_DE'
import enUS from 'antd/locale/en_US'
import 'antd/dist/reset.css'
import './i18n'
import App from './App.tsx'
import { DEFAULT_ROUTE } from './navigation/navConfig'
import { TransactionsPage } from './pages/TransactionsPage'
import { antdDarkTheme } from './theme/antdDarkTheme'
import { applyDesignTokens } from './theme/designTokensDark.ts'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

applyDesignTokens()

function AppProviders() {
  const { i18n } = useTranslation()
  const isGerman = i18n.resolvedLanguage === 'de'

  dayjs.locale(isGerman ? 'de' : 'en')

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        locale={isGerman ? deDE : enUS}
        theme={antdDarkTheme}
        pagination={{ style: { display: 'flex', justifyContent: 'flex-end', marginTop: 16 } }}
      >
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />}>
              <Route index element={<Navigate to={DEFAULT_ROUTE} replace />} />
              <Route path="dashboard" element={<></>} />
              <Route path="accounts" element={<></>} />
              <Route path="categories" element={<></>} />
              <Route path="transactions" element={<TransactionsPage />} />
              <Route path="settings" element={<></>} />
              <Route path="*" element={<Navigate to={DEFAULT_ROUTE} replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ConfigProvider>
    </QueryClientProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders />
  </StrictMode>,
)
