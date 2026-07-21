import { useEffect } from 'react'

// ---------------------------------------------------
// ABRE EL DRAWER EN VISTA CERCANOS
// cuando el mapa activa el modo cercanos
// SOLO MOVIL
// ---------------------------------------------------

export function useAutoAbrirDrawerCercanos({ modoCercanos, setVistaDrawer, setMostrarPanelMovil }) {

  useEffect(() => {

    // Solo abrir drawer automaticamente en movil
    if (
      modoCercanos &&
      window.innerWidth <= 768
    ) {

      setVistaDrawer("cercanos")
      setMostrarPanelMovil(true)

    }

  }, [modoCercanos])

}
