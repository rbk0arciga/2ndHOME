import { useState } from 'react'

// Tamaños disponibles para el avatar
const TAMANOS = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-28 w-28 text-3xl',
}

// Toma las iniciales de las dos primeras palabras: "Silvia Martínez" → "SM"
function obtenerIniciales(nombre = '') {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra[0])
    .join('')
    .toUpperCase()
}

// Muestra la foto del usuario. Si no hay foto o no carga, muestra sus iniciales 
export default function Avatar({ src, nombre, tamano = 'md', alt = '', className = '' }) {
  const [fallo, setFallo] = useState(false)
  const clasesBase = `${TAMANOS[tamano]} shrink-0 rounded-full ${className}`

  if (!src || fallo) {
    return (
      <span
        aria-hidden={alt ? undefined : 'true'}
        className={`${clasesBase} inline-flex items-center justify-center bg-home-orange-200 font-semibold text-home-orange-900`}
      >
        {obtenerIniciales(nombre)}
      </span>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFallo(true)}
      className={`${clasesBase} bg-home-orange-200 object-cover`}
    />
  )
}