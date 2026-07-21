import { Polyline } from 'react-leaflet'

// ---------------------------------------------------
// POLYLINES DE LA RUTA
// En modo navegacion solo muestra el tramo actual
// ---------------------------------------------------

function RutaPolylines({ rutasSegmentosLocal, modoNavegacion, segmentoActual, color }) {

  return rutasSegmentosLocal

    .filter((_, index) => {

      if (!modoNavegacion) {
        return true
      }

      return index === segmentoActual

    })

    .map((leg, index) => {

      const coords = leg.steps.flatMap(
        step => step.geometry.coordinates
      )

      return (
        <Polyline
          key={index}
          positions={coords.map(([lon, lat]) => [lat, lon])}
          color={color || "#e63946"}
          weight={6}
          opacity={0.8}
        />
      )
    })
}

export default RutaPolylines
