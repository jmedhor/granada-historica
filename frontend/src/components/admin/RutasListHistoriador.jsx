import { useState, useEffect } from "react"
import { getRutas, updateRuta } from "../../services/api.js"
import BibliografiaForm from "./BibliografiaForm.jsx"

// ---------------------------------------------------
// LISTA DE RUTAS PARA ADMIN HISTORIADOR
// Solo permite editar la bibliografía de cada ruta
// ---------------------------------------------------

function RutasListHistoriador() {

  const [rutas, setRutas]       = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError]       = useState(null)

  // Ruta cuya bibliografia se está editando (null = cerrado)
  const [rutaEditando, setRutaEditando] = useState(null)

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
      await updateRuta(rutaEditando.id, datos)
      setRutaEditando(null)
      cargarRutas()
    } catch (e) {
      alert("Error al guardar: " + e.message)
    }
  }

  if (cargando) return <p className="admin-info">Cargando rutas...</p>
  if (error)    return <p className="admin-error">{error}</p>

  return (
    <div className="admin-seccion">

      <div className="admin-seccion-header">
        <h2>🗺️ Bibliografía de rutas</h2>
      </div>

      <table className="admin-tabla">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Activa</th>
            <th>Referencias</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {rutas.map(ruta => {

            // Contar referencias no vacías
            const numRefs = ruta.bibliografia
              ? ruta.bibliografia.split("\n").filter(l => l.trim()).length
              : 0

            return (
              <tr key={ruta.id}>
                <td>{ruta.id}</td>
                <td>{ruta.nombre}</td>
                <td>{ruta.activo ? "✅" : "❌"}</td>
                <td>{numRefs} refs.</td>
                <td className="admin-acciones">
                  <button
                    className="btn-admin-editar"
                    onClick={() => setRutaEditando(ruta)}
                    title="Editar bibliografía"
                  >
                    📚
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {rutaEditando && (
        <BibliografiaForm
          ruta={rutaEditando}
          onGuardar={handleGuardar}
          onCancelar={() => setRutaEditando(null)}
        />
      )}

    </div>
  )
}

export default RutasListHistoriador
