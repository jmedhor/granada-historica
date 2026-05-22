import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import './index.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import App from './App.jsx'
import AdminPage from './pages/AdminPage.jsx'

// ---------------------------------------------------
// PUNTO DE ENTRADA - Configuracion de rutas
// / -> Aplicacion principal del mapa
// /admin -> Panel de administracion
// ---------------------------------------------------


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
