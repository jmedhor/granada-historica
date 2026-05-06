import { useEffect, useState } from "react"

function MenuPuntos({ ruta, setRutaSeleccionada, mapRef, evitarPago }) {
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

  if (mapRef.current?.ordenPuntos) {
    const orden = mapRef.current.ordenPuntos

    puntosOrdenados = orden
      .slice(1)
      .map(index => puntosFiltrados[index - 1])
      .filter(Boolean)
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
