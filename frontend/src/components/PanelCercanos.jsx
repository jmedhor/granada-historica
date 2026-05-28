import { coloresRuta } from "../utils/coloresRuta.js"

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

              style={{
                background: coloresRuta[punto.ruta_id],
                color: "white",
                borderRadius: "10px",
                marginBottom: "10px"
              }}
            >

            <span
              className="paso-num"
            >
              -
            </span>

            <span className="paso-texto2">
              {punto.nombre}
            </span>

          </li>

        ))}

      </ul>

    </div>

  )
}

export default PanelCercanos
