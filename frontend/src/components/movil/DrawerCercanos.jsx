import { coloresRuta } from '../../utils/coloresRuta.js'

// ---------------------------------------------------
// DRAWER MOVIL - PUNTOS CERCANOS
// Equivalente movil de PanelCercanos
// Props:
//   puntosCercanos  - lista de puntos cercanos al usuario
//   mapRef          - referencia al mapa
//   setModoCercanos - desactiva el modo cercanos
//   setPuntosCercanos - limpia la lista de cercanos
//   onCerrar        - cierra el drawer
// ---------------------------------------------------

function DrawerCercanos({
  puntosCercanos,
  mapRef,
  setModoCercanos,
  setPuntosCercanos,
  onPincharPunto,
  onCerrar,
  onRutaCercanos,
  radioMetros
}) {

  // -----------------------------------------
  // Centra el mapa en un punto y abre su popup
  // -----------------------------------------

  const irAPunto = (punto) => {

    if (!mapRef.current) return

    mapRef.current.flyTo(
      [punto.latitud, punto.longitud],
      17,
      { duration: 1.2 }
    )

    if (mapRef.current.centrarYAbrir) {
      mapRef.current.centrarYAbrir(punto)
    }

    onPincharPunto()

  }

  // -----------------------------------------
  // Render
  // -----------------------------------------

  return (
    <div className="menu-movil-seccion">

      {/* VOLVER */}
      <button
        className="menu-movil-btn"
        onClick={() => {
          setModoCercanos(false)
          setPuntosCercanos([])
          onCerrar()
        }}
      >
        ← Volver
      </button>

      {/* SIN PUNTOS CERCANOS */}
      {puntosCercanos.length === 0 && (
        <p style={{ fontSize: 13, color: '#999', margin: '10px 0' }}>
          No hay puntos cercanos en un radio de {radioMetros ?? 500}m
        </p>
      )}

      {/* BOTON CREAR RUTA DESDE CERCANOS */}
      {puntosCercanos.length > 0 && (
        <>
          <button
            className="menu-movil-btn activo"
            onClick={() => {
              if (mapRef.current?.crearRutaDesdeCercanos) {
                mapRef.current.crearRutaDesdeCercanos(puntosCercanos)
              }
              onRutaCercanos()
            }}
          >
            Ruta personalizada
          </button>

          <p className="menu-movil-titulo-seccion" style={{ marginTop: 12 }}>
            Puntos cercanos (aprox. {radioMetros ?? 500}m)
          </p>
        </>
      )}

      {/* LISTA DE PUNTOS */}
      {puntosCercanos.map(punto => (
        <button
          key={`${punto.id}-${punto.ruta_id}`}
          className="menu-movil-btn"
          style={{
            borderLeftColor: punto.ruta_color || '#e63946',
            borderLeftWidth: 4
          }}
          onClick={() => irAPunto(punto)}
        >
          {punto.nombre}
        </button>
      ))}

    </div>
  )
}

export default DrawerCercanos
