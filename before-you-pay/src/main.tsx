import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import '@fontsource-variable/inter'
import './index.css'
import MyChecks from './pages/MyChecks'
import NewCheck from './pages/NewCheck'
import Brief from './pages/Brief'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MyChecks />} />
        <Route path="/new" element={<NewCheck />} />
        <Route path="/check/:id" element={<Brief />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
