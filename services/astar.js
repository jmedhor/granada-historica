export function calcularRutaAStar(puntos, userLocation) {

  const restantes = [...puntos]

  const ordenados = []

  let actual = {
    latitud: userLocation.lat,
    longitud: userLocation.lon
  }

  while (restantes.length > 0) {

    let mejorPunto = null
    let mejorScore = Infinity
    let mejorIndex = -1

    restantes.forEach((punto, index) => {

      const distancia = calcularDistancia(
        actual.latitud,
        actual.longitud,
        punto.latitud,
        punto.longitud
      )

      // IMPORTANTE:
      // cuanto mayor importancia, menor score
      // menos valor prioriza cercania (150)
      // mayor valor prioriza importancia

      const score = distancia - (punto.importancia * 150)

      if (score < mejorScore) {
        mejorScore = score
        mejorPunto = punto
        mejorIndex = index
      }
    })

    ordenados.push(mejorPunto)

    actual = mejorPunto

    restantes.splice(mejorIndex, 1)



  }

  return ordenados
}

function calcularDistancia(lat1, lon1, lat2, lon2) {

  const radioTierra = 6371e3

  const latitud1 = lat1 * Math.PI / 180
  const latitud2 = lat2 * Math.PI / 180

  const diferenciaLatitud = (lat2 - lat1) * Math.PI / 180
  const diferenciaLongitud = (lon2 - lon1) * Math.PI / 180

  const a =
    Math.sin(diferenciaLatitud / 2) * Math.sin(diferenciaLatitud / 2) +
    Math.cos(latitud1) * Math.cos(latitud2) *
    Math.sin(diferenciaLongitud / 2) * Math.sin(diferenciaLongitud / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return radioTierra * c
}
