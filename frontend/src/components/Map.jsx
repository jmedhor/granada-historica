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

import 'leaflet/dist/leaflet.css'

import 'leaflet-polylinedecorator'

import { coloresRuta } from '../utils/coloresRuta.js'

import { marcadorUser } from '../utils/mapIcons.js'

import { calcularDuracionRuta, calcularDistanciaRuta, filtrarPuntosPorTiempo } from '../utils/rutaCalculos.js'

import { useGeolocation } from '../hooks/useGeolocation.js'

import { usePuntosCercanos } from '../hooks/usePuntosCercanos.js'

import { useUserLocationRuta } from '../hooks/useUserLocationRuta.js'

import { useCargarRuta } from '../hooks/useCargarRuta.js'

import { useMarkersRuta } from '../hooks/useMarkersRuta.js'

import RutaPolylines from './mapa/RutaPolylines.jsx'

import ClustersPorRuta from './mapa/ClustersPorRuta.jsx'

import MarkersCercanos from './mapa/MarkersCercanos.jsx'

import MarkersDeRuta from './mapa/MarkersDeRuta.jsx'

import NumerosOrden from './mapa/NumerosOrden.jsx'

import { useTodosPuntos } from '../hooks/useTodosPuntos.js'

import { useCentradoNavegacion } from '../hooks/useCentradoNavegacion.js'

import { useEstadoRutaUI } from '../hooks/useEstadoRutaUI.js'

import { useResizeMapa } from '../hooks/useResizeMapa.js'

import MapaClickHandler from './mapa/MapaClickHandler.jsx'

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

  setEvitarPago,
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

  setDistanciaRuta,

  mensajeTodosPago,
  setMensajeTodosPago,

  gpsDenegado,
  setGpsDenegado



}) {

  // ---------------------------------------------------
  // ESTADOS
  // ---------------------------------------------------

  // Todos los puntos cargados desde backend, ver en hooks/useTodosPuntos.js
  const todosPuntos = useTodosPuntos()

  // User location basado en watchposition, ver en hooks/useUserLocationRuta.js
  const userLocationRuta = useUserLocationRuta(userLocation)

  // Segmentos de la ruta mostrados en el mapa
  const [rutasSegmentosLocal, setRutasSegmentosLocal] = useState([])

  // Indicador de si estamos usando GPS o no
  // En caso de que si controla la actualizacion mediante watchposition
  const { gpsActivo, setGpsActivo } = useGeolocation({ setUserLocation, setGpsDenegado })

  // Referencia a userLocation actualizada en todo momento
  const userLocationRef = useRef(userLocation)

  // Mensajes de tiempo y "todos puntos pago" ver hooks/useEstadoRutaUI.js
  const { mensajeTiempo, setMensajeTiempo, todosPuntosPago } = useEstadoRutaUI({
    rutaSeleccionada,
    usarFiltroTiempo,
    mensajeTodosPago,
    setMensajeTodosPago,
    setRutasSegmentos,
    setRutasSegmentosLocal,
    setOrdenPuntos,
    setDuracionRuta,
    setDistanciaRuta,
  })

  // Relacionado con puntos cercanos, uso en utils/usePuntosCercanos.js
  const { buscarPuntosCercanos, crearRutaDesdePuntosCercanos } = usePuntosCercanos({
    todosPuntos,
    userLocation,
    userLocationRuta,
    userLocationRef,
    radioMetros,
    evitarPago,
    usarFiltroTiempo,
    horasDisponibles,
    modoCercanos,
    setModoCercanos,
    setPuntosCercanos,
    modoNavegacion,
    rutaSeleccionada,
    setRutaSeleccionada,
    mapRef,
    cargandoRuta,
    setCargandoRuta,
    setOrdenPuntos,
    setRutasSegmentos,
    setRutasSegmentosLocal,
    setDuracionRuta,
    setDistanciaRuta,
    setMensajeTiempo,
    setMensajeTodosPago,
  })


  // Relacionado con markers, ver en hooks/useMarkersRuta.js
  const {
    markersRef,
    claveMarker,
    buscarMarker,
    iconoPunto,
    modoPopup,
    setModoPopup,
    centrarYAbrir,
    abrirInformacion,
    volverARuta,
  } = useMarkersRuta({ mapRef })

  // Conglomerado de props para marcadores, ver en archivos varios en mapa/
  const markerProps = {
    claveMarker,
    iconoPunto,
    markersRef,
    modoPopup,
    rutaSeleccionada,
    setRutaSeleccionada,
    setModoPopup,
    abrirInformacion,
    modoHistoriador,
    setModoHistoriador,
    volverARuta,
  }


  // Actualizar user location
  useEffect(() => {
    userLocationRef.current = userLocation
  }, [userLocation])


  // Mostrar mensaje de todos los puntos son de pago
  useEffect(() => {
    if(mensajeTodosPago){
      setTodosPuntosPago(true)
    }
  }, [mensajeTodosPago])


  // ---------------------------------------------------
  // FILTRA LOS PUNTOS DE LA RUTA ACTUAL
  // ---------------------------------------------------

  const puntos = rutaSeleccionada
    ? todosPuntos.filter(
        p => p.rutas.some(r => r.id === rutaSeleccionada.id) && p.activo === true
      )
    : todosPuntos.filter(p => p.activo === true)

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

  const puntosVisibles = puntosOrdenados.filter((punto) => {

    if (todosPuntosPago) {
      return true
    }

    return !evitarPago || !punto.pago

  })

  // ---------------------------------------------------
  // Una vez calculados los puntos cargamos la ruta
  // Ver mas en useCargarRuta.js
  // ---------------------------------------------------

  useCargarRuta({
    rutaSeleccionada,
    todosPuntos,
    puntos,
    modoRuta,
    userLocationRuta,
    userLocationRef,
    evitarPago,
    usarFiltroTiempo,
    horasDisponibles,
    modoNavegacion,
    setCargandoRuta,
    setMensajeTodosPago,
    setMensajeTiempo,
    setOrdenPuntos,
    setRutasSegmentos,
    setRutasSegmentosLocal,
    setDuracionRuta,
    setDistanciaRuta,
  })


  // ---------------------------------------------------
  // REDIMENSIONA EL MAPA AL OCULTAR/MOSTRAR PANEL
  // ---------------------------------------------------

  useResizeMapa({ mapRef, mostrarPanel })

  // ---------------------------------------------------
  // CENTRA EL MAPA EN EL SIGUIENTE PUNTO
  // DURANTE LA NAVEGACION
  // ---------------------------------------------------

  useCentradoNavegacion({ mapRef, modoNavegacion, segmentoActual, ordenPuntos })


  // ---------------------------------------------------
  // RENDER DEL MAPA
  // ---------------------------------------------------


  // Obtener IDs de rutas únicas presentes en los puntos
  const rutasUnicas = [...new Set(
    puntosOrdenados.flatMap(p => p.rutas.map(r => r.id))
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

      {/* Detecta click en el mapa */}
      <MapaClickHandler gpsActivo={gpsActivo} setUserLocation={setUserLocation} />

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

        <RutaPolylines
          rutasSegmentosLocal={rutasSegmentosLocal}
          modoNavegacion={modoNavegacion}
          segmentoActual={segmentoActual}
          color={rutaSeleccionada?.color}
        />

      {/* ------------------------------------------------ */}
      {/* MARKER DE INICIO */}
      {/* ------------------------------------------------ */}

        <Marker position={[userLocation.lat, userLocation.lon]} icon={marcadorUser} />


      {/* ------------------------------------------------ */}
      {/* CLUSTERS AGRUPADOS POR RUTA */}
      {/* ------------------------------------------------ */}

        {!rutaSeleccionada && !modoCercanos && (
          <ClustersPorRuta
            puntosOrdenados={puntosOrdenados}
            rutasUnicas={rutasUnicas}
            evitarPago={evitarPago}
            markerProps={markerProps}
          />
        )}

      {/* ------------------------------------------------ */}
      {/* MARKERS NORMALES EN MODO CERCANOS */}
      {/* ------------------------------------------------ */}

        {!rutaSeleccionada && modoCercanos && (
          <MarkersCercanos
            puntosCercanos={puntosCercanos}
            evitarPago={evitarPago}
            markerProps={markerProps}
          />
        )}

      {/* ------------------------------------------------ */}
      {/* MARKERS CUANDO HAY RUTA */}
      {/* ------------------------------------------------ */}

        {rutaSeleccionada && (
          <MarkersDeRuta
            rutaSeleccionada={rutaSeleccionada}
            puntosOrdenados={puntosOrdenados}
            evitarPago={evitarPago}
            todosPuntosPago={todosPuntosPago}
            markerProps={markerProps}
          />
        )}

      {/* ------------------------------------------------ */}
      {/* NUMEROS DE ORDEN */}
      {/* ------------------------------------------------ */}

        {rutaSeleccionada && (
          <NumerosOrden puntosVisibles={puntosVisibles} />
        )}

    </MapContainer>

  )
}

export default Mapa
