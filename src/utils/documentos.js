import { deleteDoc, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { comprimirImagen } from './imagenes'
import { VERSION_AVISO } from './avisoPrivacidad'

export const TIPOS_DOCUMENTO = {
  fichaAdmision: 'Ficha de admisión',
  identificacion: 'Identificación oficial',
  comprobanteDomicilio: 'Comprobante de domicilio',
}

// Firestore admite documentos de hasta 1 MB. El archivo convertido a texto debe quedar por debajo de esto.
const PESO_MAXIMO = 900_000
// Un PDF crece un tercio al convertirlo a texto, así que el original debe pesar menos
const PESO_MAXIMO_PDF = 650_000

// Error con un mensaje listo para mostrar al usuario
export class ErrorDocumento extends Error {}

function leerComoDataUrl(archivo) {
  return new Promise((resolver, rechazar) => {
    const lector = new FileReader()
    lector.onload = () => resolver(lector.result)
    lector.onerror = () => rechazar(lector.error)
    lector.readAsDataURL(archivo)
  })
}

// Convierte el archivo elegido en un objeto listo para guardar: { contenido, nombre, tipoMime, tamano }
export async function prepararDocumento(archivo) {
  let contenido

  if (archivo.type === 'application/pdf') {
    if (archivo.size > PESO_MAXIMO_PDF) {
      throw new ErrorDocumento('El PDF pesa más de 650 KB. Sube una foto del documento o comprime el PDF.')
    }
    contenido = await leerComoDataUrl(archivo)
  } else if (archivo.type.startsWith('image/')) {
    contenido = await comprimirImagen(archivo, { ladoMaximo: 1600, calidad: 0.8 })
    // Si todavía pesa mucho, se reduce un poco más
    if (contenido.length > PESO_MAXIMO) {
      contenido = await comprimirImagen(archivo, { ladoMaximo: 1200, calidad: 0.7 })
    }
  } else {
    throw new ErrorDocumento('Sube una foto (JPG o PNG) o un PDF.')
  }

  if (contenido.length > PESO_MAXIMO) {
    throw new ErrorDocumento('El archivo es demasiado pesado. Intenta con una foto más pequeña.')
  }

  return {
    contenido,
    nombre: archivo.name,
    tipoMime: archivo.type === 'application/pdf' ? 'application/pdf' : 'image/jpeg',
    tamano: Math.round(contenido.length * 0.75),
  }
}

// Ruta: documentos/{uid}/archivos/{tipo}
export function guardarDocumento(uid, tipo, preparado) {
  return setDoc(doc(db, 'documentos', uid, 'archivos', tipo), {
    ...preparado,
    tipo,
    avisoVersion: VERSION_AVISO, // Versión del aviso vigente al subirlo
    subidoEn: serverTimestamp(),
  })
}

export async function leerDocumento(uid, tipo) {
  const instantanea = await getDoc(doc(db, 'documentos', uid, 'archivos', tipo))
  return instantanea.exists() ? instantanea.data() : null
}

export function eliminarDocumento(uid, tipo) {
  return deleteDoc(doc(db, 'documentos', uid, 'archivos', tipo))
}

// Abre el documento en otra pestaña (los PDF no se pueden abrir directamente desde su texto base64)
export async function abrirDocumento(contenido) {
  const archivo = await (await fetch(contenido)).blob()
  const url = URL.createObjectURL(archivo)
  window.open(url, '_blank', 'noopener')
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}