import { useEffect, useState } from "react"
import { getRutas } from '../services/api.js'

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
            {ruta.nombre}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default MenuRutas
