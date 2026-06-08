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

import userMarker from '../../assets/userMarker.png'


// ---------------------------------------------------
// GPS-ACTIVO
// ---------------------------------------------------


const GPS_ACTIVO = window.innerWidth <= 768
//const GPS_ACTIVO = false


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





function crearIconoRuta(color = "#e63946") {
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
  // FUNCIONES AUXILIARES
  // ---------------------------------------------------



// ---------------------------------------------------
// CREAR ICONO CLUSTER
// ---------------------------------------------------

const crearClusterPorRuta = (color) => (cluster) => {
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
// CALCULA EL TEXTO DE DISTANCIA DE RUTA
// ---------------------------------------------------

  // ---------------------------------
  // Distancia en kilometros de la ruta generada
  // ------------------------------


function calcularDistanciaRuta(legs) {
  const metros = legs.reduce(
    (acc, leg) => acc + (leg.distance || 0),
    0
  )
  return (metros / 1000).toFixed(2) // "1.34"
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

  userLocation,
  setUserLocation,

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
  horasDisponibles,

  radioMetros,

  setDistanciaRuta


}) {

  // ---------------------------------------------------
  // ESTADOS
  // ---------------------------------------------------

  // Todos los puntos cargados desde backend
  const [todosPuntos, setTodosPuntos] = useState([])

  // User location basado en watchposition
  const [userLocationRuta, setUserLocationRuta] = useState(userLocation)

  // Segmentos de la ruta mostrados en el mapa
  const [rutasSegmentosLocal, setRutasSegmentosLocal] = useState([])

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

  // Umbral para no recalcular ruta si la localizacion gps cambia muy poco
  const lastRecalcLocationRef = useRef(null)

  // Umbral para actualizar posición visual
  const UMBRAL_POSICION_METROS = 5

  // Umbral para recalcular rutas
  const UMBRAL_RUTA_METROS = 15

  const lastRouteLocationRef = useRef(null)

  useEffect(() => {
    userLocationRef.current = userLocation
  }, [userLocation])

  useEffect(() => {

    if (!userLocation) return

    if (!lastRouteLocationRef.current) {

      lastRouteLocationRef.current = userLocation
      setUserLocationRuta(userLocation)

      return
    }

    const distancia =
      calcularDistanciaMetros(

        lastRouteLocationRef.current.lat,
        lastRouteLocationRef.current.lon,

        userLocation.lat,
        userLocation.lon
      )

    if (distancia >= UMBRAL_RUTA_METROS) {

      lastRouteLocationRef.current = userLocation

      setUserLocationRuta(userLocation)

    }

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
          setDistanciaRuta(null)
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

      const distanciaTexto = calcularDistanciaRuta(legsFinales)
      setDistanciaRuta(distanciaTexto)

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

    const RADIO_METROS = radioMetros

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

    const RADIO_METROS = radioMetros

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

  }, [userLocationRuta, todosPuntos, modoCercanos, evitarPago])


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
    userLocationRuta

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



  // En MapaClickHandler, añade la condición:
  function MapaClickHandler() {
    useMapEvents({
      click(e) {
        if (GPS_ACTIVO) return  // ignora clicks si GPS activo
        const target = e.originalEvent?.target
        if (target && target.closest('button')) return
        setUserLocation({ lat: e.latlng.lat, lon: e.latlng.lng })
      }
    })
    return null
  }

  // ---------------------------------------------------
  // Obtiene la posicion del usuario en funcion del GPS (cada 15 segundos)
  // DEPRECATED
  // SE CAMBIA SU USO POR WATCHPOSITION
  // ---------------------------------------------------


/*
    const obtenerPosicion = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          })
        },
        (err) => console.error("GPS error:", err),
        { enableHighAccuracy: true, maximumAge: 0 }
      )
    }
*/
/*
    const obtenerPosicion = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const nuevaPos = {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          }

          // Comprobación de umbral
          if (lastRecalcLocationRef.current) {
            const distancia = calcularDistanciaMetros(
              lastRecalcLocationRef.current.lat,
              lastRecalcLocationRef.current.lon,
              nuevaPos.lat,
              nuevaPos.lon
            )
            if (distancia < UMBRAL_RECALCULO_METROS) {
              return  // movimiento insuficiente, ignorar
            }
          }

          lastRecalcLocationRef.current = nuevaPos
          setUserLocation(nuevaPos)
        },
        (err) => console.error("GPS error:", err),
        { enableHighAccuracy: true, maximumAge: 0 }
      )
    }
*/



  // ---------------------------------------------------
  // Obtiene y actualiza la posicion del usuario
  // ---------------------------------------------------

  useEffect(() => {

    if (!navigator.geolocation || !GPS_ACTIVO) return

    const watchId =
      navigator.geolocation.watchPosition(

        (pos) => {

          const nuevaPos = {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          }

          // Evita ruido GPS

          if (lastRecalcLocationRef.current) {

            const distancia =
              calcularDistanciaMetros(

                lastRecalcLocationRef.current.lat,
                lastRecalcLocationRef.current.lon,

                nuevaPos.lat,
                nuevaPos.lon
              )

            if (distancia < UMBRAL_POSICION_METROS) {
              return
            }
          }

          lastRecalcLocationRef.current = nuevaPos

          setUserLocation(nuevaPos)

        },

        (err) => {
          console.error("GPS error:", err)
        },

        {
          enableHighAccuracy: true,
          maximumAge: 0
        }

      )

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }

  }, [])

/*

  useEffect(() => {
    if (!navigator.geolocation || !GPS_ACTIVO) return

    obtenerPosicion()
    const intervalo = setInterval(obtenerPosicion, 15000)
    return () => clearInterval(intervalo)
  }, [])
*/
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
              (
                punto.ruta_activa === true ||
                punto.ruta_id == null
              )
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
      setDistanciaRuta(null)
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
            setDistanciaRuta(null)

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
        const distanciaTexto = calcularDistanciaRuta(legsFinales)
        setDistanciaRuta(distanciaTexto)

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
    userLocationRuta,
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
  // HELPER: icono para un punto (usa color de su ruta)
  // ---------------------------------------------------

  const iconoPunto = (punto) =>
    crearIconoRuta(punto.ruta_color || punto.color_ruta || "#383838")



  // ---------------------------------------------------
  // HELPER: renderiza Popup de un marker
  // ---------------------------------------------------

  const esMobil = window.innerWidth < 768

  const renderPopup = (punto) => (
    <Popup maxHeight={esMobil ? 500 : 350}>
      {modoPopup === "ruta" && (
        <PopupRuta
          punto={punto}
          ruta={{ id: punto.ruta_id, nombre: punto.ruta_nombre }}
          rutaSeleccionada={rutaSeleccionada}
          setRutaSeleccionada={setRutaSeleccionada}
          setModoPopup={setModoPopup}
          abrirInformacion={abrirInformacion}
        />
      )}
      {modoPopup === "info" && (
        <PopupInformacion
          punto={punto}
          ruta={{ id: punto.ruta_id, nombre: punto.ruta_nombre }}
          modoHistoriador={modoHistoriador}
          setModoHistoriador={setModoHistoriador}
          setModoPopup={setModoPopup}
          volverARuta={volverARuta}
        />
      )}
    </Popup>
  )


  // ---------------------------------------------------
  // HELPER: renderiza un Marker con ref
  // ---------------------------------------------------

  const renderMarker = (punto) => (
    <Marker
      key={`${punto.id}-${punto.ruta_id}`}
      position={[punto.latitud, punto.longitud]}
      icon={iconoPunto(punto)}
      ref={(el) => { if (el) markersRef.current[punto.id] = el }}
    >
      {renderPopup(punto)}
    </Marker>
  )

  // ---------------------------------------------------
  // RENDER DEL MAPA
  // ---------------------------------------------------


  // Obtener IDs de rutas únicas presentes en los puntos
  const rutasUnicas = [...new Set(
    puntosOrdenados
      .filter(p => p.ruta_id != null)
      .map(p => p.ruta_id)
  )]

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
          //map.recalcularPosicion = obtenerPosicion  // ← añadir

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
              positions={coords.map(([lon, lat]) => [lat, lon])}
              color={rutaSeleccionada?.color || "#e63946"}
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
        rutasUnicas.map((rutaId) => {

          const puntosDeRuta = puntosOrdenados.filter(
            p =>
              p.ruta_id === rutaId &&
              (!evitarPago || !p.pago)
          )

          if (puntosDeRuta.length === 0) return null

          // Tomar el color del primer punto de esta ruta
          const colorRuta = puntosDeRuta[0]?.ruta_color || puntosDeRuta[0]?.color_ruta || "#383838"

          return (
            <MarkerClusterGroup
              key={rutaId}
              chunkedLoading
              maxClusterRadius={75}
              showCoverageOnHover={false}
              iconCreateFunction={crearClusterPorRuta(colorRuta)}
            >
              {puntosDeRuta.map(punto => renderMarker(punto))}
            </MarkerClusterGroup>
          )
        })
      }

      {/* ------------------------------------------------ */}
      {/* CLUSTER PARA PUNTOS SIN RUTA ASIGNADA (nuevos)  */}
      {/* ------------------------------------------------ */}

      {!rutaSeleccionada && !modoCercanos && (() => {
        const puntosNuevos = puntosOrdenados.filter(
          p => p.ruta_id == null && (!evitarPago || !p.pago)
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
            {puntosNuevos.map(punto => renderMarker(punto))}
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

          .map(punto => renderMarker(punto))

      )}

      {/* ------------------------------------------------ */}
      {/* MARKERS CUANDO HAY RUTA */}
      {/* ------------------------------------------------ */}

      {rutaSeleccionada && (

        puntosOrdenados

          .filter(
            punto => !evitarPago || !punto.pago
          )

          .map(punto => renderMarker(punto))
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
