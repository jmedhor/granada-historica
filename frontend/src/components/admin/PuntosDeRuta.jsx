import { useState, useEffect } from "react"
import {
  getPuntosDeRuta,
  getTodosPuntos,
  updatePunto,
  createPunto,
} from "../../services/api.js"
import PuntoForm from "./PuntoForm.jsx"
import ConfirmModal from "./ConfirmModal.jsx"

// ---------------------------------------------------
// FILAS
// ---------------------------------------------------

function FilaPunto({ punto, onEditar, onQuitar }) {
  return (
    <tr>

      <td>{punto.id}</td>
      <td>{punto.nombre}</td>
      <td>{punto.pago ? "Pago" : "Gratis"}</td>
      <td>{punto.importancia}</td>
      <td>{punto.activo ? "Activo" : "No activo"}</td>
      <td className="admin-acciones">

        <button
          className="btn-admin-editar"
          onClick={() => onEditar(punto)}
          title="Editar punto"
        >
          Editar
        </button>

        <button
          className="btn-admin-borrar"
          onClick={() => onQuitar(punto)}
          title="Quitar de esta ruta"
        >
          Quitar
        </button>

      </td>
    </tr>
  )
}

// ---------------------------------------------------
// GESTOR DE PUNTOS DE UNA RUTA CONCRETA
// Props:
//   ruta     - objeto ruta seleccionada
//   rutas    - lista completa de rutas (para el form)
//   onVolver - callback para volver al listado de rutas
// ---------------------------------------------------

function PuntosDeRuta({ ruta, rutas, onVolver }) {

  // PuntosDeRuta solo lo usa superadmin
  const rol = "superadmin"

  const [puntos, setPuntos]         = useState([])
  const [todosPuntos, setTodosPuntos] = useState([])
  const [cargando, setCargando]     = useState(true)
  const [error, setError]           = useState(null)
  const [formPunto, setFormPunto]   = useState(null)
  const [puntoAQuitar, setPuntoAQuitar] = useState(null)
  const [modoAnadir, setModoAnadir] = useState(false)
  const [puntoExistenteId, setPuntoExistenteId] = useState("")
  const [soloActivos, setSoloActivos] = useState(false)
  const [busqueda, setBusqueda] = useState("")


  useEffect(() => { cargarDatos() }, [ruta.id])

  const cargarDatos = async () => {
    try {
      setCargando(true)
      const [puntosRuta, todos] = await Promise.all([
        getPuntosDeRuta(ruta.id),
        getTodosPuntos(),
      ])
      setPuntos(puntosRuta)
      setTodosPuntos(todos)
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }

  const idsEnRuta = new Set(puntos.map(p => p.id))

  const puntosDisponibles = todosPuntos.filter(p => !idsEnRuta.has(p.id))

  const puntosFiltrados = soloActivos
    ? puntos.filter(p => p.activo)
    : puntos

  const puntosFinales = puntosFiltrados
    .filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()))


  const handleGuardar = async (datos) => {
    try {
      if (formPunto?.id) {
        await updatePunto(formPunto.id, datos)
      } else {
        await createPunto({ ...datos, ruta_id: ruta.id })
      }
      setFormPunto(null)
      cargarDatos()
    } catch (e) {
      alert("Error al guardar: " + e.message)
    }
  }

  const handleAnadirExistente = async () => {
    if (!puntoExistenteId) return
    try {
      await updatePunto(parseInt(puntoExistenteId), { ruta_id: ruta.id })
      setPuntoExistenteId("")
      setModoAnadir(false)
      cargarDatos()
    } catch (e) {
      alert("Error al añadir: " + e.message)
    }
  }

  const handleQuitarDeLaRuta = async () => {
    try {
      await updatePunto(puntoAQuitar.id, { ruta_id: null })
      setPuntoAQuitar(null)
      cargarDatos()
    } catch (e) {
      alert("Error al quitar: " + e.message)
    }
  }

  if (cargando) return <p className="admin-info">Cargando puntos...</p>
  if (error)    return <p className="admin-error">{error}</p>

  return (
    <div className="admin-seccion">

      {/* CABECERA */}
      <div className="admin-seccion-header">

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button className="btn-admin-cancelar" onClick={onVolver}>
            ← Volver
          </button>
          <h2 style={{ margin: 0 }}>
            Puntos de: <em>{ruta.nombre}</em>
          </h2>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <label className="label-activos" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <input
              type="checkbox"
              checked={soloActivos}
              onChange={(e) => setSoloActivos(e.target.checked)}
            />
            Mostrar solo puntos activos
          </label>
          <button
            className="btn-admin-secundario"
            onClick={() => setModoAnadir(!modoAnadir)}
          >
            + Añadir punto existente
          </button>
          <button
            className="btn-admin-nuevo"
            onClick={() => setFormPunto({})}
          >
            + Crear nuevo punto
          </button>


        </div>

      </div>

      {/* SELECTOR PUNTO EXISTENTE */}
      {modoAnadir && (
        <div className="admin-anadir-existente">
          <select
            className="admin-input"
            value={puntoExistenteId}
            onChange={e => setPuntoExistenteId(e.target.value)}
            style={{ flex: 1 }}
          >
            <option value="">— Selecciona un punto —</option>
            {puntosDisponibles.map(p => (
              <option key={p.id} value={p.id}>
                {p.nombre} {p.ruta_nombre ? `(en: ${p.ruta_nombre})` : "(sin ruta)"}
              </option>
            ))}
          </select>
          <button
            className="btn-admin-guardar"
            onClick={handleAnadirExistente}
            disabled={!puntoExistenteId}
          >
            Confirmar
          </button>
          <button
            className="btn-admin-cancelar"
            onClick={() => { setModoAnadir(false); setPuntoExistenteId("") }}
          >
            Cancelar
          </button>
        </div>
      )}

      <input
        className="admin-buscador"
        placeholder="Buscar punto por nombre..."
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
      />

      {/* TABLA SIN DRAG & DROP */}
      {puntos.length === 0 ? (
        <p className="admin-info">Esta ruta no tiene puntos todavía.</p>
      ) : (
        <table className="admin-tabla">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Pago</th>
              <th>Importancia</th>
              <th>Activo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {puntosFinales.map(punto => (
              <FilaPunto
                key={punto.id}
                punto={punto}
                onEditar={setFormPunto}
                onQuitar={setPuntoAQuitar}
              />
            ))}
          </tbody>
        </table>
      )}

      {formPunto !== null && (
        <PuntoForm
          puntoInicial={formPunto?.id ? formPunto : null}
          rutas={rutas}
          onGuardar={handleGuardar}
          onCancelar={() => setFormPunto(null)}
          rol={rol}
        />
      )}

      {puntoAQuitar && (
        <ConfirmModal
          mensaje={`¿Quitar "${puntoAQuitar.nombre}" de la ruta "${ruta.nombre}"? El punto no se borrará del sistema.`}
          onConfirm={handleQuitarDeLaRuta}
          onCancel={() => setPuntoAQuitar(null)}
        />
      )}

    </div>
  )
}

export default PuntosDeRuta
