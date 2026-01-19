import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// 1. IMPORTĂM BROWSER ROUTER
import { BrowserRouter } from 'react-router-dom';

// 2. IMPORTĂM OpenAPI PENTRU A PĂSTRA LOGIN-UL
import { OpenAPI } from "./api/generated/core/OpenAPI";

// --- FIX PENTRU LOGIN (Se execută imediat ce pornește site-ul) ---
const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
if (token) {
    OpenAPI.TOKEN = token;
    console.log("Token restaurat automat la pornire!");
}
// -----------------------------------------------------------------

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 3. ÎMPACHETĂM TOATĂ APLICAȚIA ÎN BROWSER ROUTER */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)