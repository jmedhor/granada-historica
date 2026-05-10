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
        📍 Puntos cercanos
      </h3>

      {puntosCercanos.length === 0 && (
        <p className="no-cercanos">
          No hay puntos cercanos
        </p>
      )}

      <ul>

        {puntosCercanos.map((punto) => (

          <li
            key={punto.id}
            onClick={() => irAPunto(punto)}
          >

            <span className="paso-num">
              📌
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
