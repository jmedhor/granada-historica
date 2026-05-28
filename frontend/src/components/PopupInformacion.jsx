function PopupInformacion({
  punto,
  ruta,
  modoHistoriador,
  setModoHistoriador,
  setModoPopup,
  volverARuta
}) {

  // -----------------------------------------
  // Popup informativo extendido
  // -----------------------------------------

  return (
    <div className="popup-contenido popup-informacion">

      {/* Titulo */}
      <h2 className="popup-titulo">
        {punto.nombre}
      </h2>

      {/* Subtitulo ruta */}
      <p className="popup-subtitulo">
        {ruta.nombre}
      </p>

      {/* Imagen  */}
      {punto.imagen && (
        <div className="popup-imagen">
          <img src={punto.imagen} alt={punto.nombre} />
        </div>
      )}

      {/* Descripcion historica (controlada por historiador) */}
      {punto.descripcion && (
        <p className="popup-descripcion">
          {punto.descripcion}
        </p>
      )}

      {/* Descripcion extendida  */}
      {modoHistoriador && punto.descripcion_extensa && (
        <p className="popup-descripcion">
          {punto.descripcion_extensa}
        </p>
      )}

      {/* Informacion de pago */}
      <div className="popup-info-extra">

        <p>
          <strong>Cuesta:</strong>{" "}
          {punto.pago
            ? `${punto.importe || "Consultar precio"} €`
            : "Entrada gratuita"}
        </p>

        <p>
          <strong>Abre durante:</strong>{" "}
          {punto.horario || "Consultar en la página web"}
        </p>


        <p>
          <strong>Tiempo aproximado de visita:</strong>
          {punto.tiempo_visita || " Consultar en la página web"} {punto.tiempo_visita && " minutos"}
        </p>


        {punto.info_accesible && (
          <p className="accesible">
            Es accesible (adaptado)
          </p>
        )}


      </div>

      {/* Enlace externo */}
      {punto.url && (
        <p>
          <a
            href={punto.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Visitar sitio web
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


    <button
    onClick={() => volverARuta(punto)}
    >
    Volver
    </button>

    </div>
  )
}

export default PopupInformacion
