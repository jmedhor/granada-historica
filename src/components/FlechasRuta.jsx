import { useEffect } from 'react'

import { useMap } from 'react-leaflet'

import L from 'leaflet'

import 'leaflet-polylinedecorator'

// ---------------------------------------------------
// FLECHAS DE DIRECCION SOBRE LA RUTA
// ---------------------------------------------------

function FlechasRuta({

  positions,
  color

}) {

  const map = useMap()

  useEffect(() => {

    // Seguridad
    if (!positions || positions.length === 0) {
      return
    }

    // Crea polyline auxiliar
    const polyline = L.polyline(positions)

    // Decorador de flechas
    const decorator = L.polylineDecorator(
      polyline,
      {
        patterns: [

          {
            offset: 25,

            repeat: 60,

            symbol: L.Symbol.arrowHead({

              pixelSize: 10,

              polygon: false,

              pathOptions: {

                stroke: true,

                color: color,

                weight: 3,

                opacity: 0.9

              }

            })
          }

        ]
      }
    )

    // Añade al mapa
    decorator.addTo(map)

    // Cleanup
    return () => {

      map.removeLayer(decorator)

    }

  }, [map, positions, color])

  return null
}

export default FlechasRuta
