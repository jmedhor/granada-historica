import { calcularDistanciaMetros } from '../utils/distancia.js'

// ---------------------------------------------------
// FUNCION PRINCIPAL
// Calcula una ruta "optima" usando una heuristica
// basada en cercania + importancia del punto
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

  // seguimos hasta visitar todos los puntos
  while (puntosRestantes.length > 0) {

    let mejorPunto = null
    let mejorIndice = -1
    let mejorScore = Infinity

    // recorremos todos los puntos restantes
    puntosRestantes.forEach((punto, index) => {

      // calculamos distancia desde la posicion actual
      const distancia = calcularDistanciaMetros(
        posicionActual.latitud,
        posicionActual.longitud,
        punto.latitud,
        punto.longitud
      )

      // ---------------------------------------------------
      // HEURISTICA
      //
      // menor score = mejor punto
      //
      // la importancia reduce el score
      // por lo que puntos mas importantes
      // tienen prioridad aunque esten mas lejos
      //
      // Podemos ajustar el valor de 150
      // a cuanto mas valor, menos importa la distancia
      // a cuanto menor valor, solo se toma en cuenta la distancia
      // ---------------------------------------------------

      const score = distancia - ((punto.importancia ?? 5) * 150)

      // si encontramos un mejor candidato lo guardamos
      if (score < mejorScore) {
        mejorScore = score
        mejorPunto = punto
        mejorIndice = index
      }
    })

    // añadimos el mejor punto al resultado final
    puntosOrdenados.push(mejorPunto)

    // actualizamos la posicion actual
    posicionActual = mejorPunto

    // eliminamos el punto ya visitado
    puntosRestantes.splice(mejorIndice, 1)
  }

  return puntosOrdenados
}
