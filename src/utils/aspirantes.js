// Utilidades para las cuentas de aspirantes de primer ingreso
export const DOMINIO_INSTITUCIONAL = '@alumnos.udg.mx'

export const esCorreoInstitucional = (correo = '') =>
  correo.trim().toLowerCase().endsWith(DOMINIO_INSTITUCIONAL)

// true si es aspirante y ya pasó la fecha de su vigencia (su cuenta queda suspendida)
export function aspiranteVencido(usuario) {
  if (!usuario?.aspirante || !usuario.vigenteHasta) return false
  return usuario.vigenteHasta.toMillis() < Date.now()
}

// Días que faltan para una fecha de Firestore (0 = hoy)
export function diasRestantes(marcaDeTiempo) {
  return Math.max(0, Math.ceil((marcaDeTiempo.toMillis() - Date.now()) / 86_400_000))
}