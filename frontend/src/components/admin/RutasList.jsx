import { useState, useEffect } from "react"
import { getRutas, createRuta, updateRuta, deleteRuta } from "../../services/api.js"
import RutaForm from "./RutaForm.jsx"
import ConfirmModal from "./ConfirmModal.jsx"

// ---------------------------------------------------
// LISTA DE RUTAS CON CRUD
// Props:
//   rol               - "superadmin" | "historiador"
//   onGestionarPuntos - callback(ruta) para abrir
//                       el gestor de puntos (solo superadmin)
// ---------------------------------------------------

function RutasList({ rol, onGestionarPuntos }) {

  const esSuperadmin = rol === "superadmin"

  const [rutas, setRutas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [formRuta, setFormRuta] = useState(null)
  const [rutaABorrar, setRutaABorrar] = useState(null)
  const [soloActivas, setSoloActivas] = useState(false)
  const [busqueda, setBusqueda] = useState("")


  useEffect(() => { cargarRutas() }, [])

  const cargarRutas = async () => {
    try {
      setCargando(true)
      setRutas(await getRutas())
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }

  const handleGuardar = async (datos) => {
    try {
      if (formRuta?.id) {
        await updateRuta(formRuta.id, datos)
      } else {
        await createRuta(datos)
      }
      setFormRuta(null)
      cargarRutas()
    } catch (e) {
      alert("Error al guardar: " + e.message)
    }
  }

  const handleBorrar = async () => {
    try {
      await deleteRuta(rutaABorrar.id)
      setRutaABorrar(null)
      cargarRutas()
    } catch (e) {
      alert("Error al borrar: " + e.message)
    }
  }

  if (cargando) return <p className="admin-info">Cargando rutas...</p>
  if (error)    return <p className="admin-error">{error}</p>

  const rutasFiltradas = rutas
    .filter(r => !soloActivas || r.activo)
    .filter(r => r.nombre.toLowerCase().includes(busqueda.toLowerCase()))


  return (
    <div className="admin-seccion">

      <div className="admin-seccion-header">
        <h2>Rutas</h2>
        {esSuperadmin && (
          <button className="btn-admin-nuevo" onClick={() => setFormRuta({})}>
            + Nueva ruta
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "12px" }}>
        <input
          className="admin-buscador"
          placeholder="Buscar ruta por nombre..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        <label className="label-activos" style={{ display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }}>
          <input
            type="checkbox"
            checked={soloActivas}
            onChange={e => setSoloActivas(e.target.checked)}
          />
          Solo activas
        </label>
      </div>

      <table className="admin-tabla">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Activa</th>
            <th>Puntos</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rutasFiltradas.map(ruta => (
            <tr key={ruta.id}>
              <td>{ruta.id}</td>
              <td>{ruta.nombre}</td>
              <td>{ruta.activo ? "Activa" : "No activa"}</td>
              <td>{ruta.puntos?.length ?? 0}</td>
              <td className="admin-acciones">

                {/* Gestionar puntos: solo superadmin */}
                {esSuperadmin && (
                  <button
                    className="btn-admin-puntos"
                    onClick={() => onGestionarPuntos(ruta)}
                    title="Gestionar puntos"
                  >
                    Puntos
                  </button>
                )}

                {/* Editar ruta (superadmin) o bibliografia (historiador) */}
                <button
                  className="btn-admin-editar"
                  onClick={() => setFormRuta(ruta)}
                  title={esSuperadmin ? "Editar ruta" : "Editar bibliografía"}
                >
                  Editar
                </button>

                {/* Borrar ruta: solo superadmin */}
                {esSuperadmin && (
                  <button
                    className="btn-admin-borrar"
                    onClick={() => setRutaABorrar(ruta)}
                    title="Borrar ruta"
                  >
                    Borrar
                  </button>
                )}

              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {formRuta !== null && (
        <RutaForm
          rutaInicial={formRuta?.id ? formRuta : null}
          onGuardar={handleGuardar}
          onCancelar={() => setFormRuta(null)}
          rol={rol}
        />
      )}

      {rutaABorrar && (
        <ConfirmModal
          mensaje={`¿Borrar la ruta "${rutaABorrar.nombre}"? Esta acción no se puede deshacer.`}
          onConfirm={handleBorrar}
          onCancel={() => setRutaABorrar(null)}
        />
      )}

    </div>
  )
}

export default RutasList
