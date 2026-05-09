import { useState, useRef } from 'react'
import './App.css'
import logoUGR from './assets/logo-ugr.png'
import Mapa from './components/Map.jsx'
import MenuRutas from './components/MenuRutas.jsx'
import MenuPuntos from './components/MenuPuntos.jsx'
import PanelRuta from './components/PanelRuta.jsx'
import PanelBibliografia from './components/PanelBibliografia.jsx'

function App() {
  const [rutaSeleccionada, setRutaSeleccionada] = useState(null)
  const mapRef = useRef()
  const [modoHistoriador, setModoHistoriador] = useState(false)
  const [modoRuta, setModoRuta] = useState("optima")
  const [rutasSegmentos, setRutasSegmentos] = useState([])
  const [mostrarPuntos, setMostrarPuntos] = useState(false)
  const [modoNavegacion, setModoNavegacion] = useState(false)
  const [evitarPago, setEvitarPago] = useState(false)
  const [mostrarPanel, setMostrarPanel] = useState(true)
  const [modoBibliografia, setModoBibliografia] = useState(false)
  const [ordenPuntos, setOrdenPuntos] = useState([])

  // función para centrar en un punto desde MenuPuntos
  const centrarEnPunto = (punto) => {
    if (!mapRef.current) return

    mapRef.current.flyTo(
      [punto.latitud, punto.longitud],
      16,
      { duration: 1.2 }
    )
  }

  return (

//--------

    <div className="App">

      {/* HEADER */}
      <header className="app-header">
        <div className="header-left">
          <h1 className="titulo-app">NazaRoute</h1>
          <span className="subtitulo-app">
            Rutas históricas por la ciudad de Granada
          </span>
        </div>

        <div className="header-right">

          <div className="selector-ruta">

            {/* MODO RUTA */}
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
                Ruta histórica (UGR)
              </button>
            </div>

            {/* EVITAR PAGO */}
            <div className="toggle-group">
              <button
                className={evitarPago ? "toggle danger active" : "toggle danger"}
                onClick={() => setEvitarPago(!evitarPago)}
              >
                Evitar lugares de pago
              </button>
            </div>

          </div>
        </div>

      <div className="header-ugr">
        <span>Bibliografía y datos aportados por la</span>

        <a href="https://www.ugr.es">
          <img
            src={logoUGR}
            alt="Universidad de Granada"
            className="logo-ugr"
          />
        </a>
      </div>

      </header>

      {/* MAIN */}
      <div className={mostrarPanel ? "main-layout" : "main-layout-full"}>
        {/* MAPA */}
        <div className="map-container">
          <Mapa
            rutaSeleccionada={rutaSeleccionada}
            mapRef={mapRef}
            modoHistoriador={modoHistoriador}
            setModoHistoriador={setModoHistoriador}
            modoRuta={modoRuta}
            setRutasSegmentos={setRutasSegmentos}
            evitarPago={evitarPago}
            ordenPuntos={ordenPuntos}
            setOrdenPuntos={setOrdenPuntos}
          />
        </div>

        {/* PANEL DERECHO ÚNICO */}
      {mostrarPanel && (
        <div className="panel-derecha">
          {/* SIN RUTA */}
          {!rutaSeleccionada && (
            <MenuRutas
              rutaSeleccionada={rutaSeleccionada}
              setRutaSeleccionada={setRutaSeleccionada}
            />
          )}

          {/* CON RUTA */}
          {rutaSeleccionada && (
            <>
              {/* FILA SUPERIOR DE BOTONES */}
              <div className="fila-botones">

                <button
                  className="btn-volver"
                  onClick={() => {
                    setRutaSeleccionada(null)
                    setModoNavegacion(false)
                    setModoBibliografia(false)
                  }}
                >
                  ← Volver
                </button>

              {!modoNavegacion && !modoBibliografia && (
                <button
                  className="btn-start"
                  onClick={() => setModoBibliografia(true)}
                >
                  📚 Visualizar bibliografía
                </button>
              )}

              {modoBibliografia && (

                <button
                  className="btn-volver"
                  onClick={() => {
                    if (modoBibliografia) {
                      setModoBibliografia(false)
                    } else {
                      setRutaSeleccionada(null)
                      setModoNavegacion(false)
                    }
                  }}
                >
                  ← Volver a ruta
                </button>

              )}

              </div>

              {/* MODO BIBLIOGRAFÍA */}
              {modoBibliografia && (
                <PanelBibliografia ruta={rutaSeleccionada} />
              )}



              {/* MODO PUNTOS */}
              {!modoNavegacion && !modoBibliografia && (
                <MenuPuntos
                  ruta={rutaSeleccionada}
                  centrarEnPunto={centrarEnPunto}
                  mapRef={mapRef}
                  evitarPago={evitarPago}
                  ordenPuntos={ordenPuntos}
                />
              )}

              {/* MODO NAVEGACIÓN */}
              {modoNavegacion && !modoBibliografia && (
                <PanelRuta rutasSegmentos={rutasSegmentos} />
              )}

            </>
          )}

        </div>
        )}

      </div>
    </div>
//------------------

  )
}

export default App
