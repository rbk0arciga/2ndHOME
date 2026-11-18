import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from './config'

export function guardarResena({ propiedadId, usuario, calificacion, comentario }) {
  return setDoc(doc(db, 'resenas', `${propiedadId}_${usuario.id}`), {
    propiedadId,
    autorId: usuario.id,
    autorNombre: usuario.nombre,
    autorCarrera: usuario.carrera ?? '',
    avatar: usuario.avatar ?? null,
    calificacion,
    comentario,
    fecha: serverTimestamp(),
  })
}