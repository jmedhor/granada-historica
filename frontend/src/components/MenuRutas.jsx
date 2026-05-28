import { useEffect, useState } from "react"
import { getRutas } from '../services/api.js'

function PinIcono({ color }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="16" height="24" style={{ flexShrink: 0 }}>
      <path
        d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24S24 21 24 12C24 5.373 18.627 0 12 0z"
        fill={color}
        stroke="white"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="12" r="5" fill="white" opacity="0.85" />
    </svg>
  )
}

function MenuRutas({
  rutaSeleccionada,
  setRutaSeleccionada,
  setModoCercanos
}) {
  const [rutas, setRutas] = useState([])

  useEffect(() => {
    getRutas()
      .then(data => {
        const rutasArray = Array.isArray(data) ? data : []
        setRutas(rutasArray.filter(ruta => ruta.activo === true))
      })
      .catch(console.error)
  }, [])

  return (
    <div className="menu-rutas">
      <h2>Rutas disponibles</h2>
      <ul>
        {rutas.map(ruta => (
          <li
            key={ruta.id}
            onClick={() => {
              setModoCercanos(false)
              setRutaSeleccionada(ruta)
            }}
            className={rutaSeleccionada?.id === ruta.id ? "activa" : ""}
            style={{ borderLeftColor: ruta.color || "#e63946" }}
          >
            <span className="paso-num" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none" }}>
              <PinIcono color={ruta.color || "#e63946"} />
            </span>
            {ruta.nombre}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default MenuRutas
