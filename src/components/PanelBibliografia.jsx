function PanelBibliografia({ ruta }) {

  if (!ruta) {
    return (
      <div className="panel-ruta">
        <h3>📚 Bibliografía</h3>
        <p>Selecciona una ruta</p>
      </div>
    )
  }

  // 🔥 Convertimos string → array de líneas
  const lineas = ruta.bibliografia
    ? ruta.bibliografia.split("\n").filter(linea => linea.trim() !== "")
    : []

  return (
    <div className="panel-bibliografia">
      <h3>📚 Bibliografía</h3>

      {lineas.length === 0 ? (
        <p>No hay información disponible</p>
      ) : (
        <ul>
          {lineas.map((linea, index) => (
            <li key={index}>
              <span className="paso-bib">{index + 1}</span>
              <span className="paso-texto">{linea}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default PanelBibliografia
