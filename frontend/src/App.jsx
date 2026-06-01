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

import DrawerRutas from './components/movil/DrawerRutas.jsx'
import DrawerPuntos from './components/movil/DrawerPuntos.jsx'
import DrawerBibliografia from './components/movil/DrawerBibliografia.jsx'
import DrawerNavegacion from './components/movil/DrawerNavegacion.jsx'
import DrawerCercanos from './components/movil/DrawerCercanos.jsx'

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
  const [duracionCerrada, setDuracionCerrada] = useState(false)

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
  // FIX ALTURA REAL EN MOVIL
  // 100vh en moviles incluye la barra del navegador
  // Este efecto calcula el vh real y lo guarda en CSS
  // ---------------------------------------------------

  useEffect(() => {

    const actualizarVh = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
    }

    actualizarVh()
    window.addEventListener('resize', actualizarVh)

    return () => window.removeEventListener('resize', actualizarVh)

  }, [])


  // ---------------------------------------------------
  // ABRE EL DRAWER EN VISTA CERCANOS
  // cuando el mapa activa el modo cercanos
  // SOLO MOVIL
  // ---------------------------------------------------

  useEffect(() => {

    // Solo abrir drawer automaticamente en movil
    if (
      modoCercanos &&
      window.innerWidth <= 768
    ) {

      setVistaDrawer("cercanos")
      setMostrarPanelMovil(true)

    }

  }, [modoCercanos])

  // ---------------------------------------------------
  // Resetar la lógica de mensaje de duración al cambiar la ruta
  // ---------------------------------------------------

  useEffect(() => {
    setDuracionCerrada(false)
  }, [rutaSeleccionada])

  // ---------------------------------------------------
  // RENDER PRINCIPAL
  // ---------------------------------------------------

  return (

    <div className="App">

      {/* --------------------------------------------------- */}
      {/* HEADER SUPERIOR */}
      {/* --------------------------------------------------- */}

      <header className="app-header">

        <div className="header-top-row">

          {/* BOTON HAMBURGUESA IZQUIERDA - abre drawer de rutas */}
          <button
            className="btn-panel-movil"
            onClick={() => setMostrarPanelMovil(prev => !prev)}
            aria-label="Ver rutas y puntos"
          >
            &#9776;
          </button>

          <div className="header-left">
            <h1 className="titulo-app">Granada Histórica</h1>
            <span className="subtitulo-app">
              Rutas historicas por la ciudad de Granada
            </span>
          </div>


          <div className="header-ugr">
            <a href="https://www.ugr.es">
              <img
                src={logoUGR}
                alt="Universidad de Granada"
                className="logo-ugr"
              />
            </a>
          </div>

          {/* CONTROLES - solo visibles en escritorio */}
          <div className="header-right">

            <button
              className="btn-admin"
              onClick={() => navigate('/admin')}
            >
              Admin
            </button>

            <div className="selector-ruta">
              <div className="toggle-group">

                <button
                  className={modoRuta === "optima" ? "toggle active" : "toggle"}
                  onClick={() => setModoRuta("optima")}
                >
                  Ruta mas corta
                </button>

                <button
                  className={evitarPago ? "toggle pago active" : "toggle danger"}
                  onClick={() => setEvitarPago(!evitarPago)}
                >
                  Sitios gratuitos
                </button>

                <div className="toggle-group">

                  <button
                    className={usarFiltroTiempo ? "toggle danger active" : "toggle danger"}
                    onClick={() => setUsarFiltroTiempo(!usarFiltroTiempo)}
                  >
                    Tiempo disponible: {horasDisponibles}h
                  </button>

                  {usarFiltroTiempo && (
                    <select
                      className="toggle"
                      value={horasDisponibles}
                      onChange={(e) => setHorasDisponibles(Number(e.target.value))}
                    >
                      <option value={1}>1 hora</option>
                      <option value={2}>2 horas</option>
                      <option value={3}>3 horas</option>
                      <option value={4}>4 horas</option>
                      <option value={5}>5 horas</option>
                      <option value={6}>6 horas</option>
                      <option value={7}>7 horas</option>
                    </select>
                  )}

                </div>

              </div>
            </div>

          </div>

        </div>

      </header>


      {/* --------------------------------------------------- */}
      {/* DRAWER IZQUIERDA - RUTAS, PUNTOS, NAVEGACION, CERCA */}
      {/* --------------------------------------------------- */}

      {mostrarPanelMovil && (
        <>
          <div
            className="menu-movil-overlay"
            onClick={() => setMostrarPanelMovil(false)}
          />

          <div className="menu-movil-lateral">

            {/* CABECERA DINAMICA */}
            <div className="menu-movil-header">

              <span>
                {vistaDrawer === "rutas"       && "Rutas disponibles"}
                {vistaDrawer === "puntos"      && (rutaSeleccionada?.nombre || "Puntos")}
                {vistaDrawer === "bibliografia" && "Bibliografia"}
                {vistaDrawer === "navegacion"  && "Navegacion"}
                {vistaDrawer === "cercanos"  && "Puntos cercanos"}

              </span>

              <button
                className="menu-movil-cerrar"
                onClick={() => setMostrarPanelMovil(false)}
              >
                &#10005;
              </button>

              {/* BOTON OPCIONES DERECHA - abre drawer de opciones */}
              <button
                className="btn-opciones-movil"
                onClick={() => {
                  setMostrarOpcionesMovil(prev => !prev);
                  setMostrarPanelMovil(prev => !prev)}
                }
                aria-label="Opciones de ruta"
              >
                &#9881;
              </button>

            </div>

            {/* ---- VISTA RUTAS ---- */}
            {vistaDrawer === "rutas" && (
              <DrawerRutas
                setRutaSeleccionada={(ruta) => {
                  setRutaSeleccionada(ruta)
                  setVistaDrawer("puntos")
                }}
                setModoCercanos={setModoCercanos}
              />
            )}

            {/* ---- VISTA PUNTOS ---- */}
            {vistaDrawer === "puntos" && rutaSeleccionada && (
              <div className="menu-movil-seccion">

                {/* Navegacion interna del drawer */}
                <button
                  className="menu-movil-btn"
                  onClick={() => {
                    setRutaSeleccionada(null)
                    setModoNavegacion(false)
                    setModoBibliografia(false)
                    setModoCercanos(false)
                    setVistaDrawer("rutas")
                  }}
                >
                  ← Volver a rutas
                </button>

                <button
                  className="menu-movil-btn activo"
                  onClick={() => {
                    setModoNavegacion(true)
                    setSegmentoActual(0)
                    setMostrarPanelMovil(false)
                  }}
                >
                  Comenzar ruta
                </button>
                {rutaSeleccionada?.id!=="cercanos" && (
                  <button
                    className="menu-movil-btn"
                    onClick={() => setVistaDrawer("bibliografia")}
                  >
                    Ver bibliografia
                  </button>
                )}

                <p className="menu-movil-titulo-seccion" style={{ marginTop: 12 }}>
                  Puntos de la ruta
                </p>

                <DrawerPuntos
                  ruta={rutaSeleccionada}
                  mapRef={mapRef}
                  evitarPago={evitarPago}
                  ordenPuntos={ordenPuntos}
                  puntosRutaVirtual={
                    rutaSeleccionada?.id === "cercanos" ? ordenPuntos : null
                  }
                  onCerrar={() => setMostrarPanelMovil(false)}
                />

              </div>
            )}

            {/* ---- VISTA BIBLIOGRAFIA ---- */}
            {vistaDrawer === "bibliografia" && (
              <DrawerBibliografia
                ruta={rutaSeleccionada}
                onVolver={() => setVistaDrawer("puntos")}
              />
            )}

            {/* ---- VISTA CERCANOS ---- */}
            {vistaDrawer === "cercanos" && (
              <DrawerCercanos
                puntosCercanos={puntosCercanos}
                mapRef={mapRef}
                setModoCercanos={setModoCercanos}
                setPuntosCercanos={setPuntosCercanos}
                onPincharPunto={() => setMostrarPanelMovil(false)}
                onCerrar={() => {

                    setMostrarPanelMovil(false)
                    setModoNavegacion(false)
                    setRutaSeleccionada(null)
                    setModoCercanos(false)
                    setVistaDrawer("rutas")
                  }
                }
                onRutaCercanos={() => {
                    setModoCercanos(false)
                    setVistaDrawer("puntos")
                  }
                }
              />
            )}

          </div>
        </>
      )}

      {/* --------------------------------------------------- */}
      {/* DRAWER DERECHA - OPCIONES                           */}
      {/* --------------------------------------------------- */}

      {mostrarOpcionesMovil && (
        <>
          <div
            className="menu-movil-overlay"
            onClick={() => setMostrarOpcionesMovil(false)}
          />

          <div className="menu-movil-lateral menu-movil-lateral--derecha">

            <div className="menu-movil-header">
              <span>Opciones</span>
              <button
                className="menu-movil-cerrar"
                onClick={() => setMostrarOpcionesMovil(false)}
              >
                &#10005;
              </button>
            </div>

            <div className="menu-movil-seccion">
              <p className="menu-movil-titulo-seccion">Tipo de ruta</p>

              <button
                className={modoRuta === "optima" ? "menu-movil-btn activo" : "menu-movil-btn"}
                onClick={() => setModoRuta("optima")}
              >
                Ruta mas corta
              </button>

            </div>

            <div className="menu-movil-seccion">
              <p className="menu-movil-titulo-seccion">Filtros</p>

              <button
                className={evitarPago ? "menu-movil-btn activo pago" : "menu-movil-btn"}
                onClick={() => setEvitarPago(!evitarPago)}
              >
                {evitarPago ? "Mostrando sitios gratuitos" : "Sitios gratuitos"}
              </button>

              <button
                className={usarFiltroTiempo ? "menu-movil-btn activo peligro" : "menu-movil-btn"}
                onClick={() => setUsarFiltroTiempo(!usarFiltroTiempo)}
              >
                {usarFiltroTiempo ? `Tiempo: ${horasDisponibles}h activado` : "Filtrar por tiempo"}
              </button>

              {usarFiltroTiempo && (
                <select
                  className="menu-movil-select"
                  value={horasDisponibles}
                  onChange={(e) => setHorasDisponibles(Number(e.target.value))}
                >
                  <option value={1}>1 hora</option>
                  <option value={2}>2 horas</option>
                  <option value={3}>3 horas</option>
                  <option value={4}>4 horas</option>
                  <option value={5}>5 horas</option>
                  <option value={6}>6 horas</option>
                  <option value={7}>7 horas</option>
                </select>
              )}
            </div>

            {/* BOTON RECALCULAR - solo movil */}
            <div className="menu-movil-seccion">
              <p className="menu-movil-titulo-seccion">GPS</p>
              <button
                className="menu-movil-btn"
                onClick={() => mapRef.current?.recalcularPosicion?.()}
              >
                Recalcular posición
              </button>
            </div>

            <div className="menu-movil-seccion-admin">
              <button
                className="menu-movil-btn"
                onClick={() => navigate('/admin')}
              >
                Panel de administracion
              </button>
            </div>

          </div>
        </>
      )}

      {/* --------------------------------------------------- */}
      {/* CONTENIDO PRINCIPAL */}
      {/* --------------------------------------------------- */}

      <div className={mostrarPanel ? "main-layout" : "main-layout-full"}>

        {/* --------------------------------------------------- */}
        {/* CONTENEDOR DEL MAPA */}
        {/* --------------------------------------------------- */}

        <div className="map-container" style={{ width: mostrarPanel ? "calc(100vw - 250px)" : "100vw" }}>

          {/* -------------------------------- */}
          {/* DURACION APROXIMADA */}
          {/* -------------------------------- */}

          {!cargandoRuta && duracionRuta && rutaSeleccionada && !duracionCerrada && (
            <div className="duracion-ruta-box">
              Duracion aproximada de la ruta:
              <strong>{duracionRuta}</strong>
              <button
                className="cerrar-duracion"
                onClick={() => setDuracionCerrada(true)}  // ← antes era setDuracionRuta(null)
              >
                X
              </button>
            </div>
          )}

          {/* -------------------------------- */}
          {/* COMPONENTE MAPA */}
          {/* -------------------------------- */}

          <Mapa
            rutaSeleccionada={rutaSeleccionada}
            setRutaSeleccionada={setRutaSeleccionada}

            mapRef={mapRef}

            modoHistoriador={modoHistoriador}
            setModoHistoriador={setModoHistoriador}

            modoRuta={modoRuta}
            setRutasSegmentos={setRutasSegmentos}

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

          <div className="panel-derecha">

            {/* -------------------------------- */}
            {/* PANEL DE PUNTOS CERCANOS */}
            {/* -------------------------------- */}

            {modoCercanos && !rutaSeleccionada && (

              <PanelCercanos
                puntosCercanos={puntosCercanos}
                mapRef={mapRef}
                setModoCercanos={setModoCercanos}
                setPuntosCercanos={setPuntosCercanos}
              />

            )}

            {/* -------------------------------- */}
            {/* MENU PRINCIPAL DE RUTAS */}
            {/* -------------------------------- */}

            {!modoCercanos && !rutaSeleccionada && (

              <MenuRutas
                rutaSeleccionada={rutaSeleccionada}
                setRutaSeleccionada={setRutaSeleccionada}
                setModoCercanos={setModoCercanos}
              />

            )}

            {/* -------------------------------- */}
            {/* CONTENIDO CUANDO HAY RUTA */}
            {/* -------------------------------- */}

            {rutaSeleccionada && (

              <>

            {/* -------------------------------- */}
            {/* BOTONES PRINCIPALES */}
            {/* -------------------------------- */}

            <div className="columna-botones">

              {/* BOTON VOLVER */}
              <button
                className="btn-volver"
                onClick={() => {

                  setRutaSeleccionada(null)

                  setModoNavegacion(false)

                  setModoBibliografia(false)

                  setModoCercanos(false)

                }}
              >
                ← Volver
              </button>

              {/* BOTON COMENZAR RUTA */}
              {!modoNavegacion && !modoBibliografia && (

                <button
                  className="btn-start"
                  onClick={() => {

                    setModoNavegacion(true)

                    setSegmentoActual(0)

                  }}
                >
                  Comenzar ruta
                </button>

              )}

              {/* BOTON BIBLIOGRAFIA */}
              {!modoNavegacion && !modoBibliografia && rutaSeleccionada?.id !== "cercanos" && (

                <button
                  className="btn-start-bib"
                  onClick={() => setModoBibliografia(true)}
                >
                  Visualizar bibliografia
                </button>

              )}

              {/* VOLVER DESDE BIBLIOGRAFIA */}
              {modoBibliografia && (

                <button
                  className="btn-volver"
                  onClick={() => {
                    setModoBibliografia(false)
                  }}
                >
                  ← Volver a ruta
                </button>

              )}

            </div>

                {/* -------------------------------- */}
                {/* PANEL BIBLIOGRAFIA */}
                {/* -------------------------------- */}

                {modoBibliografia && (
                  <PanelBibliografia ruta={rutaSeleccionada} />
                )}



                {/* -------------------------------- */}
                {/* MENU DE PUNTOS */}
                {/* -------------------------------- */}

                {!modoNavegacion && !modoBibliografia && (

                  <MenuPuntos
                    ruta={rutaSeleccionada}
                    centrarEnPunto={centrarEnPunto}
                    mapRef={mapRef}
                    evitarPago={evitarPago}
                    ordenPuntos={ordenPuntos}

                    puntosRutaVirtual={
                      rutaSeleccionada?.id === "cercanos"
                        ? ordenPuntos
                        : null
                    }
                  />

                )}

                {/* -------------------------------- */}
                {/* PANEL DE NAVEGACION */}
                {/* -------------------------------- */}

                {modoNavegacion && !modoBibliografia && (

                <PanelRuta
                  rutasSegmentos={rutasSegmentos}

                  segmentoActual={segmentoActual}
                  setSegmentoActual={setSegmentoActual}

                  setModoNavegacion={setModoNavegacion}
                />

                )}

              </>

            )}

          </div>

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
        />
      )}

    </div>

  )
}

export default App
