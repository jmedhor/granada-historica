import { useState, useRef, useEffect } from 'react'
import { calcularDistanciaMetros } from '../utils/distancia.js'

// Umbral para recalcular rutas
const UMBRAL_RUTA_METROS = 15

// ---------------------------------------------------
// Debounce de userLocation para disparar recalculos
// de ruta (OSRM) solo cuando el movimiento supera
// el umbral definido, evitando llamadas excesivas
// ---------------------------------------------------

export function useUserLocationRuta(userLocation) {

  // User location basado en watchposition
  const [userLocationRuta, setUserLocationRuta] = useState(userLocation)

  const lastRouteLocationRef = useRef(null)

  useEffect(() => {

    if (!userLocation) return

    if (!lastRouteLocationRef.current) {

      lastRouteLocationRef.current = userLocation
      setUserLocationRuta(userLocation)

      return
    }

    const distancia =
      calcularDistanciaMetros(

        lastRouteLocationRef.current.lat,
        lastRouteLocationRef.current.lon,

        userLocation.lat,
        userLocation.lon
      )

    if (distancia >= UMBRAL_RUTA_METROS) {

      console.log(`[RUTA] Recálculo de ruta disparado: ${distancia.toFixed(1)}m (umbral ruta: ${UMBRAL_RUTA_METROS}m)`)
      lastRouteLocationRef.current = userLocation

      setUserLocationRuta(userLocation)

      } else {
        console.log(`[RUTA] Recálculo omitido: solo ${distancia.toFixed(1)}m (umbral ruta: ${UMBRAL_RUTA_METROS}m)`)
      }

  }, [userLocation])

  return userLocationRuta
}
