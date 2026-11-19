import {
  addDoc,
  collection,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from './config'

// Una conversación por 2nd GUEST y propiedad
export const idConversacion = (propiedadId, estudianteId) => `${propiedadId}_${estudianteId}`

// Fecha de Firestore → texto ISO (lo recién enviado usa la hora local mientras llega la del servidor)
const aIso = (marca) => (marca?.toDate ? marca.toDate() : new Date()).toISOString()

// Conversaciones donde participa la persona, de la más reciente a la más antigua
export function escucharConversaciones(uid, alCambiar, alError) {
  return onSnapshot(
    query(collection(db, 'conversaciones'), where('participantes', 'array-contains', uid)),
    (resultado) =>
      alCambiar(
        resultado.docs
          .map((d) => {
            const datos = d.data({ serverTimestamps: 'estimate' })
            return { id: d.id, ...datos, actualizadoEn: aIso(datos.actualizadoEn) }
          })
          .sort((a, b) => b.actualizadoEn.localeCompare(a.actualizadoEn))
      ),
    (error) => {
      console.error('No se pudieron leer las conversaciones:', error.code)
      alError?.(error)
    }
  )
}

// Mensajes de una conversación, del más antiguo al más reciente
export function escucharMensajes(conversacionId, alCambiar) {
  return onSnapshot(
    query(collection(db, 'conversaciones', conversacionId, 'mensajes'), orderBy('fecha', 'asc')),
    (resultado) =>
      alCambiar(
        resultado.docs.map((d) => {
          const datos = d.data({ serverTimestamps: 'estimate' })
          return { id: d.id, ...datos, fecha: aIso(datos.fecha) }
        })
      ),
    (error) => console.error('No se pudieron leer los mensajes:', error.code)
  )
}

// Envía un mensaje. Si la conversación es nueva (solo la inicia el 2nd GUEST), primero la crea.
export async function enviarMensaje({ conversacion, autorId, texto, esNueva }) {
  const otroId = conversacion.participantes.find((id) => id !== autorId)
  const ultimoMensaje = { texto, autorId }
  const refConversacion = doc(db, 'conversaciones', conversacion.id)

  if (esNueva) {
    const { propiedadId, propiedadTitulo, estudiante, arrendador, participantes } = conversacion
    await setDoc(refConversacion, {
      propiedadId,
      propiedadTitulo,
      estudiante,
      arrendador,
      participantes,
      ultimoMensaje,
      actualizadoEn: serverTimestamp(),
      noLeidos: { [otroId]: 1, [autorId]: 0 },
    })
  }

  await addDoc(collection(refConversacion, 'mensajes'), { autorId, texto, fecha: serverTimestamp() })

  if (!esNueva) {
    await updateDoc(refConversacion, {
      ultimoMensaje,
      actualizadoEn: serverTimestamp(),
      [`noLeidos.${otroId}`]: increment(1),
    })
  }
}

export function marcarLeida(conversacionId, uid) {
  return updateDoc(doc(db, 'conversaciones', conversacionId), { [`noLeidos.${uid}`]: 0 })
}