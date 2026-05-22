// ---------------------------------------------------
// Calcula distancia entre dos coordenadas usando
// la formula de Haversine
// Devuelve distancia en metros
// ---------------------------------------------------

export function calcularDistanciaMetros(

  lat1,
  lon1,
  lat2,
  lon2

) {

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
