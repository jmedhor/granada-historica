import { useEffect } from 'react'
import { obtenerRutaHistorica, obtenerRutaOptima } from '../services/osrm.js'
import { calcularDuracionRuta, calcularDistanciaRuta, filtrarPuntosPorTiempo } from '../utils/rutaCalculos.js'

// ---------------------------------------------------
// CARGA LA RUTA DESDE OSRM
// Se ejecuta cuando cambia la ruta seleccionada,
// los puntos, el modo de ruta, la posicion del
// usuario (debounced) o los filtros activos
// ---------------------------------------------------

export function useCargarRuta({

  rutaSeleccionada,
  todosPuntos,
  puntos,

  modoRuta,
  userLocationRuta,
  userLocationRef,

  evitarPago,
  usarFiltroTiempo,
  horasDisponibles,

  modoNavegacion,

  setCargandoRuta,
  setMensajeTodosPago,
  setMensajeTiempo,

  setOrdenPuntos,
  setRutasSegmentos,
  setRutasSegmentosLocal,

  setDuracionRuta,
  setDistanciaRuta,

}) {

  useEffect(() => {

    // No recalculamos la ruta si estamos en modo navegacion

    if(modoNavegacion){
      return
    }

    const cargarRuta = async () => {

      // Seguridad
      if (!rutaSeleccionada || puntos.length === 0) {
        return
      }

      setCargandoRuta(true)

      try {


        // --------------------------------
        // AVISO SI TODOS LOS PUNTOS SON DE PAGO
        // --------------------------------
        const todossonPago = evitarPago && puntos.every(p => p.pago)
        if (todossonPago) {
          setMensajeTodosPago(true)
        } else {
          setMensajeTodosPago(false)
        }


        let resultado

        // --------------------------------
        // DEPRECATED
        // RUTA HISTORICA
        // --------------------------------

        if (modoRuta === "historica") {

          resultado = await obtenerRutaHistorica(
            puntos,
            userLocationRef.current,
            evitarPago
          )

        }

        // --------------------------------
        // RUTA OPTIMA
        // --------------------------------


        else {

          resultado = await obtenerRutaOptima(
            puntos,
            userLocationRef.current,
            evitarPago
          )

        }

        // ---------------------------------------------------
        // APLICAR FILTRO DE TIEMPO (SI ESTA ACTIVO)
        // ---------------------------------------------------

        let puntosFinales = resultado.puntosOrdenados
        let legsFinales = resultado.legs

        if (usarFiltroTiempo) {

          puntosFinales = filtrarPuntosPorTiempo(
            resultado.puntosOrdenados,
            resultado.legs,
            horasDisponibles
          )

          // --------------------------------
          // NO HAY TIEMPO PARA NINGUN PUNTO
          // --------------------------------

          if (puntosFinales.length === 0) {

            setMensajeTiempo(
              "No dispones de tiempo suficiente para realizar esta ruta."
            )

            setOrdenPuntos([])
            setRutasSegmentos([])
            setRutasSegmentosLocal([])
            setDuracionRuta(null)
            setDistanciaRuta(null)
            setMensajeTodosPago(false)
            return
          }

          // --------------------------------
          // LIMPIAR MENSAJE SI TODO OK
          // --------------------------------

          setMensajeTiempo(null)

          let resultadoT

          if (modoRuta === "historica" ) {

            resultadoT = await obtenerRutaHistorica(
              puntosFinales,
              userLocationRef.current,
              evitarPago
            )

          }
          else {

            resultadoT = await obtenerRutaOptima(
              puntosFinales,
              userLocationRef.current,
              evitarPago
            )

          }

          legsFinales = resultadoT.legs

        }

        // ---------------------------------------------------
        // GUARDAR RESULTADO FINAL
        // ---------------------------------------------------

        setOrdenPuntos(puntosFinales)
        setRutasSegmentos(legsFinales)
        setRutasSegmentosLocal(legsFinales)

        // --------------------------------
        // CALCULA DURACION APROXIMADA
        // --------------------------------

        const tiempoTexto = calcularDuracionRuta(
          legsFinales,
          puntosFinales
        )

        setDuracionRuta(tiempoTexto)
        const distanciaTexto = calcularDistanciaRuta(legsFinales)
        setDistanciaRuta(distanciaTexto)

      }

      catch (err) {

        console.error(
          "Error cargando ruta:",
          err
        )

      }

      finally {

        setCargandoRuta(false)

      }
    }

    cargarRuta()

  }, [
    rutaSeleccionada,
    todosPuntos,
    modoRuta,
    userLocationRuta,
    evitarPago,
    usarFiltroTiempo,
    horasDisponibles,
  ])

}
