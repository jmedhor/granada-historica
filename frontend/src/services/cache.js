// ---------------------------------------------------
// CACHE EN MEMORIA CON TTL
// Evita llamadas repetidas a la BD para datos
// que cambian con poca frecuencia (rutas, puntos)
// TTL por defecto: 5 minutos
// ---------------------------------------------------

const TTL_MS = 5 * 60 * 1000

const store = {}

export function getCached(clave) {
  const entrada = store[clave]
  if (!entrada) return null
  if (Date.now() - entrada.timestamp > TTL_MS) {
    delete store[clave]
    return null
  }
  return entrada.valor
}

export function setCached(clave, valor) {
  store[clave] = { valor, timestamp: Date.now() }
}

export function invalidarCache(clave) {
  delete store[clave]
}

export function invalidarTodo() {
  Object.keys(store).forEach(k => delete store[k])
}
