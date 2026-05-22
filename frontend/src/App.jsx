import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import './App.css'

import logoUGR from '../assets/logo-ugr.png'

import Mapa from './components/Map.jsx'
import MenuRutas from './components/MenuRutas.jsx'
import MenuPuntos from './components/MenuPuntos.jsx'
import PanelRuta from './components/PanelRuta.jsx'
import PanelBibliografia from './components/PanelBibliografia.jsx'
import PanelCercanos from './components/PanelCercanos.jsx'

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
  // Actualmente siempre esta activo
  const [mostrarPanel, setMostrarPanel] = useState(true)

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

  // Modo para superadministrador
  const [modoSuperadmin, setModoSuperadmin] = useState(false)

  // Modo para administrador historico
  const [modoAdminHistorico, setModoAdminHistorico] = useState(false)

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
  // RENDER PRINCIPAL
  // ---------------------------------------------------

  return (

    <div className="App">

      {/* --------------------------------------------------- */}
      {/* HEADER SUPERIOR */}
      {/* --------------------------------------------------- */}

      <header className="app-header">

        {/* TITULO PRINCIPAL */}
        <div className="header-left">

          <h1 className="titulo-app">
            NazaRoute
          </h1>

          <span className="subtitulo-app">
            Rutas historicas por la ciudad de Granada
          </span>

        </div>

        {/* CONTROLES CENTRALES */}
        <div className="header-right">

          <button
            className="btn-admin"
            onClick={() => navigate('/admin')}
          >
            Admin
          </button>


          <div className="selector-ruta">

            {/* -------------------------------- */}
            {/* BOTONES DE TIPO DE RUTA */}
            {/* -------------------------------- */}

            <div className="toggle-group">

              <button
                className={modoRuta === "optima" ? "toggle active" : "toggle"}
                onClick={() => setModoRuta("optima")}
              >
                Ruta mas corta
              </button>

              <button
                className={modoRuta === "historica" ? "toggle active" : "toggle"}
                onClick={() => setModoRuta("historica")}
              >
                Ruta historica (UGR)
              </button>

              {/* -------------------------------- */}
              {/* BOTON EVITAR PAGO */}
              {/* -------------------------------- */}

              <button
                className={evitarPago ? "toggle danger active" : "toggle danger"}
                onClick={() => setEvitarPago(!evitarPago)}
              >
                Evitar lugares de pago
              </button>

              {/* ------------------------------------------------ */}
              {/* FILTRO DE TIEMPO DISPONIBLE */}
              {/* ------------------------------------------------ */}

              <div className="toggle-group">

                <button
                  className={
                    usarFiltroTiempo
                      ? "toggle danger active"
                      : "toggle danger"
                  }
                  onClick={() =>
                    setUsarFiltroTiempo(!usarFiltroTiempo)
                  }
                >
                  ⏱️ Tengo {horasDisponibles}h disponibles
                </button>

                {usarFiltroTiempo && (
                  <select
                    className="toggle"
                    value={horasDisponibles}
                    onChange={(e) =>
                      setHorasDisponibles(
                        Number(e.target.value)
                      )
                    }
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



        {/* --------------------------------------------------- */}
        {/* BLOQUE UGR */}
        {/* --------------------------------------------------- */}

        <div className="header-ugr">

          <a href="https://www.ugr.es">

            <img
              src={logoUGR}
              alt="Universidad de Granada"
              className="logo-ugr"
            />

          </a>

        </div>

      </header>

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

          {!cargandoRuta && duracionRuta && rutaSeleccionada && (

            <div className="duracion-ruta-box">

              ⏱️ Duracion aproximada de la ruta:

              <strong>
                {duracionRuta}
              </strong>

              <button
                className="cerrar-duracion"
                onClick={() => setDuracionRuta(null)}
              >
                ✖
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
            ? "Ocultar"
            : "Mostrar"}

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
                  🧭 Comenzar ruta
                </button>

              )}

              {/* BOTON BIBLIOGRAFIA */}
              {!modoNavegacion && !modoBibliografia && (

                <button
                  className="btn-start-bib"
                  onClick={() => setModoBibliografia(true)}
                >
                  📚 Visualizar bibliografia
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

    </div>

  )
}

export default App
