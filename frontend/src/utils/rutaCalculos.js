// ---------------------------------------------------
// CALCULA EL TEXTO DE DURACION DE RUTA
// ---------------------------------------------------

  // ---------------------------------
  // Tiempo aproximado de visita
  // Se obtiene el tiempo aproximado de cada punto
  // desde la BD
  //
  // Aquellas que no tienen tiempo asignado se dejan en
  // 15 minutos por punto turistico
  // ------------------------------

export function calcularDuracionRuta(legs, puntosOrdenados) {

  // ---------------------------------
  // TIEMPO DE DESPLAZAMIENTO (OSRM)
  // ---------------------------------
  const segundosRuta = legs.reduce(
    (acc, leg) => acc + (leg.duration || 0),
    0
  )

  // ---------------------------------
  // TIEMPO DE VISITA REAL POR PUNTO
  // ---------------------------------
  const segundosVisita = puntosOrdenados.reduce((acc, punto) => {

    const minutos = punto.tiempo_visita ?? 15
    return acc + (minutos * 60)

  }, 0)

  // ---------------------------------
  // TOTAL
  // ---------------------------------
  const segundosTotales = segundosRuta + segundosVisita

  const horas = Math.floor(segundosTotales / 3600)

  const minutos = Math.floor((segundosTotales % 3600) / 60)

  if (horas > 0) {
    return `${horas} h ${minutos} min`
  }

  return `${minutos} min`
}

// ---------------------------------------------------
// CALCULA EL TEXTO DE DISTANCIA DE RUTA
// ---------------------------------------------------

  // ---------------------------------
  // Distancia en kilometros de la ruta generada
  // ------------------------------

export function calcularDistanciaRuta(legs) {
  const metros = legs.reduce(
    (acc, leg) => acc + (leg.distance || 0),
    0
  )
  return (metros / 1000).toFixed(2) // "1.34"
}

// ---------------------------------------------------
// FILTRA PUNTOS SEGUN TIEMPO DISPONIBLE
// ---------------------------------------------------

export function filtrarPuntosPorTiempo(
  puntosOrdenados,
  legs,
  horasDisponibles
) {

  const maxSegundos = horasDisponibles * 3600

  let acumulado = 0
  const resultado = []

  for (let i = 0; i < puntosOrdenados.length; i++) {

    const punto = puntosOrdenados[i]

    // --------------------------------
    // TIEMPO DE VISITA REAL
    // fallback: 15 min si no existe
    // --------------------------------
    const tiempoVisitaSegundos =
      (punto.tiempo_visita ?? 15) * 60

    acumulado += tiempoVisitaSegundos

    // --------------------------------
    // TIEMPO DE TRAYECTO (OSRM)
    // --------------------------------
    if (legs[i]) {
      acumulado += legs[i].duration
    }

    // --------------------------------
    // SI SE PASA DEL TIEMPO → STOP
    // --------------------------------
    if (acumulado > maxSegundos) {
      break
    }

    resultado.push(punto)
  }

  return resultado
}
