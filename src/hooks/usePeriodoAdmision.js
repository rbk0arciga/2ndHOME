import { useEffect, useState } from 'react'
import { escucharPeriodo, estadoVentana } from '../firebase/admision'

// Devuelve el periodo de admisión guardado y si la ventana está abierta, próxima o cerrada
export function usePeriodoAdmision() {
  const [periodo, setPeriodo] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    return escucharPeriodo(
      (nuevoPeriodo) => {
        setPeriodo(nuevoPeriodo)
        setCargando(false)
      },
      () => setCargando(false)
    )
  }, [])

  return { periodo, cargando, estado: estadoVentana(periodo) }
}