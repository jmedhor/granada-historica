import { useState, useEffect } from 'react'
import { obtenerRutaOptima } from '../services/osrm.js'
import { calcularDistanciaMetros } from '../utils/distancia.js'
import { calcularDuracionRuta, calcularDistanciaRuta, filtrarPuntosPorTiempo } from '../utils/rutaCalculos.js'

export function usePuntosCercanos({

  todosPuntos,
  userLocation,
  userLocationRuta,
  userLocationRef,
  radioMetros,

  evitarPago,
  usarFiltroTiempo,
  horasDisponibles,

  modoCercanos,
  setModoCercanos,
  setPuntosCercanos,

  modoNavegacion,
  rutaSeleccionada,
  setRutaSeleccionada,

  mapRef,

  cargandoRuta,
  setCargandoRuta,

  setOrdenPuntos,
  setRutasSegmentos,
  setRutasSegmentosLocal,

  setDuracionRuta,
  setDistanciaRuta,

  setMensajeTiempo,
  setMensajeTodosPago,

}) {

  // Datos bases para ruta dinamica por puntos cercanos
  const [rutaCercanosBase, setRutaCercanosBase] = useState(null)

  // ---------------------------------------------------
  // CREA RUTA DINAMICA DESDE PUNTOS CERCANOS
  // ---------------------------------------------------

  const crearRutaDesdePuntosCercanos = async (puntosSeleccionados) => {

    if(cargandoRuta){
      return
    }

    // Seguridad
    if (!puntosSeleccionados || puntosSeleccionados.length === 0) return

    setCargandoRuta(true)

    // --------------------------------
    // SOLO RUTA OPTIMA
    // --------------------------------

    // --------------------------------
    // AVISO SI TODOS LOS PUNTOS SON DE PAGO
    // --------------------------------
    const todossonPago = evitarPago && puntosSeleccionados.every(p => p.pago)
    if (todossonPago) {
      setMensajeTodosPago(true)
    } else {
      setMensajeTodosPago(false)
    }

    try{

      let resultado = await obtenerRutaOptima(
        puntosSeleccionados,
        userLocationRef.current,
        evitarPago
      )


      setRutaCercanosBase(puntosSeleccionados)

      // ---------------------------------------------------
      // APLICAR FILTRO DE TIEMPO (SI ESTA ACTIVO)
      // ---------------------------------------------------

      let puntosFinales = resultado.puntosOrdenados
      let legsFinales = resultado.legs

      if (usarFiltroTiempo) {

        let resultadoT

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



        resultadoT = await obtenerRutaOptima(
          puntosFinales,
          userLocationRef.current,
          evitarPago
        )

        legsFinales = resultadoT.legs

      }

      // ---------------------------------------------------
      // GUARDAR RESULTADO FINAL
      // ---------------------------------------------------

      setOrdenPuntos(puntosFinales)
      setRutasSegmentos(legsFinales)
      setRutasSegmentosLocal(legsFinales)

      // --------------------------------
      // CALCULAR DURACION
      // --------------------------------

      const tiempoTexto = calcularDuracionRuta(
        legsFinales,
        puntosFinales
      )

      setDuracionRuta(tiempoTexto)

      const distanciaTexto = calcularDistanciaRuta(legsFinales)
      console.log("la distancia es ")
      console.log(distanciaTexto)
      setDistanciaRuta(distanciaTexto)

      // --------------------------------
      // ACTIVA RUTA VIRTUAL DE CERCANOS
      // --------------------------------

      setRutaSeleccionada(prev => {

        if (prev?.id === "cercanos") {
          return prev
        }

        return {
          id: "cercanos",
          nombre: "Ruta personalizada"
        }

      })

      setModoCercanos(false)

    }

    catch (err) {

      console.error(
        "Error creando ruta desde puntos cercanos:",
        err
      )

    }

    finally {

      setCargandoRuta(false)

    }
  }

  // ---------------------------------------------------
  // BUSCA PUNTOS CERCANOS AL USUARIO
  // APLICANDO FILTROS ACTIVOS
  // ---------------------------------------------------

  const buscarPuntosCercanos = async () => {

    // --------------------------------
    // RADIO MAXIMO
    // --------------------------------

    const RADIO_METROS = radioMetros

    // --------------------------------
    // FILTRAR PUNTOS CERCANOS
    // + FILTRO EVITAR PAGO
    // --------------------------------

    const cercanos = todosPuntos.filter(

      (punto) => {

        // -----------------------------
        // FILTRO PUNTOS DE PAGO
        // -----------------------------

        if (evitarPago && punto.pago) {
          return false
        }

        // -----------------------------
        // CALCULO DISTANCIA
        // -----------------------------

        const distancia =
          calcularDistanciaMetros(

            userLocation.lat,
            userLocation.lon,

            punto.latitud,
            punto.longitud
          )

        return distancia <= RADIO_METROS
      }

    )

    // --------------------------------
    // GUARDAR PUNTOS CERCANOS
    // --------------------------------

    setPuntosCercanos(cercanos)

    // --------------------------------
    // ACTIVAR PANEL CERCANOS
    // --------------------------------

    setModoCercanos(true)

    // --------------------------------
    // CENTRAR MAPA
    // --------------------------------

    if (mapRef.current) {

      mapRef.current.flyTo(
        [
          userLocation.lat,
          userLocation.lon
        ],
        14
      )

    }

    // --------------------------------
    // SI NO HAY PUNTOS -> STOP
    // --------------------------------

    if (cercanos.length === 0) {
      return
    }


  }

  // ---------------------------------------------------
  // RECALCULA PUNTOS CERCANOS AL MOVER userLocation
  // ---------------------------------------------------

  useEffect(() => {

    if (!modoCercanos) return
    if (todosPuntos.length === 0) return

    const RADIO_METROS = radioMetros

    const cercanos = todosPuntos.filter((punto) => {

      // Filtra puntos de pago
      if (evitarPago && punto.pago) {
        return false
      }

      const distancia = calcularDistanciaMetros(
        userLocation.lat,
        userLocation.lon,
        punto.latitud,
        punto.longitud
      )

      return distancia <= RADIO_METROS
    })

    setPuntosCercanos(cercanos)

  }, [userLocationRuta, todosPuntos, modoCercanos, evitarPago])


  // ---------------------------------------------------
  // RECALCULA RUTA DINAMICA DE CERCANOS
  // CUANDO CAMBIAN LOS FILTROS
  // ---------------------------------------------------

  useEffect(() => {


    // No recalculamos la ruta si estamos en modo navegacion

    if(modoNavegacion){
      return
    }

    // --------------------------------
    // SOLO SI EXISTE RUTA DE CERCANOS
    // --------------------------------

    if (
      !rutaSeleccionada ||
      rutaSeleccionada.id !== "cercanos"
    ) {
      return
    }

    // --------------------------------
    // SEGURIDAD
    // --------------------------------

    if (
      !rutaCercanosBase ||
      rutaCercanosBase.length === 0
    ) {
      return
    }

    // --------------------------------
    // RECALCULAR RUTA
    // --------------------------------

    crearRutaDesdePuntosCercanos(
      rutaCercanosBase
    )

  }, [

    evitarPago,
    usarFiltroTiempo,
    horasDisponibles,
    userLocationRuta

  ])

  return { buscarPuntosCercanos, crearRutaDesdePuntosCercanos, rutaCercanosBase }
}
