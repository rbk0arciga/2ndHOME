import { createContext, useContext } from 'react'

export const PropiedadesContext = createContext(null)

export function usePropiedades() {
  const contexto = useContext(PropiedadesContext)
  if (!contexto) throw new Error('usePropiedades debe usarse dentro de <PropiedadesProvider>')
  return contexto
}