import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
// ----------------------------



// Estilos para la aplicacion seccionados
// ANTIGUO: import './styles/App.css'

import "./styles/global.css"
import "./styles/header.css"
import "./styles/mapa.css"
import "./styles/MenuPuntos.css"
import "./styles/MenuRutas.css"
import "./styles/PanelBibliografia.css"
import "./styles/PanelCercanos.css"
import "./styles/PanelRuta.css"
import "./styles/Popup.css"
import "./styles/PopupInformacion.css"

// Admin

import "./styles/AdminButton-other.css"
import "./styles/AdminPage.css"
import "./styles/AdminSection.css"
import "./styles/ConfirmModal.css"
import "./styles/ConfiguracionGeneral.css"

// ----------------------------

import logoUGR from '../assets/logo-ugr.png'

import Mapa from './components/Map.jsx'
import MenuRutas from './components/MenuRutas.jsx'
import MenuPuntos from './components/MenuPuntos.jsx'
import PanelRuta from './components/PanelRuta.jsx'
import PanelBibliografia from './components/PanelBibliografia.jsx'
import PanelCercanos from './components/PanelCercanos.jsx'


// ---------------------------------------------------
// COMPONENTES AUXILIARES PARA DRAWERS MOVIL
// Versiones simplificadas de MenuRutas y MenuPuntos
// que cierran el drawer al seleccionar
// ---------------------------------------------------

import DrawerNavegacion from './components/movil/DrawerNavegacion.jsx'
import DrawerLateralIzquierdo from './components/movil/DrawerLateralIzquierdo.jsx'
import DrawerOpciones from './components/movil/DrawerOpciones.jsx'

// ---------------------------------------------------
// IMPORTS DE REFACTORIZACION
// ---------------------------------------------------

import { useRadioCercanos } from './hooks/useRadioCercanos.js'

import { useVhMovil } from './hooks/useVhMovil.js'

import { useAutoAbrirDrawerCercanos } from './hooks/useAutoAbrirDrawerCercanos.js'

import { useDuracionCerrada } from './hooks/useDuracionCerrada.js'

import Header from './components/app/Header.jsx'

import AvisosRuta from './components/app/AvisosRuta.jsx'

import PanelDerecho from './components/app/PanelDerecho.jsx'

function App() {

  // ---------------------------------------------------
  // ESTADOS PRINCIPALES DE LA APLICACION
  // ---------------------------------------------------

  // Ruta seleccionada actualmente
  const [rutaSeleccionada, setRutaSeleccionada] = useState(null)

  // Referencia al mapa de Leaflet
  const mapRef = useRef()

  // Para react router
  const navigate = useNavigate()

  // Localizacion del usuario
  const [userLocation, setUserLocation] = useState({
    lat: 37.1773,
    lon: -3.5986
  })

  // Estado para activar informacion historica extra
  const [modoHistoriador, setModoHistoriador] = useState(false)

  // Tipo de ruta seleccionada
  // "optima" -> ruta mas corta
  // "historica" -> orden historico
  const [modoRuta, setModoRuta] = useState("optima")

  // Lista de segmentos devueltos por OSRM
  // Se usa para mostrar pasos de navegacion
  const [rutasSegmentos, setRutasSegmentos] = useState([])

  // Estado para mostrar instrucciones paso a paso
  // Actualmente oculto
  const [modoNavegacion, setModoNavegacion] = useState(false)

  // Estado para evitar lugares de pago
  const [evitarPago, setEvitarPago] = useState(false)

  // Activa o desactiva el filtro de tiempo
  const [usarFiltroTiempo, setUsarFiltroTiempo] = useState(false)

  // Horas disponibles para la ruta (1-7)
  const [horasDisponibles, setHorasDisponibles] = useState(3)

  // Estado para ocultar o mostrar el panel derecho
  const [mostrarPanel, setMostrarPanel] = useState(false)

  // Estado para visualizar bibliografia
  const [modoBibliografia, setModoBibliografia] = useState(false)

  // Lista de puntos ordenados
  // Se genera desde OSRM + algoritmo A*
  const [ordenPuntos, setOrdenPuntos] = useState([])

  // Texto con la duracion aproximada de la ruta
  const [duracionRuta, setDuracionRuta] = useState(null)

  // Estado para controlar cuando OSRM esta cargando
  const [cargandoRuta, setCargandoRuta] = useState(false)

  // Lista de puntos cercanos al usuario
  const [puntosCercanos, setPuntosCercanos] = useState([])

  // Activa el panel de cercanos
  const [modoCercanos, setModoCercanos] = useState(false)

  // Segmento actual mostrado durante navegacion
  const [segmentoActual, setSegmentoActual] = useState(0)

  // Controla visibilidad del menu de opciones en movil
  const [mostrarOpcionesMovil, setMostrarOpcionesMovil] = useState(false)

  // Controla visibilidad del drawer de rutas/puntos en movil
  const [mostrarPanelMovil, setMostrarPanelMovil] = useState(false)

  // Vista activa dentro del drawer izquierdo de movil
  // "rutas" | "puntos" | "bibliografia" | "navegacion"
  const [vistaDrawer, setVistaDrawer] = useState("rutas")

  // Controla si el usuario ha cerrado el mensaje de duracion de ruta
  const [duracionCerrada, setDuracionCerrada] = useDuracionCerrada(rutaSeleccionada)

  // radio de metros para puntos cercanos
  const radioMetros = useRadioCercanos()

  // Texto con la distancia de la ruta
  const [distanciaRuta, setDistanciaRuta] = useState(null)

  // Aviso de que todos los puntos son de pago
  const [mensajeTodosPago, setMensajeTodosPago] = useState(false)

  // Aviso de GPS denegado y activación de modo manual
  const [gpsDenegado, setGpsDenegado] = useState(false)


  // ---------------------------------------------------
  // FUNCIONES AUXILIARES
  // ---------------------------------------------------

  // Centra el mapa en un punto concreto
  // Se usa desde MenuPuntos
  const centrarEnPunto = (punto) => {

    // Seguridad por si el mapa aun no existe
    if (!mapRef.current) return

    mapRef.current.flyTo(
      [punto.latitud, punto.longitud],
      16,
      {
        duration: 1.2
      }
    )
  }



  // ---------------------------------------------------
  // Fix altura de movil
  // Ver en hooks/useVhMovil.js
  // ---------------------------------------------------

  useVhMovil()

  // ---------------------------------------------------
  // ABRE EL DRAWER EN VISTA CERCANOS
  // cuando el mapa activa el modo cercanos
  // SOLO MOVIL
  // ---------------------------------------------------

  useAutoAbrirDrawerCercanos({ modoCercanos, setVistaDrawer, setMostrarPanelMovil })


  // ---------------------------------------------------
  // RENDER PRINCIPAL
  // ---------------------------------------------------

  return (

    <div className="App">

      {/* --------------------------------------------------- */}
      {/* HEADER SUPERIOR */}
      {/* --------------------------------------------------- */}

      <Header
        setMostrarPanelMovil={setMostrarPanelMovil}
        navigate={navigate}
        modoRuta={modoRuta}
        setModoRuta={setModoRuta}
        evitarPago={evitarPago}
        setEvitarPago={setEvitarPago}
        usarFiltroTiempo={usarFiltroTiempo}
        setUsarFiltroTiempo={setUsarFiltroTiempo}
        horasDisponibles={horasDisponibles}
        setHorasDisponibles={setHorasDisponibles}
      />

      {/* --------------------------------------------------- */}
      {/* DRAWER IZQUIERDA - RUTAS, PUNTOS, NAVEGACION, CERCA */}
      {/* --------------------------------------------------- */}

      <DrawerLateralIzquierdo
        mostrarPanelMovil={mostrarPanelMovil}
        setMostrarPanelMovil={setMostrarPanelMovil}
        setMostrarOpcionesMovil={setMostrarOpcionesMovil}
        vistaDrawer={vistaDrawer}
        setVistaDrawer={setVistaDrawer}
        rutaSeleccionada={rutaSeleccionada}
        setRutaSeleccionada={setRutaSeleccionada}
        setModoNavegacion={setModoNavegacion}
        setModoBibliografia={setModoBibliografia}
        setModoCercanos={setModoCercanos}
        setSegmentoActual={setSegmentoActual}
        mapRef={mapRef}
        evitarPago={evitarPago}
        ordenPuntos={ordenPuntos}
        puntosCercanos={puntosCercanos}
        setPuntosCercanos={setPuntosCercanos}
        radioMetros={radioMetros}
      />

      {/* --------------------------------------------------- */}
      {/* DRAWER DERECHA - OPCIONES                           */}
      {/* --------------------------------------------------- */}

      <DrawerOpciones
        mostrarOpcionesMovil={mostrarOpcionesMovil}
        setMostrarOpcionesMovil={setMostrarOpcionesMovil}
        navigate={navigate}
        modoRuta={modoRuta}
        setModoRuta={setModoRuta}
        evitarPago={evitarPago}
        setEvitarPago={setEvitarPago}
        usarFiltroTiempo={usarFiltroTiempo}
        setUsarFiltroTiempo={setUsarFiltroTiempo}
        horasDisponibles={horasDisponibles}
        setHorasDisponibles={setHorasDisponibles}
      />

      {/* --------------------------------------------------- */}
      {/* CONTENIDO PRINCIPAL */}
      {/* --------------------------------------------------- */}

      <div className={mostrarPanel ? "main-layout" : "main-layout-full"}>

        {/* --------------------------------------------------- */}
        {/* CONTENEDOR DEL MAPA */}
        {/* --------------------------------------------------- */}

        <div className="map-container" style={{ width: mostrarPanel ? "calc(100vw - 250px)" : "100vw" }}>

          {/* --------------------------------------------------------- */}
          {/* AVISOS DE DURACION,DISTANCIA,PUNTOS DE PAGO, GPS DENEGADO */}
          {/* --------------------------------------------------------- */}

          <AvisosRuta
            cargandoRuta={cargandoRuta}
            duracionRuta={duracionRuta}
            distanciaRuta={distanciaRuta}
            rutaSeleccionada={rutaSeleccionada}
            duracionCerrada={duracionCerrada}
            setDuracionCerrada={setDuracionCerrada}
            mensajeTodosPago={mensajeTodosPago}
            setMensajeTodosPago={setMensajeTodosPago}
            gpsDenegado={gpsDenegado}
            setGpsDenegado={setGpsDenegado}
          />

          {/* -------------------------------- */}
          {/* COMPONENTE MAPA */}
          {/* -------------------------------- */}

          <Mapa
            userLocation={userLocation}
            setUserLocation={setUserLocation}
            rutaSeleccionada={rutaSeleccionada}
            setRutaSeleccionada={setRutaSeleccionada}

            mapRef={mapRef}

            modoHistoriador={modoHistoriador}
            setModoHistoriador={setModoHistoriador}

            modoRuta={modoRuta}
            setRutasSegmentos={setRutasSegmentos}

            setEvitarPago={setEvitarPago}
            evitarPago={evitarPago}

            ordenPuntos={ordenPuntos}
            setOrdenPuntos={setOrdenPuntos}

            setDuracionRuta={setDuracionRuta}

            cargandoRuta={cargandoRuta}
            setCargandoRuta={setCargandoRuta}

            puntosCercanos={puntosCercanos}
            setPuntosCercanos={setPuntosCercanos}

            modoCercanos={modoCercanos}
            setModoCercanos={setModoCercanos}

            modoNavegacion={modoNavegacion}
            segmentoActual={segmentoActual}

            mostrarPanel={mostrarPanel}

            usarFiltroTiempo={usarFiltroTiempo}
            horasDisponibles={horasDisponibles}

            radioMetros={radioMetros}

            setDistanciaRuta={setDistanciaRuta}

            mensajeTodosPago={mensajeTodosPago}
            setMensajeTodosPago={setMensajeTodosPago}

            gpsDenegado={gpsDenegado}
            setGpsDenegado={setGpsDenegado}


          />

        </div>

        {/* --------------------------------------------------- */}
        {/* BOTON MOSTRAR / OCULTAR PANEL */}
        {/* --------------------------------------------------- */}

        <button
          className={`btn-toggle-panel${!mostrarPanel ? " oculto" : ""}`}
          onClick={() => setMostrarPanel(prev => !prev)}
        >

          {mostrarPanel
            ? "Ocultar panel"
            : "Mostrar panel"}

        </button>


        {/* --------------------------------------------------- */}
        {/* PANEL DERECHO */}
        {/* --------------------------------------------------- */}

        {mostrarPanel && (
          <PanelDerecho
            modoCercanos={modoCercanos}
            setModoCercanos={setModoCercanos}
            puntosCercanos={puntosCercanos}
            setPuntosCercanos={setPuntosCercanos}
            radioMetros={radioMetros}
            rutaSeleccionada={rutaSeleccionada}
            setRutaSeleccionada={setRutaSeleccionada}
            modoNavegacion={modoNavegacion}
            setModoNavegacion={setModoNavegacion}
            modoBibliografia={modoBibliografia}
            setModoBibliografia={setModoBibliografia}
            setSegmentoActual={setSegmentoActual}
            mapRef={mapRef}
            evitarPago={evitarPago}
            ordenPuntos={ordenPuntos}
            centrarEnPunto={centrarEnPunto}
            rutasSegmentos={rutasSegmentos}
            segmentoActual={segmentoActual}
          />
        )}

      </div>

      {/* --------------------------------------------------- */}
      {/* BARRA DE NAVEGACION MOVIL                           */}
      {/* Solo visible en movil cuando modoNavegacion activo  */}
      {/* --------------------------------------------------- */}

      {modoNavegacion && (
        <DrawerNavegacion
          rutasSegmentos={rutasSegmentos}
          segmentoActual={segmentoActual}
          setSegmentoActual={setSegmentoActual}
          setModoNavegacion={setModoNavegacion}
          userLocation={userLocation}
        />
      )}

    </div>

  )
}

export default App
