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

import 'leaflet-polylinedecorator'

import {
  obtenerRutaHistorica,
  obtenerRutaOptima
} from '../services/osrm.js'

import {
  calcularDistanciaMetros
} from '../utils/distancia.js'

import FlechasRuta from './FlechasRuta.jsx'

import PopupRuta from './Popup'

import { coloresRuta } from '../utils/coloresRuta.js'

import gpsRed from '../../assets/gps_red.png'
import gpsBlue from '../../assets/gps_blue.png'
import gpsOrange from '../../assets/gps_orange.png'
import gpsGreen from '../../assets/gps_green.png'
import gpsPink from '../../assets/gps_pink.png'
import gpsBlack from '../../assets/gps_black.png'
import gpsPurple from '../../assets/gps_purple.png'
import userMarker from '../../assets/userMarker.png'


// ---------------------------------------------------
// ICONOS DE MARCADORES POR RUTA
// ---------------------------------------------------


const marcadorUser = new L.Icon({
  iconUrl: userMarker,
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35]
})

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
  // FUNCIONES AUXILIARES
  // ---------------------------------------------------



// ---------------------------------------------------
// CREAR ICONO CLUSTER
// ---------------------------------------------------

const crearClusterPorRuta = (colorClass) => (cluster) => {
  const cantidad = cluster.getChildCount()

  return L.divIcon({
    html: `
      <div class="cluster-wrapper ${colorClass}">
        <div class="cluster-core">${cantidad}</div>
      </div>
    `,
    className: "",
    iconSize: L.point(50, 50, true)
  })
}

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
// ICONO PERSONALIZADO DE CLUSTERS (DEPRECATED)
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
// CALCULA TIEMPO TOTAL DE RUTA EN SEGUNDOS
// ---------------------------------------------------

function calcularTiempoTotalRuta(legs, puntosOrdenados) {

  // --------------------------------
  // SEGUNDOS DE TRAYECTO (OSRM)
  // --------------------------------

  const segundosTrayecto = legs.reduce(
    (acc, leg) => acc + leg.duration,
    0
  )

  // --------------------------------
  // SEGUNDOS DE VISITA (15 MIN POR PUNTO)
  // --------------------------------

  const segundosVisita =
    puntosOrdenados.length * 15 * 60

  // --------------------------------
  // TOTAL
  // --------------------------------

  return segundosTrayecto + segundosVisita
}

// ---------------------------------------------------
// FILTRA PUNTOS SEGUN TIEMPO DISPONIBLE
// ---------------------------------------------------

function filtrarPuntosPorTiempo(
  puntosOrdenados,
  legs,
  horasDisponibles
) {

  const maxSegundos = horasDisponibles * 3600

  let acumulado = 0
  const resultado = []

  // --------------------------------
  // RECORRER PUNTOS EN ORDEN
  // --------------------------------

  for (let i = 0; i < puntosOrdenados.length; i++) {

    const punto = puntosOrdenados[i]

    // --------------------------------
    // TIEMPO VISITA (15 MIN)
    // --------------------------------

    acumulado += 15 * 60

    // --------------------------------
    // TIEMPO TRAYECTO
    // --------------------------------

    if (legs[i]) {
      acumulado += legs[i].duration
    }

    // --------------------------------
    // SI SUPERA TIEMPO -> STOP
    // --------------------------------

    if (acumulado > maxSegundos) {
      break
    }

    resultado.push(punto)
  }

  return resultado
}

// ---------------------------------------------------
// COMPONENTE PRINCIPAL DEL MAPA
// ---------------------------------------------------

function Mapa({

  rutaSeleccionada,
  setRutaSeleccionada,
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
  setCargandoRuta,

  puntosCercanos,
  setPuntosCercanos,

  modoCercanos,
  setModoCercanos,

  modoNavegacion,
  segmentoActual,

  mostrarPanel,

  usarFiltroTiempo,
  horasDisponibles


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

  // Datos bases para ruta dinamica por puntos cercanos
  const [rutaCercanosBase, setRutaCercanosBase] = useState(null)

  // Mensaje para cuando no hay tiempo para hacer la ruta
  const [mensajeTiempo, setMensajeTiempo] = useState(null)

  // Referencias a markers para abrir popups
  const markersRef = useRef({})

  // Referencia a userLocation actualizada en todo momento
  const userLocationRef = useRef(userLocation)

  useEffect(() => {
    userLocationRef.current = userLocation
  }, [userLocation])





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
  // CREA RUTA DINAMICA DESDE PUNTOS CERCANOS
  // TODO HACER QUE AFECTEN LOS FILTROS
  // ---------------------------------------------------

  const crearRutaDesdePuntosCercanos = async (puntosSeleccionados) => {

    // Seguridad
    if (!puntosSeleccionados || puntosSeleccionados.length === 0) return

    setCargandoRuta(true)

    // --------------------------------
    // SOLO RUTA OPTIMA
    // --------------------------------

    try{

      let resultado = await obtenerRutaOptima(
        puntosSeleccionados,
        userLocationRef.current,
        evitarPago
      )

      setRutaCercanosBase(resultado)

      // ---------------------------------------------------
      // APLICAR FILTRO DE TIEMPO (SI ESTA ACTIVO)
      // ---------------------------------------------------

      let puntosFinales = resultado.puntosOrdenados
      let legsFinales = resultado.legs

      if (usarFiltroTiempo) {

        let resultadoT

        puntosFinales = filtrarPuntosPorTiempo(
          resultado.puntosOrdenados,
          resultado.legs,
          horasDisponibles
        )

        // --------------------------------
        // NO HAY TIEMPO PARA NINGUN PUNTO
        // --------------------------------

        if (puntosFinales.length === 0) {

          setMensajeTiempo(
            "No dispones de tiempo suficiente para realizar esta ruta."
          )

          setOrdenPuntos([])
          setRutasSegmentos([])
          setRutasSegmentosLocal([])
          setDuracionRuta(null)

          return
        }

        // --------------------------------
        // LIMPIAR MENSAJE SI TODO OK
        // --------------------------------

        setMensajeTiempo(null)

        resultadoT = await obtenerRutaOptima(
          puntosFinales,
          userLocationRef.current,
          evitarPago
        )

        legsFinales = resultadoT.legs

      }

      // ---------------------------------------------------
      // GUARDAR RESULTADO FINAL
      // ---------------------------------------------------

      setOrdenPuntos(puntosFinales)
      setRutasSegmentos(legsFinales)
      setRutasSegmentosLocal(legsFinales)


      // --------------------------------
      // CALCULAR DURACION
      // --------------------------------

      const tiempoTexto = calcularDuracionRuta(
        legsFinales,
        puntosFinales
      )

      setDuracionRuta(tiempoTexto)

      // --------------------------------
      // ACTIVA RUTA VIRTUAL DE CERCANOS
      // --------------------------------

      setRutaSeleccionada({
        id: "cercanos",
        nombre: "Ruta de puntos cercanos"
      })

      setModoCercanos(false)

    }

    catch (err) {

      console.error(
        "Error creando ruta desde puntos cercanos:",
        err
      )

    }

    finally {

      setCargandoRuta(false)

    }
  }

  // ---------------------------------------------------
  // BUSCA PUNTOS CERCANOS AL USUARIO
  // ---------------------------------------------------

  const buscarPuntosCercanos = () => {

    // Radio maximo
    const RADIO_METROS = 350

    // Filtra puntos cercanos
    const cercanos = todosPuntos.filter(

      (punto) => {

      // Filtro de puntos de pago

      if (evitarPago && punto.pago) {
        return false
      }


        const distancia =
          calcularDistanciaMetros(

            userLocation.lat,
            userLocation.lon,

            punto.latitud,
            punto.longitud
          )

        return distancia <= RADIO_METROS
      }

    )

    // Guarda resultado
    setPuntosCercanos(cercanos)

    // Activa panel
    setModoCercanos(true)

    // Centra mapa
    if (mapRef.current) {

      mapRef.current.flyTo(
        [
          userLocation.lat,
          userLocation.lon
        ],
        14
      )

    }
  }

  // ---------------------------------------------------
  // RECALCULA PUNTOS CERCANOS AL MOVER userLocation
  // ---------------------------------------------------


  useEffect(() => {

    if (!modoCercanos) return
    if (todosPuntos.length === 0) return

    const RADIO_METROS = 350

    const cercanos = todosPuntos.filter((punto) => {

      // Filtra puntos de pago
      if (evitarPago && punto.pago) {
        return false
      }

      const distancia = calcularDistanciaMetros(
        userLocation.lat,
        userLocation.lon,
        punto.latitud,
        punto.longitud
      )

      return distancia <= RADIO_METROS
    })

    setPuntosCercanos(cercanos)

  }, [userLocation, todosPuntos, modoCercanos, evitarPago])


  // ---------------------------------------------------
  // LIMPIA MENSAJE DE TIEMPO
  // ---------------------------------------------------

  useEffect(() => {

    // Si no hay ruta seleccionada
    // o el filtro esta desactivado
    if (!rutaSeleccionada || !usarFiltroTiempo) {

      setMensajeTiempo(null)

    }

  }, [rutaSeleccionada, usarFiltroTiempo])

  // ---------------------------------------------------
  // REDIMENSIONA EL MAPA AL OCULTAR/MOSTRAR PANEL
  // ---------------------------------------------------

  useEffect(() => {
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize()
      }
    }, 50)
  }, [mostrarPanel])

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

      .then(data => {

        const puntosActivos = data.filter(

          punto =>

            punto.activo === true &&
            punto.ruta_activa === true

        )

        setTodosPuntos(puntosActivos)

      })

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
        p =>
          p.ruta_id === rutaSeleccionada.id &&
          p.activo === true
      )
    : todosPuntos.filter(
        p => p.activo === true
      )

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
            userLocationRef.current,
            evitarPago
          )

        }

        // --------------------------------
        // RUTA OPTIMA
        // --------------------------------

        else {

          resultado = await obtenerRutaOptima(
            puntos,
            userLocationRef.current,
            evitarPago
          )

        }

        // ---------------------------------------------------
        // APLICAR FILTRO DE TIEMPO (SI ESTA ACTIVO)
        // ---------------------------------------------------

        let puntosFinales = resultado.puntosOrdenados
        let legsFinales = resultado.legs

        if (usarFiltroTiempo) {

          puntosFinales = filtrarPuntosPorTiempo(
            resultado.puntosOrdenados,
            resultado.legs,
            horasDisponibles
          )

          // --------------------------------
          // NO HAY TIEMPO PARA NINGUN PUNTO
          // --------------------------------

          if (puntosFinales.length === 0) {

            setMensajeTiempo(
              "No dispones de tiempo suficiente para realizar esta ruta."
            )

            setOrdenPuntos([])
            setRutasSegmentos([])
            setRutasSegmentosLocal([])
            setDuracionRuta(null)

            return
          }

          // --------------------------------
          // LIMPIAR MENSAJE SI TODO OK
          // --------------------------------

          setMensajeTiempo(null)

          let resultadoT

          if (modoRuta === "historica" ) {

            resultadoT = await obtenerRutaHistorica(
              puntosFinales,
              userLocationRef.current,
              evitarPago
            )

          }
          else {

            resultadoT = await obtenerRutaOptima(
              puntosFinales,
              userLocationRef.current,
              evitarPago
            )

          }

          legsFinales = resultadoT.legs

        }

        // ---------------------------------------------------
        // GUARDAR RESULTADO FINAL
        // ---------------------------------------------------

        setOrdenPuntos(puntosFinales)
        setRutasSegmentos(legsFinales)
        setRutasSegmentosLocal(legsFinales)

        // --------------------------------
        // CALCULA DURACION APROXIMADA
        // --------------------------------

        const tiempoTexto = calcularDuracionRuta(
          legsFinales,
          puntosFinales
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
    evitarPago,
    usarFiltroTiempo,
    horasDisponibles,
  ])

  // ---------------------------------------------------
  // CENTRA EL MAPA EN EL SIGUIENTE PUNTO
  // DURANTE LA NAVEGACION
  // ---------------------------------------------------

  useEffect(() => {

    // Seguridad
    if (!modoNavegacion) return

    // Punto destino del tramo actual
    const siguientePunto =
      puntosVisibles[segmentoActual]

    if (!siguientePunto) return

    // Centra mapa
    mapRef.current.flyTo(

      [
        siguientePunto.latitud,
        siguientePunto.longitud
      ],

      17,

      {
        duration: 1.2
      }

    )

  }, [

    modoNavegacion,
    segmentoActual,
    puntosVisibles

  ])

  // ---------------------------------------------------
  // RENDER DEL MAPA
  // ---------------------------------------------------

  return (

    <MapContainer
      center={[37.1773, -3.5986]}
      zoom={15}
      style={{
        height: "100%",
        width: "100%"
      }}
      whenCreated={(mapInstance) => {
        mapRef.current = mapInstance
      }}
    >

      {/* GUARDA REFERENCIA DEL MAPA */}
      <MapController
        setMapRef={(map) => {

          mapRef.current = map

          // --------------------------------
          // FUNCIONES GLOBALES DEL MAPA
          // --------------------------------

          map.centrarYAbrir = centrarYAbrir

          map.crearRutaDesdeCercanos =
            crearRutaDesdePuntosCercanos

        }}
      />

      {/* DETECCION DE CLICK */}
      <MapaClickHandler />

      {/* MAPA BASE */}
      <TileLayer
        attribution='© OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />


      {/* MENSAJE DE TIEMPO */}
      {mensajeTiempo && (

        <div className="mensaje-tiempo">
          ⏰ {mensajeTiempo}
        </div>

      )}

      {/* LOADING */}
      {cargandoRuta && (

        <div className="loading-overlay">
          Cargando ruta...
        </div>

      )}



      {/* ------------------------------------------------ */}
      {/* BOTON PUNTOS CERCANOS */}
      {/* ------------------------------------------------ */}

      {!modoCercanos && !rutaSeleccionada && (

        <button
          className="btn-cercanos"
          onClick={buscarPuntosCercanos}
        >
          📍 Ver puntos cercanos a mi
        </button>

      )}

      {/* ------------------------------------------------ */}
      {/* POLYLINES DE LA RUTA */}
      {/* ------------------------------------------------ */}

      {rutasSegmentosLocal

        .filter((_, index) => {

          // --------------------------------
          // MODO NORMAL
          // --------------------------------

          if (!modoNavegacion) {
            return true
          }

          // --------------------------------
          // MODO NAVEGACION
          // SOLO MUESTRA EL TRAMO ACTUAL
          // --------------------------------

          return index === segmentoActual

        })

        .map((leg, index) => {
          const coords = leg.steps.flatMap(
          step => step.geometry.coordinates
        )

        return (

          <>

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

            <FlechasRuta
              positions={coords.map(
                ([lon, lat]) => [lat, lon]
              )}
              color={
                coloresRuta[rutaSeleccionada?.id]
                || "#e63946"
              }
            />

          </>

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
        icon={marcadorUser}
      >

      </Marker>

      {/* ------------------------------------------------ */}
      {/* CLUSTERS AGRUPADOS POR RUTA */}
      {/* ------------------------------------------------ */}

      {!rutaSeleccionada && !modoCercanos &&
        Object.keys(iconosRutas).map((rutaId) => {

          const id = Number(rutaId)

          const puntosDeRuta = puntosOrdenados.filter(
            p =>
              p.ruta_id === id &&
              (!evitarPago || !p.pago)
          )

          if (puntosDeRuta.length === 0) return null

          const colorClass = `cluster-ruta-${id}`

          return (
            <MarkerClusterGroup
              key={id}
              chunkedLoading
              maxClusterRadius={75}
              showCoverageOnHover={false}
              iconCreateFunction={crearClusterPorRuta(colorClass)}
            >
              {puntosDeRuta.map(punto => (
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
                      ruta={{
                        id: punto.ruta_id,
                        nombre: punto.ruta_nombre
                      }}
                      modoHistoriador={modoHistoriador}
                      setModoHistoriador={setModoHistoriador}
                      rutaSeleccionada={rutaSeleccionada}
                      setRutaSeleccionada={setRutaSeleccionada}
                    />
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          )
        })
      }

      {/* ------------------------------------------------ */}
      {/* MARKERS NORMALES EN MODO CERCANOS */}
      {/* ------------------------------------------------ */}

      {!rutaSeleccionada && modoCercanos && (

        puntosCercanos

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
                    id: punto.ruta_id,
                    nombre: punto.ruta_nombre
                  }}
                  modoHistoriador={modoHistoriador}
                  setModoHistoriador={setModoHistoriador}
                  rutaSeleccionada={rutaSeleccionada}
                  setRutaSeleccionada={setRutaSeleccionada}
                />

              </Popup>

            </Marker>

          ))

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
                    id: punto.ruta_id,
                    nombre: punto.ruta_nombre
                  }}
                  modoHistoriador={modoHistoriador}
                  setModoHistoriador={setModoHistoriador}
                  rutaSeleccionada={rutaSeleccionada}
                  setRutaSeleccionada={setRutaSeleccionada}
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
