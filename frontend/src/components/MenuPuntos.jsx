import { useEffect, useState } from "react"
import { coloresRuta } from "../utils/coloresRuta.js"
import { getPuntosDeRuta } from "../services/api.js"

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

    if (puntosRutaVirtual) {
      setPuntos(puntosRutaVirtual)
      return
    }

    getPuntosDeRuta(ruta.id)
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
  // Color de la ruta seleccionada
  // - Si es la ruta virtual "cercanos", no hay
  //   un color unico de ruta: cada punto usa
  //   el color de la primera ruta que tenga
  //   asignada (o gris por defecto si no tiene).
  // - Si es una ruta real, todos los puntos
  //   comparten el color de esa ruta.
  // -----------------------------------------
  const esCercanos = ruta.id === "cercanos"

  const colorPunto = (punto) =>
    esCercanos
      ? punto.rutas?.[0]?.color || "#383838"
      : ruta.color || "#e63946"

  // -----------------------------------------
  // Render del menu lateral de puntos
  // -----------------------------------------
  return (
    <div className="menu-puntos">

      {/* Nombre de la ruta */}
      <h3 style={{ color: esCercanos ? "#383838" : (ruta.color || "#e63946") }}>
        {ruta.nombre}
      </h3>

      {/* Lista de puntos */}
      <ul>
        {puntosOrdenados.map((punto, index) => {

          const rutaAsignada = esCercanos
            ? punto.rutas?.[0]
            : ruta

          return (
            <li
              key={punto.id}
              onClick={() => mapRef.current.centrarYAbrir(punto, rutaAsignada)}
              style={{ borderLeftColor: colorPunto(punto) }}
            >
              {/* Numero de orden de visita */}
              <span className="paso-num">
                {index + 1}
              </span>

              {/* Nombre del punto */}
              {punto.nombre}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default MenuPuntos
