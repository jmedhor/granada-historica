import { Marker, Popup } from 'react-leaflet'
import PopupRuta from '../Popup'
import PopupInformacion from '../PopupInformacion.jsx'

// ---------------------------------------------------
// MARKER + POPUP DE UN PUNTO (ruta o info)
// ---------------------------------------------------

function MarkerPunto({
  punto,
  ruta = null,
  claveMarker,
  iconoPunto,
  markersRef,
  modoPopup,
  rutaSeleccionada,
  setRutaSeleccionada,
  setModoPopup,
  abrirInformacion,
  modoHistoriador,
  setModoHistoriador,
  volverARuta,
}) {

  const esMobil = window.innerWidth < 768

  return (
    <Marker
      position={[punto.latitud, punto.longitud]}
      icon={iconoPunto(ruta)}
      ref={(el) => { if (el) markersRef.current[claveMarker(punto.id, ruta?.id)] = el }}
    >
      <Popup maxHeight={esMobil ? 500 : 350}>
        {modoPopup === "ruta" && (
          <PopupRuta
            punto={punto}
            ruta={ruta}
            rutaSeleccionada={rutaSeleccionada}
            setRutaSeleccionada={setRutaSeleccionada}
            setModoPopup={setModoPopup}
            abrirInformacion={() => abrirInformacion(punto, ruta)}
          />
        )}
        {modoPopup === "info" && (
          <PopupInformacion
            punto={punto}
            ruta={ruta}
            modoHistoriador={modoHistoriador}
            setModoHistoriador={setModoHistoriador}
            setModoPopup={setModoPopup}
            volverARuta={() => volverARuta(punto, ruta)}
          />
        )}
      </Popup>
    </Marker>
  )
}

export default MarkerPunto
