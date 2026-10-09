import { createContext, useContext } from 'react'

// Contexto con la sesión actual. El proveedor está en SesionProvider.jsx.
export const SesionContext = createContext(null)

// Hook para leer la sesión desde cualquier componente:
// const { usuario, iniciarSesion, cerrarSesion } = useSesion()
export function useSesion() {
  const contexto = useContext(SesionContext)
  if (!contexto) throw new Error('useSesion debe usarse dentro de <SesionProvider>')
  return contexto
}