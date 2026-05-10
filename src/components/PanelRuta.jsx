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

function PanelRuta({ rutasSegmentos }) {

  // -----------------------------------------
  // Si no hay segmentos de ruta cargados
  // mostramos mensaje informativo
  // -----------------------------------------

  if (!rutasSegmentos || rutasSegmentos.length === 0) {

    return (
      <div className="panel-ruta">

        <h3>🧭 Ruta</h3>

        <p>Selecciona una ruta</p>

      </div>
    )
  }

  // -----------------------------------------
  // Contador global de pasos para numerar
  // todas las instrucciones
  // -----------------------------------------

  let pasoGlobal = 1

  // -----------------------------------------
  // Render del panel de navegacion
  // -----------------------------------------

  return (
    <div className="panel-ruta">

      {/* Titulo */}
      <h3>🧭 Pasos de la ruta</h3>

      <ul>

        {/* Recorrer todos los segmentos */}
        {rutasSegmentos.map((leg, i) =>

          // Recorrer todos los pasos del segmento
          leg.steps.map((step, j) => {

            // -----------------------------------------
            // Texto principal de la instruccion
            // -----------------------------------------

            const texto = `
              ${traducirManiobra(
                step.maneuver.type,
                step.maneuver.modifier
              )}
              ${step.name || ""}
            `

            // -----------------------------------------
            // Distancia aproximada del paso
            // -----------------------------------------

            const distancia = step.distance
              ? `(${Math.round(step.distance)} m)`
              : ""

            // -----------------------------------------
            // Render de cada paso
            // -----------------------------------------

            return (
              <li key={`${i}-${j}`}>

                {/* Numero del paso */}
                <span className="paso-num">
                  {pasoGlobal++}
                </span>

                {/* Texto de la instruccion */}
                <span className="paso-texto">

                  {texto} {distancia}

                </span>

              </li>
            )
          })
        )}

      </ul>

    </div>
  )
}

export default PanelRuta
