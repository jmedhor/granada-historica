function PanelBibliografia({ ruta }) {

  // -----------------------------------------
  // SI NO HAY RUTA
  // -----------------------------------------

  if (!ruta) {

    return (

      <div className="panel-bibliografia">

        <h3>📚 Bibliografía</h3>

        <div className="no-cercanos">
          Selecciona una ruta para visualizar
          sus referencias bibliográficas
        </div>

      </div>

    )
  }

  // -----------------------------------------
  // CONVERTIR TEXTO EN ARRAY
  // -----------------------------------------

  const lineas = ruta.bibliografia

    ? ruta.bibliografia
        .split("\n")
        .filter(
          linea => linea.trim() !== ""
        )

    : []

  // -----------------------------------------
  // RENDER
  // -----------------------------------------

  return (

    <div className="panel-bibliografia">

      {/* TITULO */}
      <h3>📚 Bibliografía</h3>

      {/* CONTADOR */}
      <div className="info-punto">
        {lineas.length} referencias
      </div>

      {/* SI NO HAY DATOS */}
      {lineas.length === 0 ? (

        <div className="no-cercanos">
          No hay información bibliográfica
          disponible para esta ruta
        </div>

      ) : (

        <ul>

          {lineas.map((linea, index) => (

            <li key={index}>

              {/* NUMERO */}
              <span className="paso-bib">
                {index + 1}
              </span>

              {/* TEXTO */}
              <span className="paso-texto">
                {linea}
              </span>

            </li>

          ))}

        </ul>

      )}

    </div>

  )
}

export default PanelBibliografia
