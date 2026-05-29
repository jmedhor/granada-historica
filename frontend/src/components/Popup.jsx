function PopupRuta({
  punto,
  ruta,
  rutaSeleccionada,
  setRutaSeleccionada,
  setModoPopup,
  abrirInformacion
}) {

  // -----------------------------------------
  // Popup que aparece al pulsar sobre un
  // marcador del mapa
  // -----------------------------------------

  return (
    <div className="popup-contenido">

      {/* Nombre del punto turistico */}
      <h2 className="popup-titulo">
        {punto.nombre}
      </h2>

      {/* Subtitulo con el nombre de la ruta */}
      <p className="popup-subtitulo">
        {ruta.nombre || "Punto sin ruta asignada"}
      </p>

      {/* Descripcion historica */}
      {punto.descripcion && (
        <p>{punto.descripcion}</p>
      )}

      {/* Mostrar solo si la entrada es gratuita */}
      {!punto.pago && (
        <p className="popup-gratis">
          Entrada gratuita
        </p>
      )}

      {/* Boton que lleva a viñeta informativa */}
      <button
        className="popup-btn-info"
        onClick={() => {
          abrirInformacion(punto)
        }}
      >
        Mas informacion
      </button>


      {/* BOTON PARA INICIAR RUTA */}
      {punto.ruta_id && !rutaSeleccionada && (
        <button
          className="btn-popup-ruta"
          onClick={() => {

            setRutaSeleccionada({
              id: punto.ruta_id,
              nombre: punto.ruta_nombre,
              color: punto.ruta_color
            })

          }}
        >
          Comenzar ruta
        </button>
      )}

    </div>
  )
}

export default PopupRuta
