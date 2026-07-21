import { useMapEvents } from 'react-leaflet'

// ---------------------------------------------------
// DETECTA CLICK EN EL MAPA
// Si el GPS esta activo, ignora el click (la posicion
// viene del GPS, no del usuario tocando el mapa)
// Si el click es sobre un boton, tampoco actualiza
// ---------------------------------------------------

function MapaClickHandler({ gpsActivo, setUserLocation }) {

  useMapEvents({
    click(e) {
      if (gpsActivo) return
      const target = e.originalEvent?.target
      if (target && target.closest('button')) return
      setUserLocation({ lat: e.latlng.lat, lon: e.latlng.lng })
    }
  })

  return null
}

export default MapaClickHandler
