import { useEffect, useState } from "react"

function MenuRutas({
  rutaSeleccionada,
  setRutaSeleccionada
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

    fetch("http://localhost:8000/rutas")
      .then(res => res.json())
      .then(data => setRutas(data))
      .catch(err => console.error(err))

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
            onClick={() => setRutaSeleccionada(ruta)}

            // Aplicar clase activa si la ruta
            // esta seleccionada actualmente
            className={
              rutaSeleccionada?.id === ruta.id
                ? "activa"
                : ""
            }
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
