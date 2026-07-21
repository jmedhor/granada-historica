import MarkerPunto from './MarkerPunto.jsx'

// ---------------------------------------------------
// MARKERS NORMALES EN MODO CERCANOS
// ---------------------------------------------------

function MarkersCercanos({ puntosCercanos, evitarPago, markerProps }) {

  return puntosCercanos
    .filter(punto => !evitarPago || !punto.pago)
    .map(punto => (
      <MarkerPunto
        key={markerProps.claveMarker(punto.id, punto.rutas?.[0]?.id)}
        punto={punto}
        ruta={punto.rutas?.[0]}
        {...markerProps}
      />
    ))
}

export default MarkersCercanos
