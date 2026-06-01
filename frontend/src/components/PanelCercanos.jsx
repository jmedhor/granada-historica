import { coloresRuta } from "../utils/coloresRuta.js"


function PinIcono({ color }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="16" height="24" style={{ flexShrink: 0 }}>
      <path
        d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24S24 21 24 12C24 5.373 18.627 0 12 0z"
        fill={color}
        stroke="white"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="12" r="5" fill="white" opacity="0.85" />
    </svg>
  )
}

function PanelCercanos({

  puntosCercanos,
  mapRef,
  setModoCercanos,
  setPuntosCercanos

}) {

  // ---------------------------------------------------
  // CENTRAR MAPA EN UN PUNTO
  // ---------------------------------------------------

  const irAPunto = (punto) => {

    if (!mapRef.current) return

    mapRef.current.flyTo(
      [punto.latitud, punto.longitud],
      17,
      {
        duration: 1.2
      }
    )

    if (mapRef.current.centrarYAbrir) {
      mapRef.current.centrarYAbrir(punto)
    }
  }

  // ---------------------------------------------------
  // RENDER
  // ---------------------------------------------------

  return (

    <div className="panel-cercanos">

        <button
        className="btn-volver"
        onClick={() => {
            setModoCercanos(false)
            setPuntosCercanos([])
        }}
        >
        ← Volver
        </button>
      <h3>
        Puntos cercanos (Aprox. 500m)
      </h3>

      {puntosCercanos.length === 0 && (
        <p className="no-cercanos">
          No hay puntos cercanos
        </p>
      )}

      {/* --------------------------------------------------- */}
      {/* BOTON CREAR RUTA DESDE CERCANOS */}
      {/* --------------------------------------------------- */}

      {puntosCercanos.length > 0 && (

        <div className="bloque-ruta-cercanos">

          <button
            className="btn-start"
            onClick={() => {

              if (mapRef.current?.crearRutaDesdeCercanos) {

                mapRef.current.crearRutaDesdeCercanos(
                  puntosCercanos
                )

              }

            }}
          >
            Ruta personalizada
          </button>

          {/* SEPARADOR VISUAL */}
          <div className="separador-cercanos"></div>

        </div>

      )}

      <ul>

        {puntosCercanos.map((punto) => (

        <li
          key={`${punto.id}-${punto.ruta_id}`}
          onClick={() => irAPunto(punto)}
          style={{ borderLeftColor: punto.ruta_color || '#e63946' }}
        >
          <span className="paso-num" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none" }}>
            <PinIcono color={punto.ruta_color || '#e63946'} />
          </span>
          <span className="paso-texto3">{punto.nombre}</span>
        </li>

        ))}

      </ul>

    </div>

  )
}

export default PanelCercanos
