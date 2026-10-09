import { useState } from 'react'
import { SesionContext } from './sesion'
import { usuarios, CONTRASENA_DEMO } from '../data/mockData'

// Clave con la que se guarda la sesión en el navegador, para no perderla al recargar
const CLAVE_SESION = '2ndhome-sesion'

function leerSesionGuardada() {
  try {
    const id = localStorage.getItem(CLAVE_SESION)
    return usuarios.find((u) => u.id === id) ?? null
  } catch {
    return null
  }
}

export default function SesionProvider({ children }) {
  const [usuario, setUsuario] = useState(leerSesionGuardada)

  // MAQUETA: con Firebase serán signInWithEmailAndPassword y onAuthStateChanged.
  // Devuelve el usuario si los datos son correctos, o null si no.
  const iniciarSesion = (correo, contrasena) => {
    const encontrado = usuarios.find((u) => u.correo.toLowerCase() === correo.trim().toLowerCase())
    if (!encontrado || contrasena !== CONTRASENA_DEMO) return null
    try {
      localStorage.setItem(CLAVE_SESION, encontrado.id)
    } catch {
      // Sin almacenamiento disponible: la sesión dura hasta recargar la página
    }
    setUsuario(encontrado)
    return encontrado
  }

  const cerrarSesion = () => {
    try {
      localStorage.removeItem(CLAVE_SESION)
    } catch {
      // Nada que limpiar
    }
    setUsuario(null)
  }

  return (
    <SesionContext.Provider value={{ usuario, iniciarSesion, cerrarSesion }}>
      {children}
    </SesionContext.Provider>
  )
}