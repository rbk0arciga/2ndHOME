export const ENFOQUE =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-home-orange-500'

export const CLASE_CHIP =
  'block rounded-full border border-home-orange-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 transition-colors hover:border-home-orange-400 peer-checked:border-home-orange-700 peer-checked:bg-home-orange-700 peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-home-orange-500'

const formatoRelativo = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })

// Fecha de Firestore → "hace 5 minutos", "hace 2 horas", "ayer" o "28 de septiembre"
export function fechaRelativa(marcaDeTiempo) {
  if (!marcaDeTiempo) return 'hace un momento'
  const fecha = marcaDeTiempo.toDate()
  const segundos = Math.round((fecha.getTime() - Date.now()) / 1000)
  const transcurrido = Math.abs(segundos)

  if (transcurrido < 60) return 'hace un momento'
  if (transcurrido < 3600) return formatoRelativo.format(Math.round(segundos / 60), 'minute')
  if (transcurrido < 86400) return formatoRelativo.format(Math.round(segundos / 3600), 'hour')
  if (transcurrido < 7 * 86400) return formatoRelativo.format(Math.round(segundos / 86400), 'day')
  return fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })
}