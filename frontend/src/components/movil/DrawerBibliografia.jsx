// ---------------------------------------------------
// DRAWER MOVIL - BIBLIOGRAFIA DE UNA RUTA
// Equivalente movil de PanelBibliografia
// Props:
//   ruta     - ruta seleccionada con su bibliografia
//   onVolver - vuelve a la vista de puntos
// ---------------------------------------------------

function DrawerBibliografia({ ruta, onVolver }) {

  // -----------------------------------------
  // Sin ruta seleccionada
  // -----------------------------------------

  if (!ruta) return null

  // -----------------------------------------
  // Convertir texto en array de referencias
  // -----------------------------------------

  const lineas = ruta.bibliografia
    ? ruta.bibliografia
        .split('\n')
        .filter(linea => linea.trim() !== '')
    : []

  // -----------------------------------------
  // Render
  // -----------------------------------------

  return (
    <div className="menu-movil-seccion">

      <button
        className="menu-movil-btn"
        onClick={onVolver}
      >
        ← Volver a puntos
      </button>

      <p className="menu-movil-titulo-seccion">
        {lineas.length} referencias
      </p>

      {lineas.length === 0 ? (

        <p style={{ fontSize: 13, color: '#999', margin: '8px 0' }}>
          No hay bibliografia disponible para esta ruta
        </p>

      ) : (

        lineas.map((linea, index) => (
          <div
            key={index}
            className="menu-movil-btn"
            style={{ cursor: 'default', fontSize: 12, lineHeight: 1.4 }}
          >
            <span style={{ opacity: 0.5, marginRight: 8, fontWeight: 700 }}>
              {index + 1}.
            </span>
            {linea}
          </div>
        ))

      )}

    </div>
  )
}

export default DrawerBibliografia
