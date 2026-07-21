import L from 'leaflet'
import userMarker from '../../assets/userMarker.png'

// ---------------------------------------------------
// ICONOS DE MARCADORES POR RUTA
// ---------------------------------------------------

export const marcadorUser = new L.Icon({
  iconUrl: userMarker,
  iconSize: [50, 50],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
  className: "user-marker-icon"
})

export function crearIconoRuta(color = "#e63946") {
  return new L.DivIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="32" height="48">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24S24 21 24 12C24 5.373 18.627 0 12 0z"
        fill="${color}" stroke="white" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="5" fill="white" opacity="0.85"/>
    </svg>`,
    className: "",
    iconSize: [32, 48],
    iconAnchor: [16, 48],
    popupAnchor: [0, -48],
  })
}

// ---------------------------------------------------
// CREAR ICONO CLUSTER
// ---------------------------------------------------

export const crearClusterPorRuta = (color) => (cluster) => {
  const cantidad = cluster.getChildCount()

  return L.divIcon({
    html: `
      <div class="cluster-ruta-dinamica" style="--cluster-color: ${color}">
        ${cantidad}
      </div>
    `,
    className: "",
    iconSize: L.point(40, 40, true)
  })
}

// ---------------------------------------------------
// CREA EL ICONO NUMERICO DE ORDEN
// ---------------------------------------------------

export function crearIconoNumero(numero) {
  return new L.DivIcon({
    html: `<div class="numero-marker">${numero}</div>`,
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  })
}
