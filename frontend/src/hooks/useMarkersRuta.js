import { useRef, useState } from 'react'
import { crearIconoRuta } from '../utils/mapIcons.js'

// ---------------------------------------------------
// HELPERS DE MARKERS: clave compuesta punto+ruta
// Permite que el mismo punto tenga varios markers,
// uno por cada ruta a la que pertenezca
// ---------------------------------------------------

export function useMarkersRuta({ mapRef }) {

  // Referencias a markers para abrir popups
  const markersRef = useRef({})

  // Indicadores para ver el modo de popup actual
  // "ruta" | "info"
  const [modoPopup, setModoPopup] = useState("ruta")

  const claveMarker = (puntoId, rutaId) => `${puntoId}-${rutaId ?? "base"}`

  const buscarMarker = (puntoId, rutaId = null) => {
    if (rutaId != null) return markersRef.current[claveMarker(puntoId, rutaId)]
    const clave = Object.keys(markersRef.current).find(k => k.startsWith(`${puntoId}-`))
    return clave ? markersRef.current[clave] : null
  }

  // ---------------------------------------------------
  // HELPER: icono para un punto (usa color de su ruta)
  // ---------------------------------------------------

  const iconoPunto = (ruta) => crearIconoRuta(ruta?.color || "#383838")

  // ---------------------------------------------------
  // FUNCION PARA CENTRAR Y ABRIR POPUP
  // ---------------------------------------------------

  const centrarYAbrir = (punto, ruta = null) => {
    const marker = buscarMarker(punto.id, ruta?.id)
    if (mapRef.current) {
      mapRef.current.flyTo([punto.latitud, punto.longitud], 16)
    }
    if (marker) marker.openPopup()
  }

  // ---------------------------------------------------
  // FUNCION PARA ABRIR POPUPS Y VARIAR ENTRE MODOS
  // ---------------------------------------------------

  const abrirInformacion = (punto, ruta = null) => {
    setModoPopup("info")
    setTimeout(() => {
      const marker = buscarMarker(punto.id, ruta?.id)
      if (marker) { marker.closePopup(); marker.openPopup() }
    }, 0)
  }

  // ---------------------------------------------------
  // FUNCION PARA CERRAR POPUPS Y VARIAR ENTRE MODOS
  // ---------------------------------------------------

  const volverARuta = (punto, ruta = null) => {
    setModoPopup("ruta")
    setTimeout(() => {
      const marker = buscarMarker(punto.id, ruta?.id)
      if (marker) { marker.closePopup(); marker.openPopup() }
    }, 0)
  }

  return {
    markersRef,
    claveMarker,
    buscarMarker,
    iconoPunto,
    modoPopup,
    setModoPopup,
    centrarYAbrir,
    abrirInformacion,
    volverARuta,
  }
}
