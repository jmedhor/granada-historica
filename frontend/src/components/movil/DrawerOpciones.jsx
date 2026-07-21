// ---------------------------------------------------
// DRAWER DERECHA - OPCIONES
// Tipo de ruta, filtros, acceso a admin
// Solo movil
// ---------------------------------------------------

function DrawerOpciones({

  mostrarOpcionesMovil,
  setMostrarOpcionesMovil,

  navigate,

  modoRuta,
  setModoRuta,

  evitarPago,
  setEvitarPago,

  usarFiltroTiempo,
  setUsarFiltroTiempo,

  horasDisponibles,
  setHorasDisponibles,

}) {

  if (!mostrarOpcionesMovil) return null

  return (
    <>
      <div
        className="menu-movil-overlay"
        onClick={() => setMostrarOpcionesMovil(false)}
      />

      <div className="menu-movil-lateral menu-movil-lateral--derecha">

        <div className="menu-movil-header">
          <span>Opciones</span>
          <button
            className="menu-movil-cerrar"
            onClick={() => setMostrarOpcionesMovil(false)}
          >
            &#10005;
          </button>
        </div>

        <div className="menu-movil-seccion">
          <p className="menu-movil-titulo-seccion">Tipo de ruta</p>

          <button
            className={modoRuta === "optima" ? "menu-movil-btn activo" : "menu-movil-btn"}
            onClick={() => setModoRuta("optima")}
          >
            Ruta mas corta
          </button>

        </div>

        <div className="menu-movil-seccion">
          <p className="menu-movil-titulo-seccion">Filtros</p>

          <button
            className={evitarPago ? "menu-movil-btn activo pago" : "menu-movil-btn"}
            onClick={() => setEvitarPago(!evitarPago)}
          >
            {evitarPago ? "Mostrando sitios gratuitos" : "Sitios gratuitos"}
          </button>

          <button
            className={usarFiltroTiempo ? "menu-movil-btn activo peligro" : "menu-movil-btn"}
            onClick={() => setUsarFiltroTiempo(!usarFiltroTiempo)}
          >
            {usarFiltroTiempo ? `Tiempo: ${horasDisponibles}h activado` : "Filtrar por tiempo"}
          </button>

          {usarFiltroTiempo && (
            <div className="menu-movil-slider-grupo">
              <div className="menu-movil-slider-labels">
                <span>1h</span>
                <span className="menu-movil-slider-valor">{horasDisponibles}h</span>
                <span>7h</span>
              </div>
              <input
                type="range"
                className="menu-movil-slider"
                min={1}
                max={7}
                step={1}
                value={horasDisponibles}
                onChange={e => setHorasDisponibles(Number(e.target.value))}
              />
              <div className="menu-movil-slider-ticks">
                {[1,2,3,4,5,6,7].map(h => (
                  <span
                    key={h}
                    className={horasDisponibles === h ? "tick activo" : "tick"}
                    onClick={() => setHorasDisponibles(h)}
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* BOTON RECALCULAR - solo movil */}
        {/* DESACTIVADO AHORA MISMO POR WATCHPOSITION */}
        {false &&
          (
        <div className="menu-movil-seccion">
          <p className="menu-movil-titulo-seccion">GPS</p>
          <button
            className="menu-movil-btn"
          >
            Recalcular posición
          </button>
        </div>
        )}

        <div className="menu-movil-seccion-admin">
          <button
            className="menu-movil-btn"
            onClick={() => navigate('/admin')}
          >
            Panel de administracion
          </button>
        </div>


      </div>
    </>
  )
}

export default DrawerOpciones
