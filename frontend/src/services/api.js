import { getCached, setCached } from './cache.js'
import { invalidarCache, invalidarTodo } from './cache.js'

// ---------------------------------------------------
// CAPA DE SERVICIOS - LLAMADAS AL BACKEND
// Centraliza todos los fetch al API de FastAPI
// ---------------------------------------------------

const BASE_URL = "https://192.168.1.137:8000"

// ---------------------------------------------------
// HELPER - fetch con manejo de errores
// ---------------------------------------------------

async function apiFetch(endpoint, options = {}) {

  const token = sessionStorage.getItem('admin_token')

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` })
    },
    ...options,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.detail || `Error ${res.status}`)
  }

  if (res.status === 204) return null

  return res.json()
}

// ---------------------------------------------------
// LOGIN - ADMIN
// ---------------------------------------------------

export const loginAdmin = (password) =>
  apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ password })
  })

// ---------------------------------------------------
// RUTAS - LECTURA
// ---------------------------------------------------

export const getRutas = async () => {

  const cached = getCached('rutas')
  if (cached) {
    console.log("CACHE rutas")
    return cached
  }
  const data = await apiFetch('/rutas')
  console.log("FETCH rutas")
  setCached('rutas', data)

  return data
}

export const getRuta = async (id) => {

  const key = `ruta_${id}`
  const cached = getCached(key)
  if (cached) return cached
  const data = await apiFetch(`/rutas/${id}`)
  setCached(key, data)

  return data
}

// ---------------------------------------------------
// RUTAS - ESCRITURA (SUPERADMIN)
// ---------------------------------------------------

export const createRuta = async (datos) => {

  const result = await apiFetch("/rutas", {
    method: "POST",
    body: JSON.stringify(datos),
  })
  invalidarCache('rutas')

  return result
}

export const updateRuta = async (id, datos) => {

  const result = await apiFetch(`/rutas/${id}`, {
    method: "PATCH",
    body: JSON.stringify(datos),
  })

  invalidarCache('rutas')
  invalidarCache(`ruta_${id}`)
  invalidarCache(`puntos_ruta_${id}`)

  return result
}

export const deleteRuta = async (id) => {

  const result = await apiFetch(`/rutas/${id}`, {
    method: "DELETE",
  })
  invalidarTodo()

  return result
}

// ---------------------------------------------------
// PUNTOS - LECTURA
// ---------------------------------------------------

export const getTodosPuntos = async () => {

  const cached = getCached('puntos')
  if (cached)  {
    console.log("CACHE puntos")
    return cached
  }
  const data = await apiFetch('/puntos')
  console.log("FETCH puntos")
  setCached('puntos', data)

  return data
}

export const getPuntosDeRuta = async (rutaId) => {

  const key = `puntos_ruta_${rutaId}`
  const cached = getCached(key)
  if (cached) return cached
  const data = await apiFetch(`/rutas/${rutaId}/puntos`)
  setCached(key, data)

  return data
}

export const getPunto = async (id) => {

  const key = `punto_${id}`
  const cached = getCached(key)
  if (cached) return cached
  const data = await apiFetch(`/puntos/${id}`)
  setCached(key, data)

  return data
}

// ---------------------------------------------------
// PUNTOS - ESCRITURA (SUPERADMIN y ADMIN HISTORIADOR)
// ---------------------------------------------------

export const createPunto = async (datos) => {

  const result = await apiFetch("/puntos", {
    method: "POST",
    body: JSON.stringify(datos),
  })

  invalidarTodo()

  return result
}

export const updatePunto = async (id, datos) => {

  const result = await apiFetch(`/puntos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(datos),
  })

  invalidarTodo()

  return result
}

export const deletePunto = async (id) => {

  const result = await apiFetch(`/puntos/${id}`, {
    method: "DELETE",
  })

  invalidarTodo()

  return result
}
