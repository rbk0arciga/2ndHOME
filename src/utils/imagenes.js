export async function comprimirImagen(archivo, { ladoMaximo = 1000, calidad = 0.7 } = {}) {
  const mapaDeBits = await createImageBitmap(archivo)
  const escala = Math.min(1, ladoMaximo / Math.max(mapaDeBits.width, mapaDeBits.height))
  const ancho = Math.round(mapaDeBits.width * escala)
  const alto = Math.round(mapaDeBits.height * escala)

  const lienzo = document.createElement('canvas')
  lienzo.width = ancho
  lienzo.height = alto
  lienzo.getContext('2d').drawImage(mapaDeBits, 0, 0, ancho, alto)
  mapaDeBits.close()

  return lienzo.toDataURL('image/jpeg', calidad)
}

// Tamaño aproximado en bytes de una imagen en base64
export function tamanoDataUrl(dataUrl) {
  const datos = dataUrl.slice(dataUrl.indexOf(',') + 1)
  return Math.round(datos.length * 0.75)
}