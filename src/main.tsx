import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ContentProvider } from './lib/content'
import { adminEnabled } from './lib/repo'
import Home from './pages/Home'
import './index.css'

const Admin = lazy(() => import('./pages/Admin'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ContentProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          {adminEnabled && <Route path="/admin" element={<Suspense fallback={null}><Admin /></Suspense>} />}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ContentProvider>
  </StrictMode>,
)
