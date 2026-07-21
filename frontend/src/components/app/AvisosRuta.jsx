// ---------------------------------------------------
// AVISOS SOBRE EL MAPA: duracion/distancia de ruta,
// todos los puntos son de pago, GPS denegado
// ---------------------------------------------------

function AvisosRuta({

  cargandoRuta,
  duracionRuta,
  distanciaRuta,
  rutaSeleccionada,
  duracionCerrada,
  setDuracionCerrada,

  mensajeTodosPago,
  setMensajeTodosPago,

  gpsDenegado,
  setGpsDenegado,

}) {

  return (
    <>

      {/* -------------------------------- */}
      {/* DURACION Y DISTANCIA DE LA RUTA  */}
      {/* -------------------------------- */}

      {!cargandoRuta && duracionRuta && rutaSeleccionada && !duracionCerrada && (
        <div className="duracion-ruta-box">
          Duración aproximada: <strong>{duracionRuta}</strong>
          {distanciaRuta && (
            <> Distancia: <strong>{distanciaRuta} km</strong></>
          )}
          <button
            className="cerrar-duracion"
            onClick={() => setDuracionCerrada(true)}
          >
            X
          </button>
        </div>
      )}

      {/* -------------------------------- */}
      {/* AVISO TODOS LOS PUNTOS SON PAGO  */}
      {/* -------------------------------- */}
      {mensajeTodosPago && (
        <div className="todospago-ruta-box">
          Todos los puntos son de pago, manteniendo ruta original
          <button
            className="cerrar-todospago"
            onClick={() => setMensajeTodosPago(false)}
          >
            X
          </button>
        </div>
      )}

      {/* -------------------------------- */}
      {/* AVISO GPS DENEGADO               */}
      {/* -------------------------------- */}
      {gpsDenegado && (
        <div className="gps-ruta-box aviso-gps">
          AVISO: No se ha permitido la localización GPS
          <button
            className="gps-duracion"
            onClick={() => setGpsDenegado(false)}
          >
            X
          </button>
        </div>
      )}

    </>
  )
}

export default AvisosRuta
