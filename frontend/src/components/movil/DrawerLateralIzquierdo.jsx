import DrawerRutas from './DrawerRutas.jsx'
import DrawerPuntos from './DrawerPuntos.jsx'
import DrawerBibliografia from './DrawerBibliografia.jsx'
import DrawerCercanos from './DrawerCercanos.jsx'

// ---------------------------------------------------
// DRAWER IZQUIERDA - RUTAS, PUNTOS, NAVEGACION, CERCANOS
// Solo movil
// ---------------------------------------------------

function DrawerLateralIzquierdo({

  mostrarPanelMovil,
  setMostrarPanelMovil,

  setMostrarOpcionesMovil,

  vistaDrawer,
  setVistaDrawer,

  rutaSeleccionada,
  setRutaSeleccionada,

  setModoNavegacion,
  setModoBibliografia,
  setModoCercanos,

  setSegmentoActual,

  mapRef,
  evitarPago,
  ordenPuntos,

  puntosCercanos,
  setPuntosCercanos,
  radioMetros,

}) {

  if (!mostrarPanelMovil) return null

  return (
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
            radioMetros={radioMetros}
          />
        )}

      </div>
    </>
  )
}

export default DrawerLateralIzquierdo
