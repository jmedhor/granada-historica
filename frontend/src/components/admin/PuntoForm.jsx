import { useState, useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import L from "leaflet"

// Fix icono default leaflet con bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

// ---------------------------------------------------
// SELECTOR DE COORDENADAS EN EL MAPA
// Componente interno que escucha clicks en el mapa
// y llama a onSeleccionar con {lat, lng}
// ---------------------------------------------------

function SelectorCoordenadas({ posicion, onSeleccionar }) {

  useMapEvents({
    click(e) {
      onSeleccionar(e.latlng)
    },
  })

  return posicion
    ? <Marker position={posicion} />
    : null
}

// ---------------------------------------------------
// FORMULARIO DE PUNTO
// Props:
//   puntoInicial - objeto punto si es edicion, null si es creacion
//   rutas        - lista de rutas para el selector ruta_id
//   onGuardar    - callback con los datos del formulario
//   onCancelar   - callback para cerrar el formulario
// ---------------------------------------------------

function PuntoForm({ puntoInicial, rutas, onGuardar, onCancelar, rol }) {

  // Si es historiador no puede editar coordenadas ni estado activo
  const esHistoriador = rol === "historiador"

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    latitud: "",
    longitud: "",
    pago: false,
    url: "",
    importancia: 5,
    activo: true,
    ruta_id: "",
  })

  // Controla si el mini mapa está visible
  const [mapaAbierto, setMapaAbierto] = useState(false)

  // Posicion del marcador en el mini mapa
  const [posicionMapa, setPosicionMapa] = useState(null)

  // Centro inicial del mapa (Granada por defecto)
  const centroInicial = [37.1773, -3.5986]

  // Cargar datos si es edicion
  useEffect(() => {
    if (puntoInicial) {
      setForm({
        nombre:      puntoInicial.nombre      || "",
        descripcion: puntoInicial.descripcion || "",
        latitud:     puntoInicial.latitud     ?? "",
        longitud:    puntoInicial.longitud    ?? "",
        pago:        puntoInicial.pago        ?? false,
        url:         puntoInicial.url         || "",
        importancia: puntoInicial.importancia ?? 5,
        activo:      puntoInicial.activo      ?? true,
        ruta_id:     puntoInicial.ruta_id     || "",
      })
      // Si ya tiene coordenadas, mostrar marcador en el mapa
      if (puntoInicial.latitud && puntoInicial.longitud) {
        setPosicionMapa([puntoInicial.latitud, puntoInicial.longitud])
      }
    }
  }, [puntoInicial])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  // -----------------------------------------
  // Al clicar en el mapa: actualiza form y marcador
  // -----------------------------------------

  const handleSeleccionarCoordenadas = ({ lat, lng }) => {
    setPosicionMapa([lat, lng])
    setForm(prev => ({
      ...prev,
      latitud:  parseFloat(lat.toFixed(6)),
      longitud: parseFloat(lng.toFixed(6)),
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onGuardar({
      ...form,
      latitud:    parseFloat(form.latitud),
      longitud:   parseFloat(form.longitud),
      importancia: parseInt(form.importancia),
      ruta_id:    form.ruta_id ? parseInt(form.ruta_id) : null,
    })
  }

  // Centro del mapa: coordenadas del form si existen, si no Granada
  const centroMapa =
    form.latitud && form.longitud
      ? [parseFloat(form.latitud), parseFloat(form.longitud)]
      : centroInicial

  return (
    <div className="admin-form-overlay">
      <div className="admin-form-box">

        <h3 className="admin-form-titulo">
          {puntoInicial ? "Editar punto" : "+ Nuevo punto"}
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

          {/* COORDENADAS + BOTON MAPA - oculto para historiador */}
          {!esHistoriador && <div className="admin-coords-header">
            <label className="admin-label" style={{ margin: 0 }}>
              Coordenadas
            </label>
            <button
              type="button"
              className="btn-abrir-mapa"
              onClick={() => setMapaAbierto(!mapaAbierto)}
            >
              {mapaAbierto ? "Cerrar mapa" : "Abrir mapa"}
            </button>
          </div>}

          {!esHistoriador && <div className="admin-fila-2">
            <div>
              <label className="admin-label">Latitud</label>
              <input
                className="admin-input"
                name="latitud"
                type="number"
                step="any"
                value={form.latitud}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="admin-label">Longitud</label>
              <input
                className="admin-input"
                name="longitud"
                type="number"
                step="any"
                value={form.longitud}
                onChange={handleChange}
                required
              />
            </div>
          </div>}

          {/* MINI MAPA - solo superadmin */}
          {mapaAbierto && (
            <div className="admin-minimapa">
              <p className="admin-minimapa-hint">
                Haz clic en el mapa para seleccionar las coordenadas
              </p>
              <MapContainer
                center={centroMapa}
                zoom={15}
                style={{ height: "260px", width: "100%", borderRadius: "10px" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="© OpenStreetMap"
                />
                <SelectorCoordenadas
                  posicion={posicionMapa}
                  onSeleccionar={handleSeleccionarCoordenadas}
                />
              </MapContainer>
            </div>
          )}

          {/* URL */}
          <label className="admin-label">URL (más info)</label>
          <input
            className="admin-input"
            name="url"
            value={form.url}
            onChange={handleChange}
          />

          {/* IMPORTANCIA */}
          <label className="admin-label">
            Importancia: {form.importancia}
          </label>
          <input
            className="admin-input"
            name="importancia"
            type="range"
            min={1}
            max={10}
            value={form.importancia}
            onChange={handleChange}
          />

          {/* RUTA ASOCIADA */}
          <label className="admin-label">Ruta asociada</label>
          <select
            className="admin-input"
            name="ruta_id"
            value={form.ruta_id}
            onChange={handleChange}
          >
            <option value="">— Sin ruta —</option>
            {rutas.map(r => (
              <option key={r.id} value={r.id}>{r.nombre}</option>
            ))}
          </select>

          {/* CHECKBOXES */}
          <div className="admin-checks">
            <label className="admin-label-check">
              <input
                type="checkbox"
                name="pago"
                checked={form.pago}
                onChange={handleChange}
              />
              Acceso de pago
            </label>
            {/* Activo: solo superadmin */}
            {!esHistoriador && (
              <label className="admin-label-check">
                <input
                  type="checkbox"
                  name="activo"
                  checked={form.activo}
                  onChange={handleChange}
                />
                Punto activo
              </label>
            )}
          </div>

          {/* BOTONES */}
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

export default PuntoForm
