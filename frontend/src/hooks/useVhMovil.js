import { useEffect } from 'react'

// ---------------------------------------------------
// FIX ALTURA REAL EN MOVIL
// 100vh en moviles incluye la barra del navegador
// Este efecto calcula el vh real y lo guarda en CSS
// ---------------------------------------------------

export function useVhMovil() {

  useEffect(() => {

    const actualizarVh = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
    }

    actualizarVh()
    window.addEventListener('resize', actualizarVh)

    return () => window.removeEventListener('resize', actualizarVh)

  }, [])

}
