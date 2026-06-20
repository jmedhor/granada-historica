import { useEffect, useState } from 'react'
import { coloresRuta } from '../../utils/coloresRuta.js'
import { getPuntosDeRuta } from '../../services/api.js'

// ---------------------------------------------------
// DRAWER MOVIL - LISTA DE PUNTOS DE UNA RUTA
// Equivalente movil de MenuPuntos
// Props:
//   ruta               - ruta seleccionada actualmente
//   mapRef             - referencia al mapa
//   evitarPago         - filtro de puntos de pago
//   ordenPuntos        - orden calculado por A*
//   puntosRutaVirtual  - puntos de ruta virtual (cercanos)
//   onCerrar           - cierra el drawer al seleccionar punto
// ---------------------------------------------------

function DrawerPuntos({
  ruta,
  mapRef,
  evitarPago,
  ordenPuntos,
  puntosRutaVirtual,
  onCerrar
}) {

  const [puntos, setPuntos] = useState([])

  // -----------------------------------------
  // Cargar puntos de la ruta
  // -----------------------------------------

  useEffect(() => {

    if (!ruta) return

    if (puntosRutaVirtual) {
      setPuntos(puntosRutaVirtual)
      return
    }

    getPuntosDeRuta(ruta.id)
      .then(data => setPuntos(data))
      .catch(console.error)

  }, [ruta])

  // -----------------------------------------
  // Aplicar filtros
  // -----------------------------------------

  const puntosFiltrados = evitarPago
    ? puntos.filter(p => !p.pago)
    : puntos

  const puntosFinales =
    ordenPuntos.length > 0
      ? ordenPuntos
      : puntosFiltrados

  // -----------------------------------------
  // Color de los puntos
  // - Si es la ruta virtual "cercanos", cada
  //   punto usa el color de la primera ruta
  //   que tenga asignada (o gris por defecto).
  // - Si es una ruta real, todos los puntos
  //   comparten el color de esa ruta.
  // -----------------------------------------

  const esCercanos = ruta.id === "cercanos"

  const colorPunto = (punto) =>
    esCercanos
      ? punto.rutas?.[0]?.color || "#383838"
      : ruta.color || "#e63946"

  // -----------------------------------------
  // Render
  // -----------------------------------------

  return (
    <>
      {puntosFinales.map((punto, index) => {

        const rutaAsignada = esCercanos
          ? punto.rutas?.[0]
          : ruta

        return (
          <button
            key={punto.id}
            className="menu-movil-btn"
            style={{
              borderLeftColor: colorPunto(punto),
              borderLeftWidth: 4
            }}
            onClick={() => {
              if (mapRef.current?.centrarYAbrir) {
                mapRef.current.centrarYAbrir(punto, rutaAsignada)
              }
              onCerrar()
            }}
          >
            <span style={{ opacity: 0.6, marginRight: 8, fontSize: 12 }}>
              {index + 1}.
            </span>
            {punto.nombre}
          </button>
        )
      })}
    </>
  )
}

export default DrawerPuntos
