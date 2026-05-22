import { useState, useEffect } from "react"

// ---------------------------------------------------
// FORMULARIO DE BIBLIOGRAFIA
// Modal simple para editar solo la bibliografia
// Props:
//   ruta       - objeto ruta con su bibliografia actual
//   onGuardar  - callback con el texto nuevo
//   onCancelar - callback para cerrar
// ---------------------------------------------------

function BibliografiaForm({ ruta, onGuardar, onCancelar }) {

  const [bibliografia, setBibliografia] = useState("")

  // Cargar bibliografia actual al abrir
  useEffect(() => {
    setBibliografia(ruta?.bibliografia || "")
  }, [ruta])

  const handleSubmit = (e) => {
    e.preventDefault()
    onGuardar({ bibliografia })
  }

  return (
    <div className="admin-form-overlay">
      <div className="admin-form-box">

        <h3 className="admin-form-titulo">
          📚 Editar bibliografía: <em>{ruta?.nombre}</em>
        </h3>

        <form onSubmit={handleSubmit}>

          <label className="admin-label">
            Referencias bibliográficas (una por línea)
          </label>

          <textarea
            className="admin-textarea"
            value={bibliografia}
            onChange={e => setBibliografia(e.target.value)}
            rows={10}
            placeholder={"Referencia 1\nReferencia 2\n..."}
            autoFocus
          />

          <div className="admin-form-acciones">
            <button
              type="button"
              className="btn-admin-cancelar"
              onClick={onCancelar}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-admin-guardar">
              Guardar
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}

export default BibliografiaForm
