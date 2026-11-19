import { CUCEI } from '../data/mockData'

const RADIO_TIERRA_KM = 6371
// La distancia en línea recta se aumenta un 30 % para aproximar el recorrido por calles
const FACTOR_CALLES = 1.3

// Distancia en línea recta entre dos puntos { lat, lng }, en kilómetros (fórmula de Haversine)
function distanciaLineaRecta(a, b) {
  const aRadianes = (grados) => (grados * Math.PI) / 180
  const dLat = aRadianes(b.lat - a.lat)
  const dLng = aRadianes(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(aRadianes(a.lat)) * Math.cos(aRadianes(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * RADIO_TIERRA_KM * Math.asin(Math.sqrt(h))
}

// Kilómetros aproximados a CUCEI, con un decimal
export function distanciaACucei(coordenadas) {
  return Math.round(distanciaLineaRecta(coordenadas, CUCEI) * FACTOR_CALLES * 10) / 10
}

// Lee coordenadas de un texto: "20.6566, -103.3255" o un enlace de Google Maps con "@20.6566,-103.3255"
export function leerCoordenadas(texto = '') {
  const coincidencia = texto.match(/(-?\d{1,3}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)/)
  if (!coincidencia) return null
  const lat = Number(coincidencia[1])
  const lng = Number(coincidencia[2])
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null
  return { lat, lng }
}