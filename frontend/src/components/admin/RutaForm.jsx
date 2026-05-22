import { useState, useEffect } from "react"

// ---------------------------------------------------
// FORMULARIO DE RUTA
// Sirve tanto para crear como para editar
// Props:
//   rutaInicial - objeto ruta si es edicion, null si es creacion
//   onGuardar   - callback con los datos del formulario
//   onCancelar  - callback para cerrar el formulario
// ---------------------------------------------------

function RutaForm({ rutaInicial, onGuardar, onCancelar }) {

  // -----------------------------------------
  // Estado del formulario
  // -----------------------------------------

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    bibliografia: "",
    activo: true,
  })

  // -----------------------------------------
  // Si hay ruta inicial (edicion), cargar datos
  // -----------------------------------------

  useEffect(() => {
    if (rutaInicial) {
      setForm({
        nombre: rutaInicial.nombre || "",
        descripcion: rutaInicial.descripcion || "",
        bibliografia: rutaInicial.bibliografia || "",
        activo: rutaInicial.activo ?? true,
      })
    }
  }, [rutaInicial])

  // -----------------------------------------
  // Handler generico para inputs
  // -----------------------------------------

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  // -----------------------------------------
  // Submit
  // -----------------------------------------

  const handleSubmit = (e) => {
    e.preventDefault()
    onGuardar(form)
  }

  // -----------------------------------------
  // Render
  // -----------------------------------------

  return (
    <div className="admin-form-overlay">
      <div className="admin-form-box">

        <h3 className="admin-form-titulo">
          {rutaInicial ? "✏️ Editar ruta" : "➕ Nueva ruta"}
        </h3>

        <form onSubmit={handleSubmit}>

          {/* NOMBRE */}
          <label className="admin-label">Nombre</label>
          <input
            className="admin-input"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
          />

          {/* DESCRIPCION */}
          <label className="admin-label">Descripción</label>
          <textarea
            className="admin-textarea"
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            rows={3}
          />

          {/* BIBLIOGRAFIA */}
          <label className="admin-label">Bibliografía</label>
          <textarea
            className="admin-textarea"
            name="bibliografia"
            value={form.bibliografia}
            onChange={handleChange}
            rows={5}
          />

          {/* ACTIVO */}
          <label className="admin-label-check">
            <input
              type="checkbox"
              name="activo"
              checked={form.activo}
              onChange={handleChange}
            />
            Ruta activa (visible en el mapa)
          </label>

          {/* BOTONES */}
          <div className="admin-form-acciones">

            <button
              type="button"
              className="btn-admin-cancelar"
              onClick={onCancelar}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="btn-admin-guardar"
            >
              Guardar
            </button>

          </div>

        </form>

      </div>
    </div>
  )
}

export default RutaForm
