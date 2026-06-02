// ---------------------------------------------------
// NAVEGACION MOVIL - BARRA INFERIOR DE CONTROLES
// Muestra solo los controles de tramo sin lista de pasos
// Props:
//   rutasSegmentos    - array de segmentos OSRM
//   segmentoActual    - indice del tramo activo
//   setSegmentoActual - actualiza el tramo activo
//   setModoNavegacion - desactiva la navegacion
// ---------------------------------------------------
import { useState, useEffect, useRef } from "react"
import {
  traducirManiobra,
  iconoManiobra,
  coordFinalStep,
  formatearDistancia
} from "../../utils/navegacion.js"
import { calcularDistanciaMetros } from "../../utils/distancia.js"

// ---------------------------------------------------
// UMBRAL EN METROS PARA AVANZAR AL SIGUIENTE STEP
// ---------------------------------------------------
const UMBRAL_AVANCE = 20

function DrawerNavegacion({
  rutasSegmentos,
  segmentoActual,
  setSegmentoActual,
  setModoNavegacion,
  userLocation,
}) {

  const [stepActual, setStepActual]   = useState(0)
  const [animando, setAnimando]       = useState(false)
  const stepRef = useRef(stepActual)

  // Mantén ref sincronizada para usarla en el efecto GPS
  useEffect(() => {
    stepRef.current = stepActual
  }, [stepActual])

  // Resetea el step al cambiar de segmento
  useEffect(() => {
    cambiarStep(0, false)
  }, [segmentoActual])

  // ---------------------------------------------------
  // CAMBIA DE STEP CON ANIMACION OPCIONAL
  // ---------------------------------------------------

  const cambiarStep = (nuevoStep, conAnimacion = true) => {
    if (conAnimacion) {
      setAnimando(true)
      setTimeout(() => setAnimando(false), 600)
    }
    setStepActual(nuevoStep)
  }

  // ---------------------------------------------------
  // DETECCION GPS: avanza step automaticamente
  // ---------------------------------------------------

  useEffect(() => {
    if (!userLocation || !rutasSegmentos) return

    const segmento = rutasSegmentos[segmentoActual]
    if (!segmento) return

    const steps = segmento.steps
    const step  = steps[stepRef.current]
    if (!step) return

    const fin = coordFinalStep(step)
    if (!fin) return

    const dist = calcularDistanciaMetros(
      userLocation.lat, userLocation.lon,
      fin.lat, fin.lon
    )

    // Si el usuario está a menos de UMBRAL_AVANCE metros del final del step
    if (dist <= UMBRAL_AVANCE) {
      const siguienteStep = stepRef.current + 1

      if (siguienteStep < steps.length) {
        // Hay más steps en este leg → avanza step
        cambiarStep(siguienteStep)
      } else {
        // Fin del leg → avanza al siguiente segmento si existe
        if (segmentoActual < rutasSegmentos.length - 1) {
          setSegmentoActual(prev => prev + 1)
        }
      }
    }

  }, [userLocation])

  // ---------------------------------------------------
  // RENDER
  // ---------------------------------------------------

  if (!rutasSegmentos || rutasSegmentos.length === 0) return null

  const segmento    = rutasSegmentos[segmentoActual]
  if (!segmento) return null

  const steps       = segmento.steps
  const step        = steps[stepActual]
  if (!step) return null

  const icono       = iconoManiobra(step.maneuver.type, step.maneuver.modifier)
  const texto       = traducirManiobra(step.maneuver.type, step.maneuver.modifier, step.name)
  const distancia   = formatearDistancia(step.distance || 0)
  const esUltimoSeg = segmentoActual === rutasSegmentos.length - 1
  const esUltimoStep = stepActual === steps.length - 1

  // Step siguiente (para previsualización)
  const stepSig     = steps[stepActual + 1]

  return (
    <div className="nav-movil-barra">

      {/* ------------------------------------------------ */}
      {/* INSTRUCCION PRINCIPAL                            */}
      {/* ------------------------------------------------ */}
      <div className={`nav-instruccion ${animando ? "nav-instruccion--nueva" : ""}`}>

        <div className="nav-instruccion-icono">{icono}</div>

        <div className="nav-instruccion-texto">
          <span className="nav-instruccion-accion">
            {texto}
            <span className="nav-instruccion-distancia">
              {" · "}{distancia}
            </span>
          </span>
        </div>

      </div>

      {/* ------------------------------------------------ */}
      {/* SIGUIENTE PASO (previsualización)OMITIDO POR AHORA*/}
      {/* ------------------------------------------------ */}
      {stepSig && (
        <div className="nav-siguiente-paso">
          <span className="nav-siguiente-label">Después:</span>
          <span className="nav-siguiente-texto">
            {iconoManiobra(stepSig.maneuver.type, stepSig.maneuver.modifier)}
            {" "}
            {traducirManiobra(stepSig.maneuver.type, stepSig.maneuver.modifier, stepSig.name)}
          </span>
        </div>
      )}

      {/* ------------------------------------------------ */}
      {/* BARRA DE PROGRESO DEL LEG                        */}
      {/* ------------------------------------------------ */}
      <div className="nav-progreso-barra">
        <div
          className="nav-progreso-relleno"
          style={{ width: `${((stepActual + 1) / steps.length) * 100}%` }}
        />
      </div>
      <div className="nav-progreso-texto">
        Paso {stepActual + 1} de {steps.length}
        {" · "}
        Punto {segmentoActual + 1} de {rutasSegmentos.length}
      </div>

      {/* ------------------------------------------------ */}
      {/* CONTROLES MANUALES                               */}
      {/* ------------------------------------------------ */}
      <div className="nav-movil-top">

        <button
          className="nav-movil-btn"
          disabled={stepActual === 0 && segmentoActual === 0}
          onClick={() => {
            if (stepActual > 0) {
              cambiarStep(stepActual - 1)
            } else if (segmentoActual > 0) {
              setSegmentoActual(prev => prev - 1)
            }
          }}
        >
          ← Anterior
        </button>

        <button
          className="nav-movil-btn nav-movil-btn--finalizar"
          onClick={() => setModoNavegacion(false)}
        >
          Finalizar
        </button>

        <button
          className="nav-movil-btn"
          disabled={esUltimoSeg && esUltimoStep}
          onClick={() => {
            if (!esUltimoStep) {
              cambiarStep(stepActual + 1)
            } else if (!esUltimoSeg) {
              setSegmentoActual(prev => prev + 1)
            }
          }}
        >
          Siguiente →
        </button>

      </div>

    </div>
  )
}

export default DrawerNavegacion
