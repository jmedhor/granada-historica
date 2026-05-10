import { calcularRutaAStar } from "./astar"

// ---------------------------------------------------
// URL BASE DE OSRM
// API usada para calcular rutas reales
// ---------------------------------------------------

const OSRM_BASE = "https://router.project-osrm.org"

// ---------------------------------------------------
// RUTA HISTORICA
//
// Mantiene el orden original de los puntos
// definido por la ruta historica
// ---------------------------------------------------

export async function obtenerRutaHistorica(
  puntos,
  userLocation,
  evitarPago
) {

  console.log("========== RUTA HISTORICA ==========")

  // filtramos puntos de pago si el usuario lo pide
  const puntosFiltrados = filtrarPuntosPago(
    puntos,
    evitarPago
  )

  // si no hay puntos disponibles devolvemos vacio
  if (puntosFiltrados.length === 0) {
    console.warn("No hay puntos disponibles")
    return {
      legs: [],
      puntosOrdenados: [],
      duracion: 0
    }
  }

  mostrarPuntosConsola(puntosFiltrados)

  // generamos coordenadas para OSRM
  const coords = construirCoordenadas(
    puntosFiltrados,
    userLocation
  )

  // endpoint route mantiene el orden original
  const url =
    `${OSRM_BASE}/route/v1/foot/${coords}` +
    `?overview=false&geometries=geojson&steps=true`

  const response = await fetch(url)
  const data = await response.json()

  const ruta = data.routes[0]

  return {
    legs: ruta.legs,
    puntosOrdenados: puntosFiltrados,
    duracion: ruta.duration
  }
}

// ---------------------------------------------------
// RUTA OPTIMA
//
// Reordena los puntos usando A*
// priorizando cercania + importancia
// ---------------------------------------------------

export async function obtenerRutaOptima(
  puntos,
  userLocation,
  evitarPago
) {

  console.log("========== RUTA OPTIMA ==========")

  // filtramos puntos de pago si hace falta
  const puntosFiltrados = filtrarPuntosPago(
    puntos,
    evitarPago
  )

  // calculamos orden optimo
  const puntosOrdenados = calcularRutaAStar(
    puntosFiltrados,
    userLocation
  )

  // si no quedan puntos devolvemos vacio
  if (puntosOrdenados.length === 0) {
    console.warn("No hay puntos disponibles")

    return {
      legs: [],
      puntosOrdenados: [],
      duracion: 0
    }
  }

  mostrarPuntosConsola(puntosOrdenados)

  // construimos coordenadas para OSRM
  const coords = construirCoordenadas(
    puntosOrdenados,
    userLocation
  )

  // endpoint trip optimiza el recorrido
  const url =
    `${OSRM_BASE}/trip/v1/foot/${coords}` +
    `?overview=false` +
    `&geometries=geojson` +
    `&steps=true` +
    `&source=first` +
    `&destination=last` +
    `&roundtrip=false`

  const response = await fetch(url)
  const data = await response.json()

  const trip = data.trips[0]

  console.log("TRIP COMPLETO:")
  console.log(trip)

  return {
    legs: trip.legs,
    puntosOrdenados,
    duracion: trip.duration
  }
}

// ---------------------------------------------------
// FUNCION AUXILIAR
// Filtra puntos de pago si el usuario lo activa
// ---------------------------------------------------

function filtrarPuntosPago(puntos, evitarPago) {

  return evitarPago
    ? puntos.filter(punto => !punto.pago)
    : puntos
}

// ---------------------------------------------------
// FUNCION AUXILIAR
// Construye string de coordenadas para OSRM
// ---------------------------------------------------

function construirCoordenadas(puntos, userLocation) {

  return [
    `${userLocation.lon},${userLocation.lat}`,

    ...puntos.map(
      punto => `${punto.longitud},${punto.latitud}`
    )

  ].join(";")
}

// ---------------------------------------------------
// FUNCION AUXILIAR
// Muestra informacion de puntos por consola
// ---------------------------------------------------

function mostrarPuntosConsola(puntos) {

  console.table(
    puntos.map((punto, index) => ({
      posicion: index + 1,
      nombre: punto.nombre,
      importancia: punto.importancia,
      pago: punto.pago
    }))
  )
}
