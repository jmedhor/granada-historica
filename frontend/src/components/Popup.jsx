function PopupRuta({
  punto,
  ruta,
  modoHistoriador,
  setModoHistoriador,
  rutaSeleccionada,
  setRutaSeleccionada
}) {

  // -----------------------------------------
  // Popup que aparece al pulsar sobre un
  // marcador del mapa
  // -----------------------------------------

  return (
    <div className="popup-contenido">

      {/* Nombre del punto turistico */}
      <h3>{punto.nombre}</h3>

      {/* Descripcion historica */}
      {modoHistoriador && punto.descripcion && (
        <p>{punto.descripcion}</p>
      )}

      {/* Nombre de la ruta */}
      <p>
        <b>Ruta:</b> {ruta.nombre}
      </p>

      {/* Estado de acceso del lugar */}
      <p>

        <strong>Acceso:</strong>{" "}

        <span
          style={{
            color: punto.pago ? "red" : "green"
          }}
        >
          {punto.pago
            ? "De pago"
            : "Gratis"}
        </span>

      </p>

      {/* Enlace externo con mas informacion */}
      {punto.url && (

        <p>

          <a
            href={punto.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#0077cc",
              textDecoration: "underline"
            }}
          >
            Mas informacion
          </a>

        </p>

      )}



      {/* Activar o desactivar modo historiador */}
      <label className="popup-toggle">

        Modo Historiador

        <input
          type="checkbox"
          checked={modoHistoriador}

          onChange={() =>
            setModoHistoriador(!modoHistoriador)
          }
        />

      </label>

      {/* BOTON PARA INICIAR RUTA */}
      {!rutaSeleccionada && (
        <button
          className="btn-popup-ruta"
          onClick={() => {

            setRutaSeleccionada({
              id: punto.ruta_id,
              nombre: punto.ruta_nombre
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
