import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMapEvents,
  Tooltip,
  useMap
} from 'react-leaflet'

import { useEffect, useState, useRef } from 'react'

import L from 'leaflet'

import 'leaflet/dist/leaflet.css'

import MarkerClusterGroup from 'react-leaflet-cluster'

import {
  obtenerRutaHistorica,
  obtenerRutaOptima
} from '../../services/osrm.js'

import PopupRuta from './Popup'

import gpsRed from '../assets/gps_red.png'
import gpsBlue from '../assets/gps_blue.png'
import gpsOrange from '../assets/gps_orange.png'
import gpsGreen from '../assets/gps_green.png'
import gpsPink from '../assets/gps_pink.png'
import gpsBlack from '../assets/gps_black.png'
import gpsPurple from '../assets/gps_purple.png'

// ---------------------------------------------------
// ICONOS DE MARCADORES POR RUTA
// ---------------------------------------------------

const iconosRutas = {

  1: new L.Icon({
    iconUrl: gpsRed,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  }),

  2: new L.Icon({
    iconUrl: gpsBlue,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  }),

  3: new L.Icon({
    iconUrl: gpsOrange,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  }),

  4: new L.Icon({
    iconUrl: gpsGreen,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  }),

  5: new L.Icon({
    iconUrl: gpsPink,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  }),

  6: new L.Icon({
    iconUrl: gpsBlack,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  }),

  7: new L.Icon({
    iconUrl: gpsPurple,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  })

}

// ---------------------------------------------------
// COLORES DE POLYLINES POR RUTA
// ---------------------------------------------------

const coloresRuta = {
  1: "#e63946",
  2: "#3a86ff",
  3: "#f77f00",
  4: "#2a9d8f",
  5: "#ff4d8d",
  6: "#222222",
  7: "#8338ec"
}


  // ---------------------------------------------------
  // FUNCIONES AUXILIARES
  // ---------------------------------------------------


// ---------------------------------------------------
// CREA EL ICONO NUMERICO DE ORDEN
// ---------------------------------------------------

function crearIconoNumero(numero) {

  return new L.DivIcon({

    html: `<div class="numero-marker">${numero}</div>`,

    className: "",

    iconSize: [28, 28],

    iconAnchor: [14, 14]

  })
}

// ---------------------------------------------------
// GUARDA LA REFERENCIA DEL MAPA
// ---------------------------------------------------

function MapController({ setMapRef }) {

  const map = useMap()

  useEffect(() => {
    setMapRef(map)
  }, [map])

  return null
}

// ---------------------------------------------------
// ICONO PERSONALIZADO DE CLUSTERS
// ---------------------------------------------------

function crearClusterCustomIcon(cluster) {

  const cantidad = cluster.getChildCount()

  return L.divIcon({

    html: `
      <div class="cluster-wrapper">
        <div class="cluster-core">${cantidad}</div>
      </div>
    `,

    className: 'custom-marker-cluster',

    iconSize: L.point(50, 50, true)

  })
}

// ---------------------------------------------------
// CALCULA EL TEXTO DE DURACION DE RUTA
// ---------------------------------------------------

function calcularDuracionRuta(legs, puntosOrdenados) {

  // Suma todos los segundos de trayecto
  const segundosRuta = legs.reduce(
    (acc, leg) => acc + leg.duration,
    0
  )

  // Tiempo aproximado de visita
  // 15 minutos por punto turistico
  const segundosVisita =
    puntosOrdenados.length * 15 * 60

  // Tiempo total
  const segundosTotales =
    segundosRuta + segundosVisita

  // Conversion a horas y minutos
  const horas = Math.floor(segundosTotales / 3600)

  const minutos = Math.floor(
    (segundosTotales % 3600) / 60
  )

  // Texto final
  if (horas > 0) {
    return `${horas} h ${minutos} min`
  }

  return `${minutos} min`
}

// ---------------------------------------------------
// COMPONENTE PRINCIPAL DEL MAPA
// ---------------------------------------------------

function Mapa({

  rutaSeleccionada,
  mapRef,

  modoHistoriador,
  setModoHistoriador,

  modoRuta,

  setRutasSegmentos,

  evitarPago,

  ordenPuntos,
  setOrdenPuntos,

  setDuracionRuta,

  cargandoRuta,
  setCargandoRuta

}) {

  // ---------------------------------------------------
  // ESTADOS
  // ---------------------------------------------------

  // Todos los puntos cargados desde backend
  const [todosPuntos, setTodosPuntos] = useState([])

  // Segmentos de la ruta mostrados en el mapa
  const [rutasSegmentosLocal, setRutasSegmentosLocal] = useState([])

  // Posicion inicial del usuario
  const [userLocation, setUserLocation] = useState({
    lat: 37.1773,
    lon: -3.5986
  })

  // Referencias a markers para abrir popups
  const markersRef = useRef({})

  // ---------------------------------------------------
  // FUNCION PARA CENTRAR Y ABRIR POPUP
  // ---------------------------------------------------

  const centrarYAbrir = (punto) => {

    const marker = markersRef.current[punto.id]

    // Centra el mapa
    if (mapRef.current) {

      mapRef.current.flyTo(
        [punto.latitud, punto.longitud],
        16
      )

    }

    // Abre popup automaticamente
    if (marker) {
      marker.openPopup()
    }
  }

  // ---------------------------------------------------
  // DETECTA CLICK EN EL MAPA
  // ---------------------------------------------------

  function MapaClickHandler() {

    useMapEvents({

      click(e) {

        setUserLocation({
          lat: e.latlng.lat,
          lon: e.latlng.lng
        })

      }

    })

    return null
  }

  // ---------------------------------------------------
  // CARGA TODOS LOS PUNTOS DESDE BACKEND
  // ---------------------------------------------------

  useEffect(() => {

    fetch("http://localhost:8000/puntos")

      .then(res => res.json())

      .then(data => setTodosPuntos(data))

      .catch(err => console.error(err))

  }, [])

  // ---------------------------------------------------
  // RESETEA DATOS CUANDO SE QUITA LA RUTA
  // ---------------------------------------------------

  useEffect(() => {

    if (!rutaSeleccionada) {

      setRutasSegmentos([])

      setRutasSegmentosLocal([])

      setOrdenPuntos([])

      setDuracionRuta(null)

    }

  }, [rutaSeleccionada])

  // ---------------------------------------------------
  // FILTRA LOS PUNTOS DE LA RUTA ACTUAL
  // ---------------------------------------------------

  const puntos = rutaSeleccionada
    ? todosPuntos.filter(
        p => p.ruta_id === rutaSeleccionada.id
      )
    : todosPuntos

  // ---------------------------------------------------
  // USA EL ORDEN CALCULADO SI EXISTE
  // ---------------------------------------------------

  const puntosOrdenados =
    ordenPuntos.length > 0
      ? ordenPuntos
      : puntos

  // ---------------------------------------------------
  // FILTRA PUNTOS DE PAGO SI ESTA ACTIVO
  // ---------------------------------------------------

  const puntosVisibles = puntosOrdenados.filter(

    punto => !evitarPago || !punto.pago

  )

  // ---------------------------------------------------
  // CARGA LA RUTA DESDE OSRM
  // ---------------------------------------------------

  useEffect(() => {

    const cargarRuta = async () => {

      // Seguridad
      if (!rutaSeleccionada || puntos.length === 0) {
        return
      }

      setCargandoRuta(true)

      try {

        let resultado

        // --------------------------------
        // RUTA HISTORICA
        // --------------------------------

        if (modoRuta === "historica") {

          resultado = await obtenerRutaHistorica(
            puntos,
            userLocation,
            evitarPago
          )

        }

        // --------------------------------
        // RUTA OPTIMA
        // --------------------------------

        else {

          resultado = await obtenerRutaOptima(
            puntos,
            userLocation,
            evitarPago
          )

        }

        // --------------------------------
        // GUARDA SEGMENTOS Y ORDEN
        // --------------------------------

        setRutasSegmentos(resultado.legs)

        setRutasSegmentosLocal(resultado.legs)

        setOrdenPuntos(resultado.puntosOrdenados)

        // --------------------------------
        // CALCULA DURACION APROXIMADA
        // --------------------------------

        const tiempoTexto = calcularDuracionRuta(
          resultado.legs,
          resultado.puntosOrdenados
        )

        setDuracionRuta(tiempoTexto)

      }

      catch (err) {

        console.error(
          "Error cargando ruta:",
          err
        )

      }

      finally {

        setCargandoRuta(false)

      }
    }

    cargarRuta()

  }, [
    rutaSeleccionada,
    todosPuntos,
    modoRuta,
    userLocation,
    evitarPago
  ])

  // ---------------------------------------------------
  // RENDER DEL MAPA
  // ---------------------------------------------------

  return (

    <MapContainer
      center={[37.1773, -3.5986]}
      zoom={15}
      style={{
        height: "80vh",
        width: "80vw"
      }}
      whenCreated={(mapInstance) => {
        mapRef.current = mapInstance
      }}
    >

      {/* GUARDA REFERENCIA DEL MAPA */}
      <MapController
        setMapRef={(map) => {

          mapRef.current = map

          map.centrarYAbrir = centrarYAbrir

        }}
      />

      {/* DETECCION DE CLICK */}
      <MapaClickHandler />

      {/* MAPA BASE */}
      <TileLayer
        attribution='© OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* LOADING */}
      {cargandoRuta && (

        <div className="loading-overlay">
          Cargando ruta...
        </div>

      )}

      {/* ------------------------------------------------ */}
      {/* POLYLINES DE LA RUTA */}
      {/* ------------------------------------------------ */}

      {rutasSegmentosLocal.map((leg, index) => {

        const coords = leg.steps.flatMap(
          step => step.geometry.coordinates
        )

        return (

          <Polyline
            key={index}
            positions={coords.map(
              ([lon, lat]) => [lat, lon]
            )}
            color={
              coloresRuta[rutaSeleccionada?.id]
              || "#e63946"
            }
            weight={6}
            opacity={0.8}
          />

        )
      })}

      {/* ------------------------------------------------ */}
      {/* MARKER DE INICIO */}
      {/* ------------------------------------------------ */}

      <Marker
        position={[
          userLocation.lat,
          userLocation.lon
        ]}
      >

        <Tooltip
          direction="top"
          offset={[0, -10]}
          permanent
        >
          📍 Inicio
        </Tooltip>

      </Marker>

      {/* ------------------------------------------------ */}
      {/* CLUSTERS CUANDO NO HAY RUTA */}
      {/* ------------------------------------------------ */}

      {!rutaSeleccionada && (

        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={35}
          showCoverageOnHover={false}
          iconCreateFunction={crearClusterCustomIcon}
        >

          {puntosOrdenados

            .filter(
              punto => !evitarPago || !punto.pago
            )

            .map(punto => (

              <Marker
                key={`${punto.id}-${punto.ruta_id}`}
                position={[
                  punto.latitud,
                  punto.longitud
                ]}
                icon={
                  iconosRutas[punto.ruta_id]
                  || iconosRutas[1]
                }
                ref={(el) => {

                  if (el) {
                    markersRef.current[punto.id] = el
                  }

                }}
              >

                <Popup>

                  <PopupRuta
                    punto={punto}
                    ruta={{
                      nombre: punto.ruta_nombre
                    }}
                    modoHistoriador={modoHistoriador}
                    setModoHistoriador={setModoHistoriador}
                  />

                </Popup>

              </Marker>

            ))}

        </MarkerClusterGroup>

      )}

      {/* ------------------------------------------------ */}
      {/* MARKERS CUANDO HAY RUTA */}
      {/* ------------------------------------------------ */}

      {rutaSeleccionada && (

        puntosOrdenados

          .filter(
            punto => !evitarPago || !punto.pago
          )

          .map(punto => (

            <Marker
              key={`${punto.id}-${punto.ruta_id}`}
              position={[
                punto.latitud,
                punto.longitud
              ]}
              icon={
                iconosRutas[punto.ruta_id]
                || iconosRutas[1]
              }
              ref={(el) => {

                if (el) {
                  markersRef.current[punto.id] = el
                }

              }}
            >

              <Popup>

                <PopupRuta
                  punto={punto}
                  ruta={{
                    nombre: punto.ruta_nombre
                  }}
                  modoHistoriador={modoHistoriador}
                  setModoHistoriador={setModoHistoriador}
                />

              </Popup>

            </Marker>

          ))

      )}

      {/* ------------------------------------------------ */}
      {/* NUMEROS DE ORDEN */}
      {/* ------------------------------------------------ */}

      {rutaSeleccionada && puntosVisibles.map(
        (punto, index) => (

          <Marker
            key={`orden-${punto.id}`}
            position={[
              punto.latitud,
              punto.longitud
            ]}
            icon={crearIconoNumero(index + 1)}
          />

        )
      )}

    </MapContainer>

  )
}

export default Mapa
