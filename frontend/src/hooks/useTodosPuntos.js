import { useState, useEffect } from 'react'
import { getTodosPuntos } from '../services/api.js'

// ---------------------------------------------------
// CARGA TODOS LOS PUNTOS DESDE BACKEND
// ---------------------------------------------------

export function useTodosPuntos() {

  const [todosPuntos, setTodosPuntos] = useState([])

  useEffect(() => {
    getTodosPuntos()
      .then(data => {
        const puntosArray = Array.isArray(data) ? data : []

        setTodosPuntos(
          puntosArray
            .filter(punto =>
              punto.activo === true &&
              (punto.rutas.length === 0 || punto.rutas.some(r => r.activo))
            )
            .map(punto => ({
              ...punto,
              rutas: punto.rutas.filter(r => r.activo)
            }))
        )
      })
      .catch(console.error)
  }, [])

  return todosPuntos
}
