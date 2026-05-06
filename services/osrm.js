const OSRM_BASE = "https://router.project-osrm.org"

// La ruta historica por ahora solo sigue los puntos en orden
// La intencion es que el usuario sigue el orden "definido por la UGR"

export async function obtenerRutaHistorica(puntos, userLocation, evitarPago) {

  const puntosFiltrados = evitarPago
    ? puntos.filter(p => !p.pago)
    : puntos

  if (puntosFiltrados.length === 0) {
    console.warn("No hay puntos disponibles sin pago")
    return { legs: [], orden: [] }
  }

  const coords = [
    `${userLocation.lon},${userLocation.lat}`,
    ...puntosFiltrados.map(p => `${p.longitud},${p.latitud}`)
  ].join(";")

  const url = `${OSRM_BASE}/route/v1/foot/${coords}?overview=false&geometries=geojson&steps=true`

  const res = await fetch(url)
  const data = await res.json()

  const route = data.routes[0]

  // orden fijo: usuario + puntos en orden base de datos
  const orden = [
    0,
    ...puntosFiltrados.map((_, i) => i + 1)
  ]

  return {
    legs: route.legs,
    orden
  }
}

// La ruta optima parte de la localizacion inicial y calcula la
// ruta mas eficiente para pasar por todos los puntos

export async function obtenerRutaOptima(puntos, userLocation, evitarPago) {


    // Filtrado
  const puntosFiltrados = evitarPago
    ? puntos.filter(p => !p.pago)
    : puntos

  if (puntosFiltrados.length === 0) {
    console.warn("No hay puntos disponibles sin pago")
    return []
  }

  const coords = [
    `${userLocation.lon},${userLocation.lat}`,
    ...puntosFiltrados.map(p => `${p.longitud},${p.latitud}`)
  ].join(";")

  const url = `${OSRM_BASE}/trip/v1/foot/${coords}?overview=false&geometries=geojson&steps=true&source=first&destination=last&roundtrip=false`

  const res = await fetch(url)
  const data = await res.json()

  const trip = data.trips[0]

  // orden de visita
  const orden = trip.waypoint_order

  return {
    legs: trip.legs,
    orden
  }

}
