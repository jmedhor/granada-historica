import { calcularRutaAStar } from "./astar"

const OSRM_BASE = "https://router.project-osrm.org"

// ---------------------------------------------------
// RUTA HISTORICA
// ---------------------------------------------------

export async function obtenerRutaHistorica(puntos, userLocation, evitarPago) {

  console.log("================ RUTA HISTORICA ============")
  const puntosFiltrados = evitarPago
    ? puntos.filter(p => !p.pago)
    : puntos

  if (puntosFiltrados.length === 0) {
    console.warn("No hay puntos disponibles sin pago")
    return { legs: [], orden: [] }
  }

  console.log("PUNTOS FILTRADOS:")
  console.table(
    puntosFiltrados.map(p => ({
      nombre: p.nombre,
      importancia: p.importancia,
      pago: p.pago
    }))
  )


  const coords = [
    `${userLocation.lon},${userLocation.lat}`,
    ...puntosFiltrados.map(p => `${p.longitud},${p.latitud}`)
  ].join(";")

  const url =
    `${OSRM_BASE}/route/v1/foot/${coords}?overview=false&geometries=geojson&steps=true`

  const res = await fetch(url)
  const data = await res.json()

  const route = data.routes[0]

  const orden = [
    0,
    ...puntosFiltrados.map((_, i) => i + 1)
  ]

  return {
    legs: route.legs,
    puntosOrdenados: puntosFiltrados
  }
}

// ---------------------------------------------------
// RUTA OPTIMA
// ---------------------------------------------------

export async function obtenerRutaOptima(puntos, userLocation, evitarPago) {

  console.log("========== RUTA OPTIMA ==========")

  const puntosFiltrados = evitarPago
    ? puntos.filter(p => !p.pago)
    : puntos

  console.log("PUNTOS FILTRADOS:")
  console.table(
    puntosFiltrados.map(p => ({
      nombre: p.nombre,
      importancia: p.importancia,
      pago: p.pago
    }))
  )

  const puntosOrdenados = calcularRutaAStar(
    puntosFiltrados,
    userLocation
  )

  console.log("PUNTOS ORDENADOS (A*):")
  console.table(
    puntosOrdenados.map((p, index) => ({
      posicion: index + 1,
      nombre: p.nombre,
      importancia: p.importancia
    }))
  )

  if (puntosOrdenados.length === 0) {
    console.warn("No hay puntos disponibles sin pago")
    return []
  }

  const coords = [
    `${userLocation.lon},${userLocation.lat}`,
    ...puntosOrdenados.map(p => `${p.longitud},${p.latitud}`)
  ].join(";")

  const url =
    `${OSRM_BASE}/trip/v1/foot/${coords}?overview=false&geometries=geojson&steps=true&source=first&destination=last&roundtrip=false`

  const res = await fetch(url)
  const data = await res.json()

  const trip = data.trips[0]

  const orden = trip.waypoint_order

  console.log("TRIP COMPLETO:")
  console.log(trip)

  // OSRM ya devuelve los legs en orden correcto
  // así que mantenemos el orden del A*

  return {
    legs: trip.legs,
    puntosOrdenados
  }
}
