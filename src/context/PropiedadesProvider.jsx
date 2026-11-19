import { useEffect, useMemo, useState } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { PropiedadesContext } from './propiedades'
import { useSesion } from './sesion'
import { db } from '../firebase/config'

// Recalcula la calificación y el número de reseñas de cada propiedad con las reseñas reales
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

// Qué consultas puede hacer cada rol (deben coincidir con las reglas de Firestore)
function consultasPorRol(rol) {
  if (rol === 'admin') return ['todas']
  if (rol === 'arrendador') return ['aprobadas', 'propias']
  return ['aprobadas']
}

export default function PropiedadesProvider({ children }) {
  const { usuario } = useSesion()
  const idUsuario = usuario?.id
  const rol = usuario?.rol
  // Identifica la sesión actual para no mezclar datos de una sesión anterior
  const claveSesion = idUsuario && rol ? `${idUsuario}:${rol}` : ''

  // { clave: sesión a la que pertenecen, datos: { consulta: [...] }, cargadas: { consulta: true } }
  const [estado, setEstado] = useState({ clave: '', datos: {}, cargadas: {} })
  const [resenasReales, setResenasReales] = useState([])

  // Propiedades en tiempo real, con las consultas que permite cada rol
  useEffect(() => {
    if (!claveSesion) return
    const base = collection(db, 'propiedades')
    const consultas = {
      todas: base,
      aprobadas: query(base, where('estado', '==', 'approved')),
      propias: query(base, where('arrendador.id', '==', idUsuario)),
    }

    const actualizar = (nombre, lista) =>
      setEstado((prev) => {
        const mismaSesion = prev.clave === claveSesion
        return {
          clave: claveSesion,
          datos: { ...(mismaSesion ? prev.datos : {}), ...(lista ? { [nombre]: lista } : {}) },
          cargadas: { ...(mismaSesion ? prev.cargadas : {}), [nombre]: true },
        }
      })

    const cancelar = consultasPorRol(rol).map((nombre) =>
      onSnapshot(
        consultas[nombre],
        (resultado) => actualizar(nombre, resultado.docs.map((d) => ({ id: d.id, ...d.data() }))),
        (error) => {
          console.error(`No se pudieron leer las propiedades (${nombre}):`, error.code)
          actualizar(nombre, null)
        }
      )
    )
    return () => cancelar.forEach((dejarDeEscuchar) => dejarDeEscuchar())
  }, [claveSesion, idUsuario, rol])

  // Reseñas reales en tiempo real (las reglas exigen sesión para leerlas)
  useEffect(() => {
    if (!idUsuario) return
    return onSnapshot(
      collection(db, 'resenas'),
      (resultado) => setResenasReales(resultado.docs.map((documento) => documento.data())),
      (error) => console.error('No se pudieron leer las reseñas:', error.code)
    )
  }, [idUsuario])

  // Une las consultas (sin repetir) y aplica las reseñas
  const propiedades = useMemo(() => {
    if (!claveSesion || estado.clave !== claveSesion) return []
    const porId = new Map()
    Object.values(estado.datos)
      .flat()
      .forEach((propiedad) => porId.set(propiedad.id, propiedad))
    return aplicarResenas([...porId.values()], resenasReales)
  }, [estado, claveSesion, resenasReales])

  const cargando =
    Boolean(claveSesion) &&
    (estado.clave !== claveSesion || consultasPorRol(rol).some((nombre) => !estado.cargadas[nombre]))

  // El 2nd HOST activa o pausa un espacio
  const cambiarDisponibilidad = (id) => {
    const propiedad = propiedades.find((p) => p.id === id)
    if (!propiedad) return
    updateDoc(doc(db, 'propiedades', id), { disponible: !propiedad.disponible }).catch((error) =>
      console.error('No se pudo cambiar la disponibilidad:', error.code)
    )
  }

  // El 2nd HOST publica un espacio nuevo (llega como 'pending'). Devuelve la promesa para mostrar errores.
  const agregarPropiedad = (datos) => addDoc(collection(db, 'propiedades'), { ...datos, creadaEn: serverTimestamp() })

  // El administrador aprueba o rechaza. Al rechazar, se guarda el motivo para el 2nd HOST.
  const cambiarEstado = (id, nuevoEstado, motivoRechazo = '') => {
    updateDoc(doc(db, 'propiedades', id), {
      estado: nuevoEstado,
      motivoRechazo: nuevoEstado === 'rejected' ? motivoRechazo : '',
    }).catch((error) => console.error('No se pudo cambiar el estado:', error.code))
  }

  // El 2nd HOST (o el administrador) elimina una propiedad
  const eliminarPropiedad = (id) => deleteDoc(doc(db, 'propiedades', id))

  return (
    <PropiedadesContext.Provider
      value={{ propiedades, cargando, cambiarDisponibilidad, agregarPropiedad, cambiarEstado, eliminarPropiedad }}
    >
      {children}
    </PropiedadesContext.Provider>
  )
}