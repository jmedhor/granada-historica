import { useState, useEffect } from "react"
import {
  getTodosPuntos,
  getRutas,
  createPunto,
  updatePunto,
  deletePunto,
} from "../../services/api.js"
import PuntoForm from "./PuntoForm.jsx"
import ConfirmModal from "./ConfirmModal.jsx"

// ---------------------------------------------------
// LISTA DE PUNTOS CON CRUD
// Props:
//   rol - "superadmin" | "historiador"
//         historiador solo puede editar, no crear/borrar
// ---------------------------------------------------

function PuntosList({ rol }) {

  // -----------------------------------------
  // Estado
  // -----------------------------------------

  const [puntos, setPuntos] = useState([])
  const [rutas, setRutas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [busqueda, setBusqueda] = useState("")

  // Control del formulario (null = cerrado)
  const [formPunto, setFormPunto] = useState(null)

  // Punto a borrar (null = modal cerrado)
  const [puntoABorrar, setPuntoABorrar] = useState(null)

  const [soloActivos, setSoloActivos] = useState(false)


  const esSuperadmin = rol === "superadmin"

  // -----------------------------------------
  // Cargar datos al montar
  // -----------------------------------------

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setCargando(true)
      const [puntosData, rutasData] = await Promise.all([
        getTodosPuntos(),
        getRutas(),
      ])
      setPuntos(puntosData)
      setRutas(rutasData)
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }

  // -----------------------------------------
  // Guardar (crear o editar)
  // -----------------------------------------

  const handleGuardar = async (datos) => {
    try {
      if (formPunto?.id) {
        await updatePunto(formPunto.id, datos)
      } else {
        await createPunto(datos)
      }
      setFormPunto(null)
      cargarDatos()
    } catch (e) {
      alert("Error al guardar: " + e.message)
    }
  }

  // -----------------------------------------
  // Borrar punto
  // -----------------------------------------

  const handleBorrar = async () => {
    try {
      await deletePunto(puntoABorrar.id)
      setPuntoABorrar(null)
      cargarDatos()
    } catch (e) {
      alert("Error al borrar: " + e.message)
    }
  }

  // -----------------------------------------
  // Filtro de busqueda por nombre
  // -----------------------------------------

  const puntosFiltrados = puntos
    .filter(p => !soloActivos || p.activo)
    .filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()))


  // -----------------------------------------
  // Render
  // -----------------------------------------

  if (cargando) return <p className="admin-info">Cargando puntos...</p>
  if (error)    return <p className="admin-error">{error}</p>

  return (
    <div className="admin-seccion">

      {/* CABECERA */}
      <div className="admin-seccion-header">
        <h2>Puntos</h2>
        {esSuperadmin && (
          <button
            className="btn-admin-nuevo"
            onClick={() => setFormPunto({})}
          >
            + Nuevo punto
          </button>
        )}
      </div>

      {/* BUSCADOR */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "12px" }}>
        <input
          className="admin-buscador"
          placeholder="Buscar punto por nombre..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{ flex: 1 }}
        />
        <label className="label-activos" style={{ display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }}>
          <input
            type="checkbox"
            checked={soloActivos}
            onChange={e => setSoloActivos(e.target.checked)}
          />
          Solo activos
        </label>
      </div>

      {/* TABLA */}
      <table className="admin-tabla">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Ruta</th>
            <th>Pago</th>
            <th>Activo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {puntosFiltrados.map(punto => (
            <tr key={`${punto.id}-${punto.ruta_id}`}>
              <td>{punto.id}</td>
              <td>{punto.nombre}</td>
              <td>{punto.ruta_nombre || "—"}</td>
              <td>{punto.pago ? "Pago" : "Gratis"}</td>
              <td>{punto.activo ? "Si" : "No"}</td>
              <td className="admin-acciones">

                {/* Editar: disponible para todos los roles */}
                <button
                  className="btn-admin-editar"
                  onClick={() => setFormPunto(punto)}
                >
                  Editar
                </button>

                {/* Borrar: solo superadmin */}
                {esSuperadmin && (
                  <button
                    className="btn-admin-borrar"
                    onClick={() => setPuntoABorrar(punto)}
                  >
                    Borrar
                  </button>
                )}

              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* FORMULARIO */}
      {formPunto !== null && (
        <PuntoForm
          puntoInicial={formPunto?.id ? formPunto : null}
          rutas={rutas}
          onGuardar={handleGuardar}
          onCancelar={() => setFormPunto(null)}
          rol={rol}
        />
      )}

      {/* MODAL CONFIRMACION BORRADO */}
      {puntoABorrar && (
        <ConfirmModal
          mensaje={`¿Borrar el punto "${puntoABorrar.nombre}"?`}
          onConfirm={handleBorrar}
          onCancel={() => setPuntoABorrar(null)}
        />
      )}

    </div>
  )
}

export default PuntosList
