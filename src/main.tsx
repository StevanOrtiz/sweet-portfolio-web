import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ContentProvider } from './lib/content'
import Home from './pages/Home'
import Admin from './pages/Admin'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ContentProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </ContentProvider>
  </StrictMode>,
)
