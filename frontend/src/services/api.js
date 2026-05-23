// ---------------------------------------------------
// CAPA DE SERVICIOS - LLAMADAS AL BACKEND
// Centraliza todos los fetch al API de FastAPI
// ---------------------------------------------------

const BASE_URL = "http://192.168.1.137:8000"

// ---------------------------------------------------
// HELPER - fetch con manejo de errores
// ---------------------------------------------------

async function apiFetch(endpoint, options = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.detail || `Error ${res.status}`)
  }
  // 204 No Content no tiene body
  if (res.status === 204) return null
  return res.json()
}

// ---------------------------------------------------
// RUTAS - LECTURA
// ---------------------------------------------------

export const getRutas = () =>
  apiFetch("/rutas")

export const getRuta = (id) =>
  apiFetch(`/rutas/${id}`)

// ---------------------------------------------------
// RUTAS - ESCRITURA (SUPERADMIN)
// ---------------------------------------------------

export const createRuta = (datos) =>
  apiFetch("/rutas", {
    method: "POST",
    body: JSON.stringify(datos),
  })

export const updateRuta = (id, datos) =>
  apiFetch(`/rutas/${id}`, {
    method: "PATCH",
    body: JSON.stringify(datos),
  })

export const deleteRuta = (id) =>
  apiFetch(`/rutas/${id}`, { method: "DELETE" })

// ---------------------------------------------------
// PUNTOS - LECTURA
// ---------------------------------------------------

export const getTodosPuntos = () =>
  apiFetch("/puntos")

export const getPuntosDeRuta = (rutaId) =>
  apiFetch(`/rutas/${rutaId}/puntos`)

export const getPunto = (id) =>
  apiFetch(`/puntos/${id}`)

// ---------------------------------------------------
// PUNTOS - ESCRITURA (SUPERADMIN y ADMIN HISTORIADOR)
// ---------------------------------------------------

export const createPunto = (datos) =>
  apiFetch("/puntos", {
    method: "POST",
    body: JSON.stringify(datos),
  })

export const updatePunto = (id, datos) =>
  apiFetch(`/puntos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(datos),
  })

export const deletePunto = (id) =>
  apiFetch(`/puntos/${id}`, { method: "DELETE" })
