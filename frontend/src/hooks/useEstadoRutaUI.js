import { useState, useEffect } from 'react'

// ---------------------------------------------------
// ESTADO DE UI DERIVADO DE LA RUTA SELECCIONADA:
// - mensajeTiempo: aviso cuando no hay tiempo para la ruta
// - todosPuntosPago: se activa cuando todos los puntos son de pago
//   y se mantiene mostrando la ruta original
// Agrupados porque comparten los mismos triggers de reseteo
// ---------------------------------------------------

export function useEstadoRutaUI({

  rutaSeleccionada,
  usarFiltroTiempo,

  mensajeTodosPago,
  setMensajeTodosPago,

  setRutasSegmentos,
  setRutasSegmentosLocal,
  setOrdenPuntos,
  setDuracionRuta,
  setDistanciaRuta,

}) {

  // Mensaje para cuando no hay tiempo para hacer la ruta
  const [mensajeTiempo, setMensajeTiempo] = useState(null)

  // Indicador de si todos los puntos son de pago
  // Recibe la informacion de mensajeTodosPago
  const [todosPuntosPago, setTodosPuntosPago] = useState(null)

  // ---------------------------------------------------
  // MUESTRA AVISO DE TODOS LOS PUNTOS SON DE PAGO
  // ---------------------------------------------------

  useEffect(() => {
    if(mensajeTodosPago){
      setTodosPuntosPago(true)
    }
  }, [mensajeTodosPago])

  // ---------------------------------------------------
  // LIMPIA MENSAJE DE TIEMPO
  // ---------------------------------------------------

  useEffect(() => {

    // Si no hay ruta seleccionada
    // o el filtro esta desactivado
    if (!rutaSeleccionada || !usarFiltroTiempo) {

      setMensajeTiempo(null)

    }

  }, [rutaSeleccionada, usarFiltroTiempo])

  // ---------------------------------------------------
  // RESETEA DATOS CUANDO SE QUITA LA RUTA
  // ---------------------------------------------------

  useEffect(() => {

    if (!rutaSeleccionada) {

      setRutasSegmentos([])

      setRutasSegmentosLocal([])

      setOrdenPuntos([])

      setDuracionRuta(null)
      setDistanciaRuta(null)

      setMensajeTodosPago(false)
      setTodosPuntosPago(false);

    }

  }, [rutaSeleccionada])

  return { mensajeTiempo, setMensajeTiempo, todosPuntosPago }

}
