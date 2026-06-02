// ---------------------------------------------------
// ARCHIVO AUXILIAR PARA UNIFICAR TRADUCCION DE MANIOBRAS
// EN PANEL RUTA Y DRAWER NAVEGACION
// ---------------------------------------------------

// ---------------------------------------------------
// ICONOS SVG PARA CADA MANIOBRA
// ---------------------------------------------------

export function iconoManiobra(tipo, modifier) {
  if (tipo === "depart")  return "🚶"
  if (tipo === "arrive")  return "📍"
  if (tipo === "roundabout" || tipo === "rotary") return "🔄"

  if (tipo === "turn" || tipo === "new name") {
    if (modifier === "left")         return "⬅️"
    if (modifier === "sharp left")   return "↰"
    if (modifier === "slight left")  return "↖️"
    if (modifier === "right")        return "➡️"
    if (modifier === "sharp right")  return "↱"
    if (modifier === "slight right") return "↗️"
    if (modifier === "straight")     return "⬆️"
    if (modifier === "uturn")        return "↩️"
  }

  return "⬆️"
}

// ---------------------------------------------------
// TEXTO LEGIBLE PARA CADA MANIOBRA
// ---------------------------------------------------

export function traducirManiobra(tipo, modifier, nombre) {
  const calle = nombre ? `por ${nombre}` : ""

  if (tipo === "depart")  return `Sal ${calle}`
  if (tipo === "arrive")  return "Has llegado a tu destino"

  if (tipo === "roundabout" || tipo === "rotary") {
    return `En la rotonda, toma la salida ${calle}`
  }

  if (tipo === "turn" || tipo === "new name") {
    if (modifier === "left")         return `Gira a la izquierda ${calle}`
    if (modifier === "sharp left")   return `Gira bruscamente a la izquierda ${calle}`
    if (modifier === "slight left")  return `Gira ligeramente a la izquierda ${calle}`
    if (modifier === "right")        return `Gira a la derecha ${calle}`
    if (modifier === "sharp right")  return `Gira bruscamente a la derecha ${calle}`
    if (modifier === "slight right") return `Gira ligeramente a la derecha ${calle}`
    if (modifier === "straight")     return `Continúa recto ${calle}`
    if (modifier === "uturn")        return `Da la vuelta ${calle}`
  }

  if (tipo === "merge")    return `Incorpórate ${calle}`
  if (tipo === "fork")     return `En el cruce ${calle}`
  if (tipo === "end of road") return `Al final de la calle ${calle}`

  return `Continúa ${calle}`
}


// ---------------------------------------------------
// OBTIENE LA COORDENADA FINAL DE UN STEP
// OSRM devuelve geometry.coordinates como [lon, lat]
// ---------------------------------------------------

export function coordFinalStep(step) {
  const coords = step?.geometry?.coordinates
  if (!coords || coords.length === 0) return null
  const ultimo = coords[coords.length - 1]
  return { lat: ultimo[1], lon: ultimo[0] }
}

// ---------------------------------------------------
// FORMATEA METROS A TEXTO LEGIBLE
// ---------------------------------------------------

export function formatearDistancia(metros) {
  if (metros >= 1000) return `${(metros / 1000).toFixed(1)} km`
  return `${Math.round(metros)} m`
}
