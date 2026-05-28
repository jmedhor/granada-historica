import { useEffect, useState } from 'react'
import { coloresRuta } from '../../utils/coloresRuta.js'
import { getRutas } from '../../services/api.js'

// ---------------------------------------------------
// DRAWER MOVIL - LISTA DE RUTAS
// Equivalente movil de MenuRutas
// Props:
//   setRutaSeleccionada - callback al seleccionar ruta
//   setModoCercanos     - resetea modo cercanos
//   onCerrar            - cierra el drawer
// ---------------------------------------------------

function PinIcono({ color }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="14" height="21" style={{ flexShrink: 0 }}>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24S24 21 24 12C24 5.373 18.627 0 12 0z"
        fill={color} stroke="white" strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="5" fill="white" opacity="0.85"/>
    </svg>
  )
}

function DrawerRutas({ setRutaSeleccionada, setModoCercanos, onCerrar }) {

  const [rutas, setRutas] = useState([])

  useEffect(() => {
    getRutas()
      .then(data =>
        setRutas(Array.isArray(data) ? data.filter(r => r.activo) : [])
      )
      .catch(console.error)
  }, [])

  return (
    <div className="menu-movil-seccion">

      {rutas.map(ruta => (
        <button
          key={ruta.id}
          className="menu-movil-btn"
          style={{
            borderLeftColor: ruta.color || "#e63946",
            borderLeftWidth: 4
          }}
          onClick={() => {
            setModoCercanos(false)
            setRutaSeleccionada(ruta)
          }}
        >
            <span className="paso-num" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none" }}>
              <PinIcono color={ruta.color || "#e63946"} />
            </span>
            {ruta.nombre}
        </button>
      ))}

    </div>
  )
}

export default DrawerRutas
