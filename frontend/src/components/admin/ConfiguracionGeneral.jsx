import { useState, useEffect } from "react"
import { getConfiguracion, updateConfiguracion } from "../../services/api.js"

function ConfiguracionGeneral() {

  const [radio, setRadio] = useState(500)
  const [guardado, setGuardado] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  // ---------------------------------------------------
  // CARGAR VALOR ACTUAL
  // ---------------------------------------------------

  useEffect(() => {
    getConfiguracion('radio_cercanos')
      .then(valor => {
        setRadio(Number(valor))
        setCargando(false)
      })
      .catch(() => {
        setError("Error al cargar la configuración")
        setCargando(false)
      })
  }, [])

  // ---------------------------------------------------
  // GUARDAR
  // ---------------------------------------------------

  const guardar = async () => {
    if (radio < 100 || radio > 1000) return
    try {
      await updateConfiguracion('radio_cercanos', radio)
      setGuardado(true)
      setTimeout(() => setGuardado(false), 2500)
    } catch {
      setError("Error al guardar")
    }
  }

  // ---------------------------------------------------
  // RENDER
  // ---------------------------------------------------

  if (cargando) return <p className="admin-cargando">Cargando configuración...</p>

  return (
    <div className="config-general">

      <h2 className="config-titulo">Configuración general</h2>

      {error && <p className="admin-error">{error}</p>}

      {/* ---- TARJETA RADIO ---- */}
      <div className="config-card">

        <div className="config-card-header">
          <span className="config-card-icono">📍</span>
          <div>
            <h3 className="config-card-titulo">Radio puntos cercanos</h3>
            <p className="config-card-desc">
              Distancia máxima en metros para mostrar puntos cercanos al usuario.
            </p>
          </div>
        </div>

        <div className="config-card-body">

          <div className="config-input-group">
            <input
              type="number"
              className="admin-input"
              min={100}
              max={1000}
              step={50}
              value={radio}
              onChange={e => setRadio(Number(e.target.value))}
            />
            <span className="config-unidad">metros</span>
          </div>

          {/* SLIDER VISUAL */}
          <input
            type="range"
            className="config-slider"
            min={100}
            max={1000}
            step={50}
            value={radio}
            onChange={e => setRadio(Number(e.target.value))}
          />

          <div className="config-slider-labels">
            <span>100m</span>
            <span>500m</span>
            <span>1000m</span>
          </div>

          {(radio < 100 || radio > 1000) && (
            <p className="admin-error">El valor debe estar entre 100 y 1000 metros</p>
          )}

          <button
            className="btn-admin-guardar"
            onClick={guardar}
            disabled={radio < 100 || radio > 1000}
          >
            {guardado ? "✓ Guardado" : "Guardar"}
          </button>

        </div>

      </div>

    </div>
  )
}

export default ConfiguracionGeneral
