import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../firebase/config'

// Fecha de Firestore → "2026-11-17" (mismo formato que las reseñas de prueba)
function aTextoFecha(marcaDeTiempo) {
  const fecha = marcaDeTiempo?.toDate ? marcaDeTiempo.toDate() : new Date()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${fecha.getFullYear()}-${mes}-${dia}`
}

function convertir(documento) {
  const datos = documento.data({ serverTimestamps: 'estimate' })
  return { id: documento.id, ...datos, fecha: aTextoFecha(datos.fecha) }
}

const masRecientesPrimero = (lista) => [...lista].sort((a, b) => b.fecha.localeCompare(a.fecha))

// Reseñas de una o varias propiedades: las de prueba más las reales de Firestore, en tiempo real
export function useResenasDePropiedades(ids) {
  const clave = [...ids].sort().join(',')
  const [reales, setReales] = useState([])

  useEffect(() => {
    if (!clave) return
    // Firestore admite hasta 30 valores en una consulta "in"
    const lista = clave.split(',').slice(0, 30)
    return onSnapshot(
      query(collection(db, 'resenas'), where('propiedadId', 'in', lista)),
      (resultado) => setReales(resultado.docs.map(convertir)),
      (error) => console.error('No se pudieron leer las reseñas:', error.code)
    )
  }, [clave])

  return useMemo(() => {
    const permitidas = new Set(clave ? clave.split(',') : [])
    return masRecientesPrimero(reales.filter((r) => permitidas.has(r.propiedadId)))
}, [clave, reales])
}

// Reseñas escritas por una persona
export function useResenasDeAutor(uid) {
  const [reales, setReales] = useState([])

  useEffect(() => {
    if (!uid) return
    return onSnapshot(
      query(collection(db, 'resenas'), where('autorId', '==', uid)),
      (resultado) => setReales(resultado.docs.map(convertir)),
      (error) => console.error('No se pudieron leer las reseñas:', error.code)
    )
  }, [uid])

  return reales
}