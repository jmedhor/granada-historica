import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMapEvents,
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

import { getTodosPuntos } from '../services/api.js'


import PopupRuta from './Popup'

import { coloresRuta } from '../utils/coloresRuta.js'

import PopupInformacion from './PopupInformacion.jsx'

import gpsRed from '../../assets/gps_red.png'
import gpsBlue from '../../assets/gps_blue.png'
import gpsOrange from '../../assets/gps_orange.png'
import gpsGreen from '../../assets/gps_green.png'
import gpsPink from '../../assets/gps_pink.png'
import gpsBlack from '../../assets/gps_black.png'
import gpsPurple from '../../assets/gps_purple.png'
import gpsNuevos from '../../assets/nuevos.png'
import userMarker from '../../assets/userMarker.png'


// ---------------------------------------------------
// ICONOS DE MARCADORES POR RUTA
// ---------------------------------------------------


const marcadorUser = new L.Icon({
  iconUrl: userMarker,
  iconSize: [50, 50],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
  className: "user-marker-icon"
})

// Para puntos creados desde el panel admin

const iconosNuevos = new L.Icon({
  iconUrl: gpsNuevos,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
})

// Para puntos ya asignados alguna de las 7 rutas principales de Nazaroute

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
// CALCULA EL TEXTO DE DURACION DE RUTA
// ---------------------------------------------------

  // ---------------------------------
  // Tiempo aproximado de visita
  // Se obtiene el tiempo aproximado de cada punto
  // desde la BD
  //
  // Aquellas que no tienen tiempo asignado se dejan en
  // 15 minutos por punto turistico
  // ------------------------------

function calcularDuracionRuta(legs, puntosOrdenados) {

  // ---------------------------------
  // TIEMPO DE DESPLAZAMIENTO (OSRM)
  // ---------------------------------
  const segundosRuta = legs.reduce(
    (acc, leg) => acc + (leg.duration || 0),
    0
  )

  // ---------------------------------
  // TIEMPO DE VISITA REAL POR PUNTO
  // ---------------------------------
  const segundosVisita = puntosOrdenados.reduce((acc, punto) => {

    const minutos = punto.tiempo_visita ?? 15
    return acc + (minutos * 60)

  }, 0)

  // ---------------------------------
  // TOTAL
  // ---------------------------------
  const segundosTotales = segundosRuta + segundosVisita

  const horas = Math.floor(segundosTotales / 3600)

  const minutos = Math.floor((segundosTotales % 3600) / 60)

  if (horas > 0) {
    return `${horas} h ${minutos} min`
  }

  return `${minutos} min`
}

// ---------------------------------------------------
// CALCULA TIEMPO TOTAL DE RUTA EN SEGUNDOS
// DEPRECATED
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

  for (let i = 0; i < puntosOrdenados.length; i++) {

    const punto = puntosOrdenados[i]

    // --------------------------------
    // TIEMPO DE VISITA REAL
    // fallback: 15 min si no existe
    // --------------------------------
    const tiempoVisitaSegundos =
      (punto.tiempo_visita ?? 15) * 60

    acumulado += tiempoVisitaSegundos

    // --------------------------------
    // TIEMPO DE TRAYECTO (OSRM)
    // --------------------------------
    if (legs[i]) {
      acumulado += legs[i].duration
    }

    // --------------------------------
    // SI SE PASA DEL TIEMPO → STOP
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

  // Indicadores para si vemos "Mas informacion" en un Popup
  const [mostrarInfo, setMostrarInfo] = useState(false)
  const [puntoInfo, setPuntoInfo] = useState(null)

  // Indicadores para ver el modo de popup actual
  // "ruta" | "info"
  const [modoPopup, setModoPopup] = useState("ruta")




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
  // FUNCION PARA ABRIR POPUPS Y VARIAR ENTRE MODOS
  // ---------------------------------------------------

  const abrirInformacion = (punto) => {
    setModoPopup("info")

    setTimeout(() => {
      const marker = markersRef.current[punto.id]

      if (marker) {
        marker.closePopup()
        marker.openPopup()
      }
    }, 0)
  }

  // ---------------------------------------------------
  // FUNCION PARA CERRAR POPUPS Y VARIAR ENTRE MODOS
  // ---------------------------------------------------


  const volverARuta = (punto) => {
    setModoPopup("ruta")

    setTimeout(() => {
      const marker = markersRef.current[punto.id]
      if (marker) {
        marker.closePopup()
        marker.openPopup()
      }
    }, 0)
  }

  // ---------------------------------------------------
  // CREA RUTA DINAMICA DESDE PUNTOS CERCANOS
  // ---------------------------------------------------

  const crearRutaDesdePuntosCercanos = async (puntosSeleccionados) => {

    if(cargandoRuta){
      return
    }

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

      setRutaCercanosBase(puntosSeleccionados)

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

      setRutaSeleccionada(prev => {

        if (prev?.id === "cercanos") {
          return prev
        }

        return {
          id: "cercanos",
          nombre: "Ruta personalizada"
        }

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
  // APLICANDO FILTROS ACTIVOS
  // ---------------------------------------------------

  const buscarPuntosCercanos = async () => {

    // --------------------------------
    // RADIO MAXIMO
    // --------------------------------

    const RADIO_METROS = 500

    // --------------------------------
    // FILTRAR PUNTOS CERCANOS
    // + FILTRO EVITAR PAGO
    // --------------------------------

    const cercanos = todosPuntos.filter(

      (punto) => {

        // -----------------------------
        // FILTRO PUNTOS DE PAGO
        // -----------------------------

        if (evitarPago && punto.pago) {
          return false
        }

        // -----------------------------
        // CALCULO DISTANCIA
        // -----------------------------

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

    // --------------------------------
    // GUARDAR PUNTOS CERCANOS
    // --------------------------------

    setPuntosCercanos(cercanos)

    // --------------------------------
    // ACTIVAR PANEL CERCANOS
    // --------------------------------

    setModoCercanos(true)

    // --------------------------------
    // CENTRAR MAPA
    // --------------------------------

    if (mapRef.current) {

      mapRef.current.flyTo(
        [
          userLocation.lat,
          userLocation.lon
        ],
        14
      )

    }

    // --------------------------------
    // SI NO HAY PUNTOS -> STOP
    // --------------------------------

    if (cercanos.length === 0) {
      return
    }


  }

  // ---------------------------------------------------
  // RECALCULA PUNTOS CERCANOS AL MOVER userLocation
  // ---------------------------------------------------


  useEffect(() => {

    if (!modoCercanos) return
    if (todosPuntos.length === 0) return

    const RADIO_METROS = 500

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
  // RECALCULA RUTA DINAMICA DE CERCANOS
  // CUANDO CAMBIAN LOS FILTROS
  // ---------------------------------------------------

  useEffect(() => {


    // No recalculamos la ruta si estamos en modo navegacion

    if(modoNavegacion){
      return
    }

    // --------------------------------
    // SOLO SI EXISTE RUTA DE CERCANOS
    // --------------------------------

    if (
      !rutaSeleccionada ||
      rutaSeleccionada.id !== "cercanos"
    ) {
      return
    }

    // --------------------------------
    // SEGURIDAD
    // --------------------------------

    if (
      !rutaCercanosBase ||
      rutaCercanosBase.length === 0
    ) {
      return
    }

    // --------------------------------
    // RECALCULAR RUTA
    // --------------------------------

    crearRutaDesdePuntosCercanos(
      rutaCercanosBase
    )

  }, [

    evitarPago,
    usarFiltroTiempo,
    horasDisponibles,
    userLocation

  ])

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

        // ignorar clics de botones para "puntos cercanos"
        const target = e.originalEvent?.target

        if (target && target.closest('button')) {
          return
        }

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
    getTodosPuntos()
      .then(data => {
        const puntosArray = Array.isArray(data) ? data : []

        setTodosPuntos(
          puntosArray.filter(
            punto =>
              punto.activo === true &&
              punto.ruta_activa === true
          )
        )
      })
      .catch(console.error)
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

    // No recalculamos la ruta si estamos en modo navegacion

    if(modoNavegacion){
      return
    }

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
      ordenPuntos?.[segmentoActual]

    if (!siguientePunto) return

    // Centra mapa

    //centrarYAbrir(siguientePunto);

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
    ordenPuntos

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
          {mensajeTiempo}
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
          Ver puntos cercanos a mi
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
                  icon={iconosRutas[punto.ruta_id] || iconosNuevos}
                  ref={(el) => {
                    if (el) markersRef.current[punto.id] = el
                  }}
                >
                <Popup>
                  {modoPopup === "ruta" && (
                    <PopupRuta
                      punto={punto}
                      ruta={{
                        id: punto.ruta_id,
                        nombre: punto.ruta_nombre
                      }}
                      rutaSeleccionada={rutaSeleccionada}
                      setRutaSeleccionada={setRutaSeleccionada}
                      setModoPopup={setModoPopup}
                      abrirInformacion={abrirInformacion}
                    />
                  )}

                  {modoPopup === "info" && (
                    <PopupInformacion
                      punto={punto}
                      ruta={{
                        id: punto.ruta_id,
                        nombre: punto.ruta_nombre
                      }}
                      modoHistoriador={modoHistoriador}
                      setModoHistoriador={setModoHistoriador}
                      setModoPopup={setModoPopup}
                      volverARuta={volverARuta}
                    />
                  )}
                </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          )
        })
      }

      {/* ------------------------------------------------ */}
      {/* CLUSTER PARA PUNTOS SIN RUTA ASIGNADA (nuevos)  */}
      {/* ------------------------------------------------ */}

      {!rutaSeleccionada && !modoCercanos && (() => {

        const puntosNuevos = puntosOrdenados.filter(
          p =>
            !iconosRutas[p.ruta_id] &&
            (!evitarPago || !p.pago)
        )

        if (puntosNuevos.length === 0) return null

        return (
          <MarkerClusterGroup
            key="nuevos"
            chunkedLoading
            maxClusterRadius={75}
            showCoverageOnHover={false}
            iconCreateFunction={crearClusterPorRuta("cluster-ruta-nuevos")}
          >
            {puntosNuevos.map(punto => (
              <Marker
                key={`${punto.id}-${punto.ruta_id}`}
                position={[punto.latitud, punto.longitud]}
                icon={iconosNuevos}
                ref={(el) => {
                  if (el) markersRef.current[punto.id] = el
                }}
              >
              <Popup>
                {modoPopup === "ruta" && (
                  <PopupRuta
                    punto={punto}
                    ruta={{
                      id: punto.ruta_id,
                      nombre: punto.ruta_nombre
                    }}
                    rutaSeleccionada={rutaSeleccionada}
                    setRutaSeleccionada={setRutaSeleccionada}
                    setModoPopup={setModoPopup}
                    abrirInformacion={abrirInformacion}
                  />
                )}
                {modoPopup === "info" && punto && (
                  <PopupInformacion
                    punto={punto}
                    ruta={{
                      id: punto.ruta_id,
                      nombre: punto.ruta_nombre
                    }}
                    modoHistoriador={modoHistoriador}
                    setModoHistoriador={setModoHistoriador}
                    volverARuta={volverARuta}
                  />
                )}
              </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        )
      })()}

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
                || iconosNuevos
              }
              ref={(el) => {

                if (el) {
                  markersRef.current[punto.id] = el
                }

              }}
            >

            <Popup>
              {modoPopup === "ruta" && (
                <PopupRuta
                  punto={punto}
                  ruta={{
                    id: punto.ruta_id,
                    nombre: punto.ruta_nombre
                  }}
                  rutaSeleccionada={rutaSeleccionada}
                  setRutaSeleccionada={setRutaSeleccionada}
                  setModoPopup={setModoPopup}
                  abrirInformacion={abrirInformacion}
                />
              )}

              {modoPopup === "info" && punto && (
                <PopupInformacion
                  punto={punto}
                  ruta={{
                    id: punto.ruta_id,
                    nombre: punto.ruta_nombre
                  }}
                  modoHistoriador={modoHistoriador}
                  setModoHistoriador={setModoHistoriador}
                  setModoPopup={setModoPopup}
                  volverARuta={volverARuta}

                />
              )}
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
                || iconosNuevos
              }
              ref={(el) => {

                if (el) {
                  markersRef.current[punto.id] = el
                }

              }}
            >

            <Popup>
              {modoPopup === "ruta" && (
                <PopupRuta
                  punto={punto}
                  ruta={{
                    id: punto.ruta_id,
                    nombre: punto.ruta_nombre
                  }}
                  rutaSeleccionada={rutaSeleccionada}
                  setRutaSeleccionada={setRutaSeleccionada}
                  setModoPopup={setModoPopup}
                  abrirInformacion={abrirInformacion}
                />
              )}

              {modoPopup === "info" && punto && (
                <PopupInformacion
                  punto={punto}
                  ruta={{
                    id: punto.ruta_id,
                    nombre: punto.ruta_nombre
                  }}
                  modoHistoriador={modoHistoriador}
                  setModoHistoriador={setModoHistoriador}
                  setModoPopup={setModoPopup}
                  volverARuta={volverARuta}

                />
              )}
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
