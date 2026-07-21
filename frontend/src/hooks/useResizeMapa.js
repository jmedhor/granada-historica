import { useEffect } from 'react'

// ---------------------------------------------------
// REDIMENSIONA EL MAPA AL OCULTAR/MOSTRAR PANEL
// Leaflet no recalcula su tamaño automaticamente
// cuando el contenedor cambia de ancho via CSS
// ---------------------------------------------------

export function useResizeMapa({ mapRef, mostrarPanel }) {

  useEffect(() => {
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize()
      }
    }, 50)
  }, [mostrarPanel])

}
