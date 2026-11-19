import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config'

// Perfil público de un 2nd HOST (colección "anfitriones"), en tiempo real
export function usePerfilAnfitrion(id) {
  const [estado, setEstado] = useState({ id: null, perfil: null, cargado: false })

  useEffect(() => {
    if (!id) return
    return onSnapshot(
      doc(db, 'anfitriones', id),
      (instantanea) => setEstado({ id, perfil: instantanea.exists() ? instantanea.data() : null, cargado: true }),
      () => setEstado({ id, perfil: null, cargado: true })
    )
  }, [id])

  // Solo se usan los datos si corresponden al id pedido
  const vigente = estado.id === id
  return {
    perfilPublico: vigente ? estado.perfil : null,
    cargando: Boolean(id) && !(vigente && estado.cargado),
  }
}