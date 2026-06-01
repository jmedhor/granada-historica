// -----------------------------------------
// Traducir maniobras proporcionadas por
// OSRM a instrucciones en español
// -----------------------------------------

function traducirManiobra(tipo, modifier) {

  // Inicio de ruta
  if (tipo === "depart") {
    return "Sal"
  }

  // Final de ruta
  if (tipo === "arrive") {
    return "Has llegado"
  }

  // Giros
  if (tipo === "turn") {

    if (modifier === "left") {
      return "Gira a la izquierda"
    }

    if (modifier === "right") {
      return "Gira a la derecha"
    }

    if (modifier === "straight") {
      return "Sigue recto"
    }
  }

  // Rotonda
  if (tipo === "roundabout") {
    return "En la rotonda"
  }

  // Incorporacion
  if (tipo === "merge") {
    return "Incorporate"
  }

  // Caso por defecto
  return "Continua"
}


// -----------------------------------------
// PANEL DE NAVEGACION PASO A PASO
// -----------------------------------------

function PanelRuta({

  rutasSegmentos,

  segmentoActual,
  setSegmentoActual,

  setModoNavegacion

}) {

  // -----------------------------------------
  // Si no hay segmentos
  // -----------------------------------------

  if (!rutasSegmentos || rutasSegmentos.length === 0) {

    return (
      <div className="panel-ruta">

        <h3>Navegación</h3>

        <p>Selecciona una ruta para comenzar</p>

      </div>
    )
  }

  // -----------------------------------------
  // Segmento actual
  // -----------------------------------------

  const segmento = rutasSegmentos[segmentoActual]

  if (!segmento) {
    return null
  }

  // -----------------------------------------
  // UI
  // -----------------------------------------

  return (

    <div className="panel-ruta">

      {/* ------------------------------------------------- */}
      {/* CONTROLES SUPERIORES */}
      {/* ------------------------------------------------- */}

      <div className="controles-ruta">

        {/* ANTERIOR SEGMENTO */}
        <button
          className="btn-anterior"
          disabled={segmentoActual === 0}
          onClick={() => {

            setSegmentoActual(prev => Math.max(prev - 1, 0))

          }}
        >
          ← Paso anterior
        </button>

        {/* SIGUIENTE SEGMENTO */}
        <button
          className="btn-siguiente"
          disabled={segmentoActual === rutasSegmentos.length - 1}
          onClick={() => {

            setSegmentoActual(prev =>
              Math.min(prev + 1, rutasSegmentos.length - 1)
            )

          }}
        >
          Paso →  siguiente
        </button>

      </div>


      {/* FINALIZAR */}
      <button
        className="btn-finalizar-ruta"
        onClick={() => {
          setModoNavegacion(false)
        }}
      >
        Finalizar ruta
      </button>

      {/* ------------------------------------------------- */}
      {/* INDICADOR DE PROGRESO ENTRE PUNTOS */}
      {/* ------------------------------------------------- */}

      <div className="info-punto">
        Punto {segmentoActual} → {segmentoActual + 1} de {rutasSegmentos.length}
      </div>


      {/* ------------------------------------------------- */}
      {/* PASOS DEL SEGMENTO ACTUAL */}
      {/* ------------------------------------------------- */}

      <ul>

        {segmento.steps.map((step, index) => {

          const texto = `
            ${traducirManiobra(
              step.maneuver.type,
              step.maneuver.modifier
            )}
            ${step.name || ""}
          `

          const distancia = step.distance
            ? `(${Math.round(step.distance)} m)`
            : ""

          return (

            <li key={index}>

              <span className="paso-num">
                {index + 1}
              </span>

              <span className="paso-texto">
                {texto} {distancia}
              </span>

            </li>

          )
        })}

      </ul>

    </div>

  )
}

export default PanelRuta
