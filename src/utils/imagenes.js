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

// Recorta la imagen al centro en un cuadrado y la reduce (para fotos de perfil)
export async function recortarCuadrado(archivo, { lado = 256, calidad = 0.75 } = {}) {
  const mapaDeBits = await createImageBitmap(archivo)
  const corte = Math.min(mapaDeBits.width, mapaDeBits.height)
  const x = (mapaDeBits.width - corte) / 2
  const y = (mapaDeBits.height - corte) / 2
  const final = Math.min(lado, corte)

  const lienzo = document.createElement('canvas')
  lienzo.width = final
  lienzo.height = final
  lienzo.getContext('2d').drawImage(mapaDeBits, x, y, corte, corte, 0, 0, final, final)
  mapaDeBits.close()

  return lienzo.toDataURL('image/jpeg', calidad)
}