import { useEffect, useState } from "react"
import { coloresRuta } from "../utils/coloresRuta.js"

function MenuPuntos({
  ruta,
  mapRef,
  evitarPago,
  ordenPuntos,
  puntosRutaVirtual
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

    if(puntosRutaVirtual){
      setPuntos(puntosRutaVirtual)
      return
    }

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
      <h3
        style={{
          color: coloresRuta[ruta.id]
        }}
      >
        {ruta.nombre}
      </h3>
      {/* Lista de puntos */}
      <ul>

        {puntosOrdenados.map((punto, index) => (

          <li
            key={punto.id}

            onClick={() => mapRef.current.centrarYAbrir(punto)}

            style={{
              background: coloresRuta[punto.ruta_id],
              color: "white",
              borderRadius: "10px",
              marginBottom: "10px"
            }}
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
