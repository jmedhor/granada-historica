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
          <strong>Tiempo aproximado de visita: </strong>
          {punto.tiempo_visita || " Consultar en la página web"} {punto.tiempo_visita && " minutos"}
        </p>


        <p>
          <strong>Acerca de la accesibilidad: </strong>
          {punto.info_accesible || " Consultar en la página web"}
        </p>

        {/* Restaurantes y bares cercanos */}
        <a
          href={`https://www.google.com/maps/search/restaurantes+y+bares/@${punto.latitud},${punto.longitud},16z`}
          target="_blank"
          rel="noopener noreferrer"
          className="popup-link-mapa"
        >
          <span style={{ fontSize: "20px" }}>🍽️</span>
          <span>Restaurantes y bares cercanos</span>
        </a>


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
