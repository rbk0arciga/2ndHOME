import { useState } from 'react'
import { PropiedadesContext } from './propiedades'
import { propiedades as propiedadesIniciales } from '../data/mockData'

export default function PropiedadesProvider({ children }) {
  // MAQUETA: copia en memoria compartida por todas las páginas; se reinicia al recargar.
  // Con Firebase, estas funciones leerán y escribirán en Firestore.
  const [propiedades, setPropiedades] = useState(propiedadesIniciales)

  // El 2nd HOST activa o pausa un espacio
  const cambiarDisponibilidad = (id) => {
    setPropiedades((prev) => prev.map((p) => (p.id === id ? { ...p, disponible: !p.disponible } : p)))
  }

  // El 2nd HOST publica un espacio nuevo (llega como 'pending')
  const agregarPropiedad = (nueva) => {
    setPropiedades((prev) => [nueva, ...prev])
  }

    // El administrador aprueba o rechaza. Al rechazar, se guarda el motivo para el 2nd HOST.
  const cambiarEstado = (id, estado, motivoRechazo = '') => {
    setPropiedades((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, estado, motivoRechazo: estado === 'rejected' ? motivoRechazo : '' } : p
      )
    )
  }
  
  return (
    <PropiedadesContext.Provider value={{ propiedades, cambiarDisponibilidad, agregarPropiedad, cambiarEstado }}>
      {children}
    </PropiedadesContext.Provider>
  )
}