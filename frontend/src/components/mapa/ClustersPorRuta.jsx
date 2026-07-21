import MarkerClusterGroup from 'react-leaflet-cluster'
import MarkerPunto from './MarkerPunto.jsx'
import { crearClusterPorRuta } from '../../utils/mapIcons.js'

// ---------------------------------------------------
// CLUSTERS AGRUPADOS POR RUTA
// + CLUSTER PARA PUNTOS SIN RUTA ASIGNADA (nuevos)
// ---------------------------------------------------

function ClustersPorRuta({ puntosOrdenados, rutasUnicas, evitarPago, markerProps }) {

  return (
    <>
      {rutasUnicas.map((rutaId) => {

        const puntosDeRuta = puntosOrdenados.filter(
          p => p.rutas.some(r => r.id === rutaId) && (!evitarPago || !p.pago)
        )

        if (puntosDeRuta.length === 0) return null

        const rutaInfo = puntosDeRuta[0].rutas.find(r => r.id === rutaId)
        const colorRuta = rutaInfo?.color || "#383838"

        return (
          <MarkerClusterGroup
            key={rutaId}
            chunkedLoading
            maxClusterRadius={75}
            showCoverageOnHover={false}
            iconCreateFunction={crearClusterPorRuta(colorRuta)}
          >
            {puntosDeRuta.map(punto => {
              const ruta = punto.rutas.find(r => r.id === rutaId)
              return (
                <MarkerPunto
                  key={markerProps.claveMarker(punto.id, ruta?.id)}
                  punto={punto}
                  ruta={ruta}
                  {...markerProps}
                />
              )
            })}
          </MarkerClusterGroup>
        )
      })}

      {(() => {

        const puntosNuevos = puntosOrdenados.filter(
          p => p.rutas.length === 0 && (!evitarPago || !p.pago)
        )

        if (puntosNuevos.length === 0) return null

        return (
          <MarkerClusterGroup
            key="nuevos"
            chunkedLoading
            maxClusterRadius={75}
            showCoverageOnHover={false}
            iconCreateFunction={crearClusterPorRuta("#888888")}
          >
            {puntosNuevos.map(punto => (
              <MarkerPunto
                key={markerProps.claveMarker(punto.id, null)}
                punto={punto}
                {...markerProps}
              />
            ))}
          </MarkerClusterGroup>
        )

      })()}
    </>
  )
}

export default ClustersPorRuta
