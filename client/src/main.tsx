import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider } from 'antd'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import 'antd/dist/reset.css'
import App from './App.tsx'
import { DEFAULT_ROUTE } from './navigation/navConfig'
import { TransactionsPage } from './pages/TransactionsPage'
import { antdDarkTheme } from './theme/antdDarkTheme'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
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
  </StrictMode>,
)
