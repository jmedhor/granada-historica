import { useEffect, useState } from "react"

function MenuPuntos({
  ruta,
  mapRef,
  evitarPago,
  ordenPuntos
}) {

  // -----------------------------------------
  // Estado donde almacenamos todos los puntos
  // de la ruta seleccionada
  // -----------------------------------------

  const [puntos, setPuntos] = useState([])

  // -----------------------------------------
  // Obtener puntos de la ruta desde backend
  // -----------------------------------------

  useEffect(() => {

    if (!ruta) return

    fetch(`http://localhost:8000/rutas/${ruta.id}/puntos`)
      .then(res => res.json())
      .then(data => setPuntos(data))
      .catch(err => console.error(err))

  }, [ruta])

  // -----------------------------------------
  // Filtrar puntos de pago si esta activado
  // el modo evitarPago
  // -----------------------------------------

  const puntosFiltrados = evitarPago
    ? puntos.filter(punto => !punto.pago)
    : puntos

  // -----------------------------------------
  // Si existe un orden calculado por OSRM
  // usamos ese orden
  // -----------------------------------------

  const puntosOrdenados =
    ordenPuntos.length > 0
      ? ordenPuntos
      : puntosFiltrados

  // -----------------------------------------
  // Render del menu lateral de puntos
  // -----------------------------------------

  return (
    <div className="menu-puntos">

      {/* Nombre de la ruta */}
      <h3>{ruta.nombre}</h3>

      {/* Lista de puntos */}
      <ul>

        {puntosOrdenados.map((punto, index) => (

          <li
            key={punto.id}

            // Centrar mapa y abrir popup del punto
            onClick={() => mapRef.current.centrarYAbrir(punto)}
          >

            {/* Numero de orden de visita */}
            <span className="paso-num">
              {index + 1}
            </span>

            {/* Nombre del punto */}
            {punto.nombre}

          </li>

        ))}

      </ul>

    </div>
  )
}

export default MenuPuntos
