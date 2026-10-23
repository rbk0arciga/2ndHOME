import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const faltantes = Object.entries(firebaseConfig)
  .filter(([, valor]) => !valor)
  .map(([clave]) => clave)
if (faltantes.length > 0) {
  console.error(`Faltan variables de Firebase en .env.local: ${faltantes.join(', ')}`)
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app) // Inicio de sesión y registro
export const db = getFirestore(app) // Base de datos (incluidas las fotos comprimidas)
