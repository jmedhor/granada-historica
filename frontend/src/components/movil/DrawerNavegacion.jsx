// ---------------------------------------------------
// NAVEGACION MOVIL - BARRA INFERIOR DE CONTROLES
// Muestra solo los controles de tramo sin lista de pasos
// Props:
//   rutasSegmentos    - array de segmentos OSRM
//   segmentoActual    - indice del tramo activo
//   setSegmentoActual - actualiza el tramo activo
//   setModoNavegacion - desactiva la navegacion
// ---------------------------------------------------

function DrawerNavegacion({
  rutasSegmentos,
  segmentoActual,
  setSegmentoActual,
  setModoNavegacion,
}) {

  if (!rutasSegmentos || rutasSegmentos.length === 0) return null

  return (
    <div className="nav-movil-barra">

      <div className="nav-movil-top">

        {/* ANTERIOR */}
        <button
          className="nav-movil-btn"
          disabled={segmentoActual === 0}
          onClick={() =>
            setSegmentoActual(prev => Math.max(prev - 1, 0))
          }
        >
          ← Anterior
        </button>

        {/* PROGRESO */}
        <span className="nav-movil-progreso">
          {segmentoActual + 1} / {rutasSegmentos.length}
        </span>

        {/* SIGUIENTE */}
        <button
          className="nav-movil-btn"
          disabled={segmentoActual === rutasSegmentos.length - 1}
          onClick={() =>
            setSegmentoActual(prev =>
              Math.min(prev + 1, rutasSegmentos.length - 1)
            )
          }
        >
          Siguiente →
        </button>

      </div>

      {/* FINALIZAR */}
      <button
        className="nav-movil-btn nav-movil-btn--finalizar"
        onClick={() => setModoNavegacion(false)}
      >
        Finalizar
      </button>

    </div>
  )
}

export default DrawerNavegacion
