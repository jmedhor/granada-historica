import { Marker } from 'react-leaflet'
import { crearIconoNumero } from '../../utils/mapIcons.js'

// ---------------------------------------------------
// NUMEROS DE ORDEN
// ---------------------------------------------------

function NumerosOrden({ puntosVisibles }) {

  return puntosVisibles.map((punto, index) => (
    <Marker
      key={`orden-${punto.id}`}
      position={[punto.latitud, punto.longitud]}
      icon={crearIconoNumero(index + 1)}
    />
  ))
}

export default NumerosOrden
