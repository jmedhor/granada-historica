import { useEffect } from 'react'

// ---------------------------------------------------
// CENTRA EL MAPA EN EL SIGUIENTE PUNTO
// DURANTE LA NAVEGACION
// ---------------------------------------------------

export function useCentradoNavegacion({ mapRef, modoNavegacion, segmentoActual, ordenPuntos }) {

  useEffect(() => {

    // Seguridad
    if (!modoNavegacion) return

    // Punto destino del tramo actual
    const siguientePunto =
      ordenPuntos?.[segmentoActual]

    if (!siguientePunto) return

    // Centra mapa

    mapRef.current.flyTo(
      [
        siguientePunto.latitud,
        siguientePunto.longitud
      ],
      17,
      {
        duration: 1.2
      }
    )

  }, [

    modoNavegacion,
    segmentoActual,
    ordenPuntos

  ])

}
