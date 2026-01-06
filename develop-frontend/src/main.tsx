import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// 🔗 OpenAPI config
import { OpenAPI } from './api/generated/core/OpenAPI'

OpenAPI.BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
OpenAPI.TOKEN = localStorage.getItem('token') ?? ''

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
