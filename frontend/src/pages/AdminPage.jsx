import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getRutas, loginAdmin } from "../services/api.js"
import RutasList from "../components/admin/RutasList.jsx"
import PuntosList from "../components/admin/PuntosList.jsx"
import PuntosDeRuta from "../components/admin/PuntosDeRuta.jsx"
import ConfiguracionGeneral from "../components/admin/ConfiguracionGeneral.jsx"

// ---------------------------------------------------
// PAGINA DE ADMINISTRACION
// ---------------------------------------------------

function AdminPage() {

  const navigate = useNavigate()

  const [pin, setPin] = useState("")
  const [rol, setRol] = useState(null)
  const [errorPin, setErrorPin] = useState(false)

  // Tabs superadmin: "rutas" | "puntos"
  const [tab, setTab] = useState("rutas")

  // Ruta cuya lista de puntos se esta gestionando (superadmin)
  const [rutaGestionando, setRutaGestionando] = useState(null)

  // Lista de rutas para pasarla a PuntosDeRuta
  const [rutas, setRutas] = useState([])

  useEffect(() => {
    if (rol) getRutas().then(setRutas).catch(console.error)
  }, [rol])

  // -----------------------------------------
  // Login
  // -----------------------------------------

  const handleLogin = async (e) => {
    e.preventDefault()

    try {
      const { token, rol } = await loginAdmin(pin)

      sessionStorage.setItem('admin_token', token)
      sessionStorage.setItem('admin_rol', rol)

      setRol(rol)
      setErrorPin(false)

    } catch (err) {
      setErrorPin(true)
    }
  }

  // -----------------------------------------
  // Pantalla login
  // -----------------------------------------

  if (!rol) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-box">

          <h1 className="admin-login-titulo">Granada Histórica Admin</h1>
          <p className="admin-login-sub">Introduce tu PIN de acceso</p>

          <form onSubmit={handleLogin}>
            <input
              className="admin-input admin-pin-input"
              type="password"
              placeholder="PIN"
              value={pin}
              onChange={e => setPin(e.target.value)}
              autoFocus
            />
            {errorPin && <p className="admin-error">PIN incorrecto</p>}
            <button
              type="submit"
              className="btn-admin-guardar"
              style={{ width: "100%", marginTop: "12px" }}
            >
              Entrar
            </button>
          </form>

          <button
            className="btn-admin-cancelar"
            style={{ width: "100%", marginTop: "10px" }}
            onClick={() => navigate("/")}
          >
            ← Volver al mapa
          </button>

        </div>
      </div>
    )
  }

  // -----------------------------------------
  // Panel admin
  // -----------------------------------------

  // Tabs
  const tabsAdmin = [
    { id: "rutas",         label: "Rutas" },
    { id: "puntos",        label: "Todos los puntos" },
    { id: "configuracion", label: "Configuración general" },  // ← nuevo
  ]



  return (
    <div className="admin-page">

      <header className="admin-header">

        <div className="admin-header-left">
          <h1>Granada Histórica Admin</h1>
          <span className="admin-rol-badge">
            {rol === "superadmin" ? "Superadmin" : "Admin Historiador"}
          </span>
        </div>

        <div className="admin-header-right">

          {/* Tabs: ocultar cuando se gestiona puntos de una ruta */}
          {!rutaGestionando && (
            <div className="admin-tabs">
              {tabsAdmin.map(t => (
                <button
                  key={t.id}
                  className={tab === t.id ? "admin-tab active" : "admin-tab"}
                  onClick={() => setTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}

          <button
            className="btn-admin-cancelar"
            onClick={() => {
              sessionStorage.removeItem('admin_token')
              sessionStorage.removeItem('admin_rol')
              setRol(null)
            }}          >
            ← Volver al login
          </button>

        </div>

      </header>

      <main className="admin-contenido">

        {/* ---- SUPERADMIN: gestor puntos de ruta ---- */}
        {rol === "superadmin" && rutaGestionando && (
          <PuntosDeRuta
            ruta={rutaGestionando}
            rutas={rutas}
            onVolver={() => setRutaGestionando(null)}
          />
        )}

        {/* ---- SUPERADMIN: lista rutas ---- */}
        {rol === "superadmin" && !rutaGestionando && tab === "rutas" && (
          <RutasList
            rol={rol}
            onGestionarPuntos={setRutaGestionando}
          />
        )}

        {/* ---- SUPERADMIN: todos los puntos ---- */}
        {rol === "superadmin" && !rutaGestionando && tab === "puntos" && (
          <PuntosList rol="superadmin" />
        )}

        {/* ---- SUPERADMIN: configuracion general ---- */}
        {rol === "superadmin" && !rutaGestionando && tab === "configuracion" && (
          <ConfiguracionGeneral />
        )}

        {/* ---- HISTORIADOR: bibliografia de rutas ---- */}
        {rol === "historiador" && tab === "rutas" && (
          <RutasList
            rol={rol}
            onGestionarPuntos={setRutaGestionando}
          />
        )}

        {/* ---- HISTORIADOR: todos los puntos ---- */}
        {rol === "historiador" && tab === "puntos" && (
          <PuntosList rol="historiador" />
        )}



      </main>

    </div>
  )
}

export default AdminPage
