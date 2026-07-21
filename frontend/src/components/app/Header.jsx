import logoUGR from '../../../assets/logo-ugr.png'

// ---------------------------------------------------
// HEADER SUPERIOR
// Titulo, logo UGR, y controles de ruta (solo escritorio)
// ---------------------------------------------------

function Header({

  mostrarPanelMovil,
  setMostrarPanelMovil,

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

  return (

    <header className="app-header">

      <div className="header-top-row">

        {/* BOTON HAMBURGUESA IZQUIERDA - abre drawer de rutas */}
        <button
          className="btn-panel-movil"
          onClick={() => setMostrarPanelMovil(prev => !prev)}
          aria-label="Ver rutas y puntos"
        >
          &#9776;
        </button>

        <div className="header-left">
          <h1 className="titulo-app">Granada Histórica</h1>
          <span className="subtitulo-app">
            Rutas historicas por la ciudad de Granada
          </span>
        </div>


        <div className="header-ugr">
          <a href="https://www.ugr.es">
            <img
              src={logoUGR}
              alt="Universidad de Granada"
              className="logo-ugr"
            />
          </a>
        </div>

        {/* CONTROLES - solo visibles en escritorio */}
        <div className="header-right">

          <button
            className="btn-admin"
            onClick={() => navigate('/admin')}
          >
            Admin
          </button>

          <div className="selector-ruta">
            <div className="toggle-group">

              <button
                className={modoRuta === "optima" ? "toggle active" : "toggle"}
                onClick={() => setModoRuta("optima")}
              >
                Ruta mas corta
              </button>

              <button
                className={evitarPago ? "toggle pago active" : "toggle danger"}
                onClick={() => setEvitarPago(!evitarPago)}
              >
                Sitios gratuitos
              </button>

              <div className="toggle-group">

                <button
                  className={usarFiltroTiempo ? "toggle danger active" : "toggle danger"}
                  onClick={() => setUsarFiltroTiempo(!usarFiltroTiempo)}
                >
                  Tiempo disponible: {horasDisponibles}h
                </button>

                {usarFiltroTiempo && (
                  <select
                    className="toggle"
                    value={horasDisponibles}
                    onChange={(e) => setHorasDisponibles(Number(e.target.value))}
                  >
                    <option value={1}>1 hora</option>
                    <option value={2}>2 horas</option>
                    <option value={3}>3 horas</option>
                    <option value={4}>4 horas</option>
                    <option value={5}>5 horas</option>
                    <option value={6}>6 horas</option>
                    <option value={7}>7 horas</option>
                  </select>
                )}

              </div>

            </div>
          </div>

        </div>

      </div>

    </header>

  )
}

export default Header
