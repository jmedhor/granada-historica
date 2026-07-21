import MenuRutas from '../MenuRutas.jsx'
import MenuPuntos from '../MenuPuntos.jsx'
import PanelRuta from '../PanelRuta.jsx'
import PanelBibliografia from '../PanelBibliografia.jsx'
import PanelCercanos from '../PanelCercanos.jsx'

// ---------------------------------------------------
// PANEL DERECHO - solo escritorio
// Muestra, segun el estado: puntos cercanos, menu de
// rutas, o el contenido de la ruta seleccionada
// (botones, bibliografia, puntos, navegacion)
// ---------------------------------------------------

function PanelDerecho({

  modoCercanos,
  setModoCercanos,

  puntosCercanos,
  setPuntosCercanos,

  radioMetros,

  rutaSeleccionada,
  setRutaSeleccionada,

  modoNavegacion,
  setModoNavegacion,

  modoBibliografia,
  setModoBibliografia,

  setSegmentoActual,

  mapRef,
  evitarPago,
  ordenPuntos,

  centrarEnPunto,

  rutasSegmentos,
  segmentoActual,

}) {

  return (

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
          radioMetros={radioMetros}
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

  )
}

export default PanelDerecho
