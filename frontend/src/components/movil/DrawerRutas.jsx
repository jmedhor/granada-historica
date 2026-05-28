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
          {ruta.nombre}
        </button>
      ))}

    </div>
  )
}

export default DrawerRutas
