import { calcularDistanciaMetros } from '../utils/distancia.js'

// ---------------------------------------------------
// FUNCION AUXILIAR
// Calcula la distancia minima desde un punto
// al punto mas cercano del conjunto restante
// Se usa como heuristica h(n) en A*
// ---------------------------------------------------
function heuristica(punto, restantes) {

  // Si no quedan puntos, coste estimado = 0
  if (restantes.length === 0) return 0

  // Distancia al punto mas cercano del conjunto restante
  return Math.min(
    ...restantes.map(p =>
      calcularDistanciaMetros(
        punto.latitud,
        punto.longitud,
        p.latitud,
        p.longitud
      )
    )
  )
}

// ---------------------------------------------------
// FUNCION PRINCIPAL
// Calcula una ruta optima usando A*
//
// f(n) = g(n) + h(n)
//
// g(n) = distancia acumulada desde el usuario
//        hasta este punto siguiendo la ruta
//
// h(n) = distancia al punto no visitado mas cercano
//        (heuristica admisible)
//
// La importancia reduce f(n) para priorizar
// puntos relevantes aunque esten algo mas lejos
//
// Ajuste del factor de importancia (150):
// mayor valor → la importancia pesa mas que la distancia
// menor valor → solo importa la distancia
// ---------------------------------------------------
export function calcularRutaAStar(puntos, userLocation) {

  // copia de puntos para no modificar el array original
  const puntosRestantes = [...puntos]

  // aqui guardamos el orden final de la ruta
  const puntosOrdenados = []

  // posicion inicial del usuario
  let posicionActual = {
    latitud: userLocation.lat,
    longitud: userLocation.lon
  }

  // coste acumulado desde el inicio (g)
  let costeAcumulado = 0

  // seguimos hasta visitar todos los puntos
  while (puntosRestantes.length > 0) {

    let mejorPunto = null
    let mejorIndice = -1
    let mejorF = Infinity

    // recorremos todos los puntos restantes
    puntosRestantes.forEach((punto, index) => {

      // --------------------------------
      // g(n): coste real acumulado
      // distancia total hasta llegar a este punto
      // --------------------------------
      const distanciaAlPunto = calcularDistanciaMetros(
        posicionActual.latitud,
        posicionActual.longitud,
        punto.latitud,
        punto.longitud
      )

      const g = costeAcumulado + distanciaAlPunto

      // --------------------------------
      // h(n): heuristica
      // distancia estimada al punto no visitado
      // mas cercano desde este punto
      // --------------------------------
      const restantesSinEste = puntosRestantes.filter(
        (_, i) => i !== index
      )

      const h = heuristica(punto, restantesSinEste)

      // --------------------------------
      // f(n) = g + h
      // La importancia reduce f para priorizar
      // puntos relevantes
      // --------------------------------
      const f = (g + h) - ((punto.importancia ?? 5) * 150)

      // si encontramos un mejor candidato lo guardamos
      if (f < mejorF) {
        mejorF = f
        mejorPunto = punto
        mejorIndice = index
        // guardamos la distancia para actualizar g despues
        mejorPunto._distanciaDesdeActual = distanciaAlPunto
      }

    })

    // actualizamos el coste acumulado con la distancia
    // al punto elegido
    costeAcumulado += mejorPunto._distanciaDesdeActual

    // limpiamos la propiedad auxiliar
    delete mejorPunto._distanciaDesdeActual

    // añadimos el mejor punto al resultado final
    puntosOrdenados.push(mejorPunto)

    // actualizamos la posicion actual
    posicionActual = mejorPunto

    // eliminamos el punto ya visitado
    puntosRestantes.splice(mejorIndice, 1)

  }

  return puntosOrdenados
}
