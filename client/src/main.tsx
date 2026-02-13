import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import 'antd/dist/reset.css'
import './index.css'
import App from './App.tsx'
import { DEFAULT_ROUTE } from './navigation/navConfig'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Navigate to={DEFAULT_ROUTE} replace />} />
          <Route path="dashboard" element={<></>} />
          <Route path="accounts" element={<></>} />
          <Route path="categories" element={<></>} />
          <Route path="settings" element={<></>} />
          <Route path="*" element={<Navigate to={DEFAULT_ROUTE} replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
