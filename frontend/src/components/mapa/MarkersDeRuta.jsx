import MarkerPunto from './MarkerPunto.jsx'

// ---------------------------------------------------
// MARKERS CUANDO HAY RUTA
// ---------------------------------------------------

  // --------------------------------
  // HELPER: obtiene la ruta "visual" del punto
  // - Si estamos en ruta "cercanos" (ruta virtual,
  //   no existe como tal en punto.rutas), usamos
  //   la primera ruta asignada al punto para pintarlo
  //   con su color correspondiente.
  // - En cualquier otro caso, buscamos la ruta real
  //   por id como hasta ahora.
  // --------------------------------

function MarkersDeRuta({ rutaSeleccionada, puntosOrdenados, evitarPago, todosPuntosPago, markerProps }) {

  const rutaDelPunto = (punto) =>
    rutaSeleccionada.id === "cercanos"
      ? punto.rutas?.[0]
      : punto.rutas.find(r => r.id === rutaSeleccionada.id)

  const listaPuntos = todosPuntosPago
    ? puntosOrdenados
    : puntosOrdenados.filter(punto => !evitarPago || !punto.pago)

  return listaPuntos.map(punto => {
    const ruta = rutaDelPunto(punto)
    return (
      <MarkerPunto
        key={markerProps.claveMarker(punto.id, ruta?.id)}
        punto={punto}
        ruta={ruta}
        {...markerProps}
      />
    )
  })
}

export default MarkersDeRuta
