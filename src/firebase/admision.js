import { doc, onSnapshot, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore'
import { db } from './config'

// La ventana para registrarse como aspirante: una semana antes y una después del dictamen
export const DIAS_ANTES = 7
export const DIAS_DESPUES = 7

const refPeriodo = doc(db, 'configuracion', 'admision')

// "2026-12-15" → fecha local a las 00:00 (se arma por partes para evitar desfases de zona horaria)
function fechaLocal(texto) {
  const [anio, mes, dia] = texto.split('-').map(Number)
  return new Date(anio, mes - 1, dia)
}

// Calcula el inicio (00:00 del primer día) y el fin (23:59 del último día) de la ventana
export function calcularVentana(fechaDictamen) {
  const dictamen = fechaLocal(fechaDictamen)
  const inicio = new Date(dictamen)
  inicio.setDate(inicio.getDate() - DIAS_ANTES)
  const fin = new Date(dictamen)
  fin.setDate(fin.getDate() + DIAS_DESPUES)
  fin.setHours(23, 59, 59, 999)
  return { inicio, fin }
}

// 'sin-configurar' | 'proxima' | 'abierta' | 'cerrada'
export function estadoVentana(periodo) {
  if (!periodo) return 'sin-configurar'
  const ahora = new Date()
  if (ahora < periodo.inicio) return 'proxima'
  if (ahora > periodo.fin) return 'cerrada'
  return 'abierta'
}

// Escucha en tiempo real el periodo guardado. Devuelve la función para dejar de escuchar.
export function escucharPeriodo(alCambiar, alError) {
  return onSnapshot(
    refPeriodo,
    (instantanea) => {
      if (!instantanea.exists()) {
        alCambiar(null)
        return
      }
      const datos = instantanea.data()
      alCambiar({
        fechaDictamen: datos.fechaDictamen,
        inicio: datos.inicio.toDate(),
        fin: datos.fin.toDate(),
      })
    },
    alError
  )
}

// Solo el administrador puede guardarlo (lo exigen las reglas de Firestore)
export function guardarPeriodo(fechaDictamen) {
  const { inicio, fin } = calcularVentana(fechaDictamen)
  return setDoc(refPeriodo, {
    fechaDictamen,
    inicio: Timestamp.fromDate(inicio),
    fin: Timestamp.fromDate(fin),
    actualizadoEn: serverTimestamp(),
  })
}

// "lunes, 7 de diciembre de 2026"
export const formatoFechaLarga = (fecha) =>
  fecha.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })