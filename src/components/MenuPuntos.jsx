import { useEffect, useState } from "react"

function MenuPuntos({ ruta, setRutaSeleccionada, mapRef, evitarPago, ordenPuntos }) {
  const [puntos, setPuntos] = useState([])

  useEffect(() => {
    fetch(`http://localhost:8000/rutas/${ruta.id}/puntos`)
      .then(res => res.json())
      .then(data => setPuntos(data))
      .catch(err => console.error(err))
  }, [ruta])


  const puntosFiltrados = evitarPago
    ? puntos.filter(p => !p.pago)
    : puntos


  let puntosOrdenados = [...puntosFiltrados]

  if (ordenPuntos.length > 0) {
    puntosOrdenados = ordenPuntos
  }

  return (
    <div className="menu-puntos">
      <h3>{ruta.nombre}</h3>
        <ul>
          {puntosOrdenados.map((punto, index) => (
            <li
              key={punto.id}
              onClick={() => mapRef.current.centrarYAbrir(punto)}
            >
              <span className="paso-num">{index + 1}</span>
              {punto.nombre}
            </li>
          ))}
        </ul>
    </div>
  )
}

export default MenuPuntos
