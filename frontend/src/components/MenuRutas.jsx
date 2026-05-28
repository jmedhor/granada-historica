import { useEffect, useState } from "react"
import { coloresRuta } from '../utils/coloresRuta.js'
import { getRutas } from '../services/api.js'

function MenuRutas({
  rutaSeleccionada,
  setRutaSeleccionada,
  setModoCercanos
}) {

  // -----------------------------------------
  // Estado donde almacenamos todas las rutas
  // obtenidas desde el backend
  // -----------------------------------------

  const [rutas, setRutas] = useState([])

  // -----------------------------------------
  // Obtener rutas desde backend al cargar
  // el componente
  // -----------------------------------------

  useEffect(() => {
    getRutas()
      .then(data => {
        const rutasArray = Array.isArray(data) ? data : []

        setRutas(
          rutasArray.filter(ruta => ruta.activo === true)
        )
      })
      .catch(console.error)
  }, [])

  // -----------------------------------------
  // Render del menu lateral de rutas
  // -----------------------------------------

  return (
    <div className="menu-rutas">

      {/* Titulo del menu */}
      <h2>Rutas disponibles</h2>

      {/* Lista de rutas */}
      <ul>

        {rutas.map(ruta => (

          <li
            key={ruta.id}

            // Seleccionar ruta al hacer click
            onClick={() => {

              // Oculta panel de cercanos
              setModoCercanos(false)

              // Selecciona ruta
              setRutaSeleccionada(ruta)

            }}

            // Aplicar clase activa si la ruta
            // esta seleccionada actualmente
            className={
              rutaSeleccionada?.id === ruta.id
                ? "activa"
                : ""
            }

            style={{
              borderLeftColor: coloresRuta[ruta.id]
            }}
          >

            {/* Nombre de la ruta */}
            {ruta.nombre}

          </li>

        ))}

      </ul>

    </div>
  )
}

export default MenuRutas
