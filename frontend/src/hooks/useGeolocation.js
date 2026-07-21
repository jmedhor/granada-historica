import { useState, useRef, useEffect } from 'react'
import { calcularDistanciaMetros } from '../utils/distancia.js'

// Umbral para no actualizar posición si el GPS varía muy poco (ruido)
const UMBRAL_POSICION_METROS = 5

// ---------------------------------------------------
// Obtiene y actualiza la posicion del usuario
// ---------------------------------------------------

export function useGeolocation({ setUserLocation, setGpsDenegado }) {

  // GPS activo: true si movil y no denegado por el usuario
  const [gpsActivo, setGpsActivo] = useState(
    window.innerWidth <= 768
  )

  // Umbral para no recalcular ruta si la localizacion gps cambia muy poco
  const lastRecalcLocationRef = useRef(null)

  useEffect(() => {

    if (!navigator.geolocation || !gpsActivo) return

    const watchId = navigator.geolocation.watchPosition(

        (pos) => {

          const nuevaPos = {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          }

          // Evita ruido GPS

          if (lastRecalcLocationRef.current) {

            const distancia =
              calcularDistanciaMetros(

                lastRecalcLocationRef.current.lat,
                lastRecalcLocationRef.current.lon,

                nuevaPos.lat,
                nuevaPos.lon
              )

            if (distancia < UMBRAL_POSICION_METROS) {
              return
            }
          }

          lastRecalcLocationRef.current = nuevaPos

          setUserLocation(nuevaPos)

        },

      (err) => {
        console.error("GPS error:", err)

        // --------------------------------
        // GPS DENEGADO → MODO MANUAL
        // --------------------------------
        if (err.code === err.PERMISSION_DENIED) {
          console.warn("[GPS] Permiso denegado, activando modo manual")
          setGpsActivo(false)
          setGpsDenegado(true)
        }
      },

      {
        enableHighAccuracy: true,
        maximumAge: 0
      }
    )

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }

  }, [gpsActivo])

  return { gpsActivo, setGpsActivo }
}
