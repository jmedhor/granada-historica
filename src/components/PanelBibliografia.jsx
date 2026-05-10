function PanelBibliografia({ ruta }) {

  // -----------------------------------------
  // Si no hay ruta seleccionada mostramos
  // un mensaje informativo
  // -----------------------------------------

  if (!ruta) {

    return (
      <div className="panel-bibliografia">

        <h3>📚 Bibliografia</h3>

        <p>Selecciona una ruta</p>

      </div>
    )
  }

  // -----------------------------------------
  // Convertir el texto de bibliografia en
  // un array separado por saltos de linea
  // -----------------------------------------

  const lineas = ruta.bibliografia
    ? ruta.bibliografia
        .split("\n")
        .filter(linea => linea.trim() !== "")
    : []

  // -----------------------------------------
  // Render del panel de bibliografia
  // -----------------------------------------

  return (
    <div className="panel-bibliografia">

      {/* Titulo */}
      <h3>📚 Bibliografia</h3>

      {/* Si no hay bibliografia */}
      {lineas.length === 0 ? (

        <p>No hay informacion disponible</p>

      ) : (

        // Lista de referencias bibliograficas
        <ul>

          {lineas.map((linea, index) => (

            <li key={index}>

              {/* Numero de referencia */}
              <span className="paso-bib">
                {index + 1}
              </span>

              {/* Texto bibliografico */}
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
