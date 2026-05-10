import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, Tooltip, useMap } from 'react-leaflet'
import { useEffect, useState, useRef } from 'react'
import { obtenerRutaHistorica, obtenerRutaOptima } from '../../services/osrm.js'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import MarkerClusterGroup from 'react-leaflet-cluster'

import PopupRuta from './Popup'
import gpsRed from '../assets/gps_red.png'
import gpsBlue from '../assets/gps_blue.png'
import gpsOrange from '../assets/gps_orange.png'
import gpsGreen from '../assets/gps_green.png'
import gpsPink from '../assets/gps_pink.png'
import gpsBlack from '../assets/gps_black.png'
import gpsPurple from '../assets/gps_purple.png'


// Iconos por ruta
const iconosRutas = {
  1: new L.Icon({ iconUrl: gpsRed, iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -40] }),
  2: new L.Icon({ iconUrl: gpsBlue, iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -40] }),
  3: new L.Icon({ iconUrl: gpsOrange, iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -40] }),
  4: new L.Icon({ iconUrl: gpsGreen, iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -40] }),
  5: new L.Icon({ iconUrl: gpsPink, iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -40] }),
  6: new L.Icon({ iconUrl: gpsBlack, iconSize: [30, 30], iconAnchor: [15, 30], popupAnchor: [0, -30] }),
  7: new L.Icon({ iconUrl: gpsPurple, iconSize: [30, 30], iconAnchor: [15, 30], popupAnchor: [0, -30] }),
}

const coloresRuta = {
  1: "#e63946", // rojo
  2: "#3a86ff", // azul
  3: "#f77f00", // naranja
  4: "#2a9d8f", // verde
  5: "#ff4d8d", // rosa
  6: "#222222", // negro
  7: "#8338ec", // morado
}

function crearIconoNumero(numero) {
  return new L.DivIcon({
    html: `<div class="numero-marker">${numero}</div>`,
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

function MapController({ setMapRef }) {
  const map = useMap()

  useEffect(() => {
    setMapRef(map)
  }, [map])

  return null
}

const createClusterCustomIcon = function (cluster) {
  const count = cluster.getChildCount()

  return L.divIcon({
    html: `
      <div class="cluster-wrapper">
        <div class="cluster-core">${count}</div>
      </div>
    `,
    className: 'custom-marker-cluster',
    iconSize: L.point(50, 50, true),
  })
}




function Mapa({ rutaSeleccionada, mapRef, modoHistoriador, setModoHistoriador, modoRuta, setRutasSegmentos, evitarPago, ordenPuntos, setOrdenPuntos, duracionRuta, setDuracionRuta, cargandoRuta, setCargandoRuta }) {

  const [todosPuntos, setTodosPuntos] = useState([])
  const [rutaLinea, setRutaLinea] = useState(null)
  const [userLocation, setUserLocation] = useState({
    lat: 37.1773,
    lon: -3.5986
  })
  const [rutasSegmentosLocal, setRutasSegmentosLocal] = useState([])
  const markersRef = useRef({})



  const centrarYAbrir = (punto) => {
    const marker = markersRef.current[punto.id]

    if (mapRef.current) {
      mapRef.current.flyTo(
        [punto.latitud, punto.longitud],
        16
      )
    }

    if (marker) {
      marker.openPopup()
    }
  }

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

  useEffect(() => {
    fetch("http://localhost:8000/puntos")
      .then(res => res.json())
      .then(data => setTodosPuntos(data))
      .catch(err => console.error(err))
  }, [])

  useEffect(() => {
    if (!rutaSeleccionada) {
      setRutasSegmentos([])
      setRutasSegmentosLocal([])
      setOrdenPuntos([])
      setDuracionRuta(null)

    }
  }, [rutaSeleccionada])

  let puntos = rutaSeleccionada
    ? todosPuntos.filter(p => p.ruta_id === rutaSeleccionada.id)
    : todosPuntos

  let puntosOrdenados =
    ordenPuntos.length > 0
      ? ordenPuntos
      : puntos

  const puntosVisibles = puntosOrdenados.filter(
    punto => !evitarPago || !punto.pago
  )

  useEffect(() => {
    const cargarRuta = async () => {
      if (!rutaSeleccionada || puntos.length === 0) return

      setCargandoRuta(true)

      try {
        let resultado

        if (modoRuta === "historica") {
          resultado = await obtenerRutaHistorica(puntos, userLocation, evitarPago)
        } else {
          resultado = await obtenerRutaOptima(puntos, userLocation, evitarPago)
        }

        setRutasSegmentos(resultado.legs)
        setRutasSegmentosLocal(resultado.legs)
        setOrdenPuntos(resultado.puntosOrdenados)

        // ------------------------------------
        // Duracion de ruta
        // ------------------------------------

        const segundosRuta = resultado.legs.reduce(
          (acc, leg) => acc + leg.duration,
          0
        )

        // 15 minutos por punto turistico aprox
        const segundosVisita =
          resultado.puntosOrdenados.length * 15 * 60

        const segundosTotales =
          segundosRuta + segundosVisita

        const horas = Math.floor(segundosTotales / 3600)
        const minutos = Math.floor((segundosTotales % 3600) / 60)

        let tiempoTexto = ""

        if (horas > 0) {
          tiempoTexto = `${horas} h ${minutos} min`
        } else {
          tiempoTexto = `${minutos} min`
        }

        setDuracionRuta(tiempoTexto)


      } catch (err) {
        console.error("Error cargando ruta:", err)
      } finally {
        setCargandoRuta(false)
      }
    }

    cargarRuta()
  }, [rutaSeleccionada, todosPuntos, modoRuta, userLocation, evitarPago])
  return (
    <MapContainer
      center={[37.1773, -3.5986]}
      zoom={15}
      style={{ height: "80vh", width: "80vw" }}
      whenCreated={(mapInstance) => {
        mapRef.current = mapInstance
      }}
    >
    <MapController setMapRef={(map) => {
      mapRef.current = map
      map.centrarYAbrir = centrarYAbrir
    }} />

    <MapaClickHandler />

      <TileLayer
        attribution='© OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {cargandoRuta && (
        <div className="loading-overlay">
          Cargando ruta...
        </div>
      )}

      {rutasSegmentosLocal.map((leg, index) => {
        const coords = leg.steps.flatMap(step =>
          step.geometry.coordinates
        )

        return (
          <Polyline
            key={index}
            positions={coords.map(([lon, lat]) => [lat, lon])}
            color={coloresRuta[rutaSeleccionada?.id] || "#e63946"}
            weight={6}
            opacity={0.8}
          />
        )
      })}

      <Marker position={[userLocation.lat, userLocation.lon]}>
        <Tooltip direction="top" offset={[0, -10]} permanent>
          📍 Inicio
        </Tooltip>
      </Marker>

      {!rutaSeleccionada && (
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={35}
          showCoverageOnHover={false}
          iconCreateFunction={createClusterCustomIcon}
        >
          {puntosOrdenados
            .filter(punto => !evitarPago || !punto.pago)
            .map(punto => (
              <Marker
                key={`${punto.id}-${punto.ruta_id}`}
                position={[punto.latitud, punto.longitud]}
                icon={iconosRutas[punto.ruta_id] || iconosRutas[1]}
                ref={(el) => {
                  if (el) markersRef.current[punto.id] = el
                }}
              >
                <Popup>
                  <PopupRuta
                    punto={punto}
                    ruta={{ nombre: punto.ruta_nombre }}
                    modoHistoriador={modoHistoriador}
                    setModoHistoriador={setModoHistoriador}
                  />
                </Popup>
              </Marker>
            ))}
        </MarkerClusterGroup>
      )}

      {/* CUANDO HAY RUTA → SIN CLUSTER */}
      {rutaSeleccionada && (
        puntosOrdenados
          .filter(punto => !evitarPago || !punto.pago)
          .map(punto => (
            <Marker
              key={`${punto.id}-${punto.ruta_id}`}
              position={[punto.latitud, punto.longitud]}
              icon={iconosRutas[punto.ruta_id] || iconosRutas[1]}
              ref={(el) => {
                if (el) markersRef.current[punto.id] = el
              }}
            >
              <Popup>
                <PopupRuta
                  punto={punto}
                  ruta={{ nombre: punto.ruta_nombre }}
                  modoHistoriador={modoHistoriador}
                  setModoHistoriador={setModoHistoriador}
                />
              </Popup>
            </Marker>
          ))
      )}


      {rutaSeleccionada && puntosVisibles.map((punto, index) => (
        <Marker
          key={`orden-${punto.id}`}
          position={[punto.latitud, punto.longitud]}
          icon={crearIconoNumero(index + 1)}
        />
      ))}


    </MapContainer>
  )
}

export default Mapa
