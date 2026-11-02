// Estilos y utilidades compartidos por las secciones del panel de administración

export const ENFOQUE =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-home-orange-500'
export const CLASE_BOTON_PRINCIPAL = `inline-flex items-center justify-center gap-2 rounded-full bg-home-orange-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-home-orange-800 ${ENFOQUE}`
export const CLASE_BOTON_SECUNDARIO = `inline-flex items-center justify-center gap-2 rounded-full border-2 border-home-orange-700 px-4 py-1.5 text-sm font-semibold text-home-orange-800 transition-colors hover:bg-home-orange-50 ${ENFOQUE}`
export const CLASE_BOTON_PELIGRO = `inline-flex items-center justify-center gap-2 rounded-full border-2 border-red-700 px-4 py-1.5 text-sm font-semibold text-red-800 transition-colors hover:bg-red-50 ${ENFOQUE}`
export const CLASE_BOTON_PELIGRO_RELLENO = `inline-flex items-center justify-center gap-2 rounded-full bg-red-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-800 ${ENFOQUE}`

export const ETIQUETA_ROL = {
  estudiante: '2nd GUEST',
  arrendador: '2nd HOST',
  admin: 'Administrador',
}

// "2026-09-29" a "29 de septiembre de 2026" (se arma por partes para evitar desfases de zona horaria)
export function formatoFecha(fecha) {
  const [anio, mes, dia] = fecha.split('-').map(Number)
  return new Date(anio, mes - 1, dia).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
}

// Fecha de Firestore (Timestamp) "2 de noviembre de 2026".
// Justo después de guardar, la fecha del servidor aún no llega: se muestra "Hace un momento".
export function formatoFechaFirestore(marcaDeTiempo) {
  if (!marcaDeTiempo) return 'Hace un momento'
  return marcaDeTiempo.toDate().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
}

// "2025-01" a "ene 2025"
export function formatoMesAnio(anioMes) {
  const [anio, mes] = anioMes.split('-').map(Number)
  return new Date(anio, mes - 1, 1).toLocaleDateString('es-MX', { month: 'short', year: 'numeric' })
}

// Quita acentos y mayúsculas para comparar textos en las búsquedas
export const normalizar = (texto) =>
  texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()