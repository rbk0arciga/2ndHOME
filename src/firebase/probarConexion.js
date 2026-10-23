import { addDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore'
import { db } from './config'

// TEMPORAL: escribe un documento de prueba y lee la colección para confirmar la conexión
export async function probarConexion() {
  try {
    await addDoc(collection(db, 'pruebas'), {
      mensaje: 'Hola desde 2nd HOME',
      fecha: serverTimestamp(),
    })
    const resultado = await getDocs(collection(db, 'pruebas'))
    console.log(`✅ Firebase conectado. Documentos en "pruebas": ${resultado.size}`)
  } catch (error) {
    console.error('❌ Error al conectar con Firebase:', error.code, error.message)
  }
}