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
      const distancia = calcularDistancia(
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

      const score = distancia - (punto.importancia * 150)

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

// ---------------------------------------------------
// FUNCION AUXILIAR
// Calcula distancia entre dos coordenadas usando
// la formula de Haversine
// Devuelve distancia en metros
// ---------------------------------------------------

function calcularDistancia(lat1, lon1, lat2, lon2) {

  const RADIO_TIERRA = 6371e3

  // conversion de grados a radianes
  const latitud1 = gradosARadianes(lat1)
  const latitud2 = gradosARadianes(lat2)

  const diferenciaLatitud = gradosARadianes(lat2 - lat1)
  const diferenciaLongitud = gradosARadianes(lon2 - lon1)

  // formula Haversine
  const a =
    Math.sin(diferenciaLatitud / 2) ** 2 +
    Math.cos(latitud1) *
    Math.cos(latitud2) *
    Math.sin(diferenciaLongitud / 2) ** 2

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return RADIO_TIERRA * c
}

// ---------------------------------------------------
// Convierte grados a radianes
// ---------------------------------------------------

function gradosARadianes(grados) {
  return grados * Math.PI / 180
}
