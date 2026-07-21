import { useState, useEffect } from 'react'
import { getConfiguracion } from '../services/api.js'

// ---------------------------------------------------
// OBTENER RADIO METROS PARA PUNTOS CERCANOS
// ---------------------------------------------------

export function useRadioCercanos() {

  // radio de metros para puntos cercanos
  const [radioMetros, setRadioMetros] = useState(500)

  useEffect(() => {
    getConfiguracion('radio_cercanos')
      .then(valor => setRadioMetros(Number(valor)))
      .catch(() => setRadioMetros(500)) // fallback si falla
  }, [])

  return radioMetros
}
