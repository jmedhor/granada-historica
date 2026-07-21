import { useState, useEffect } from 'react'

// ---------------------------------------------------
// Controla si el usuario ha cerrado el mensaje de
// duracion de ruta. Se resetea cada vez que cambia
// la ruta seleccionada, para que el aviso vuelva a
// mostrarse en la ruta nueva
// ---------------------------------------------------

export function useDuracionCerrada(rutaSeleccionada) {

  const [duracionCerrada, setDuracionCerrada] = useState(false)

  useEffect(() => {
    setDuracionCerrada(false)
  }, [rutaSeleccionada])

  return [duracionCerrada, setDuracionCerrada]

}
