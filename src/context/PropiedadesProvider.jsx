import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { PropiedadesContext } from './propiedades'
import { useSesion } from './sesion'
import { db } from '../firebase/config'
import { propiedades as propiedadesIniciales } from '../data/mockData'

// Agrega a cada propiedad las reseñas reales de Firestore: recalcula el promedio y el total.
// Los datos de prueba ya traen una calificación y un número de reseñas; las reales se suman a esos.
function aplicarResenas(propiedades, resenas) {
  const porPropiedad = {}
  resenas.forEach((resena) => {
    if (!porPropiedad[resena.propiedadId]) porPropiedad[resena.propiedadId] = []
    porPropiedad[resena.propiedadId].push(resena.calificacion)
  })

  return propiedades.map((propiedad) => {
    const nuevas = porPropiedad[propiedad.id]
    if (!nuevas) return propiedad

    const totalPrevio = propiedad.calificacion ? propiedad.numResenas : 0
    const sumaPrevia = (propiedad.calificacion ?? 0) * totalPrevio
    const total = totalPrevio + nuevas.length
    const suma = sumaPrevia + nuevas.reduce((acumulado, valor) => acumulado + valor, 0)

    return { ...propiedad, calificacion: suma / total, numResenas: total }
  })
}

export default function PropiedadesProvider({ children }) {
  const { usuario } = useSesion()
  const idUsuario = usuario?.id

  // MAQUETA: copia en memoria compartida por todas las páginas; se reinicia al recargar.
  const [propiedades, setPropiedades] = useState(propiedadesIniciales)
  const [resenasReales, setResenasReales] = useState([])

  // Reseñas reales en tiempo real (las reglas exigen sesión para leerlas)
  useEffect(() => {
    if (!idUsuario) return
    return onSnapshot(
      collection(db, 'resenas'),
      (resultado) => setResenasReales(resultado.docs.map((documento) => documento.data())),
      (error) => console.error('No se pudieron leer las reseñas:', error.code)
    )
  }, [idUsuario])

  // Sin sesión no se usan reseñas (evita mostrar las de una sesión anterior)
  const resenasVigentes = idUsuario ? resenasReales : []

  // Propiedades con la calificación y el número de reseñas actualizados
  const propiedadesConResenas = useMemo(
    () => aplicarResenas(propiedades, resenasVigentes),
    [propiedades, resenasVigentes]
  )

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
    <PropiedadesContext.Provider
      value={{ propiedades: propiedadesConResenas, cambiarDisponibilidad, agregarPropiedad, cambiarEstado }}
    >
      {children}
    </PropiedadesContext.Provider>
  )
}