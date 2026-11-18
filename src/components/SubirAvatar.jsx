import { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { LuCamera, LuLoader, LuTrash2 } from 'react-icons/lu'
import Avatar from './Avatar'
import { db } from '../firebase/config'
import { recortarCuadrado } from '../utils/imagenes'

const ENFOQUE =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-home-orange-500'

// Foto de perfil: se recorta, se reduce y se guarda en el perfil de Firestore en cuanto se elige
export default function SubirAvatar({ usuario }) {
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState('')

  const guardar = (avatar) => updateDoc(doc(db, 'usuarios', usuario.id), { avatar })

  const alElegir = async (e) => {
    const archivo = e.target.files?.[0]
    e.target.value = '' // Permite volver a elegir el mismo archivo
    if (!archivo) return
    if (!archivo.type.startsWith('image/')) {
      setError('Elige una imagen JPG o PNG.')
      return
    }

    setProcesando(true)
    setError('')
    try {
      await guardar(await recortarCuadrado(archivo))
    } catch {
      setError('No pudimos guardar la foto. Intenta con otra imagen.')
    } finally {
      setProcesando(false)
    }
  }

  const quitar = async () => {
    setProcesando(true)
    setError('')
    try {
      await guardar(null)
    } catch {
      setError('No pudimos quitar la foto. Inténtalo de nuevo.')
    } finally {
      setProcesando(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar src={usuario.avatar} nombre={usuario.nombre} tamano="xl" />
      <div>
        <p className="text-sm font-semibold text-gray-900">Foto de perfil</p>
        <p className="text-xs text-gray-600">Opcional. Se guarda en cuanto la eliges.</p>

        <div className="mt-2 flex flex-wrap gap-2">
          <label
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border-2 border-home-orange-700 px-4 py-1.5 text-sm font-semibold text-home-orange-800 transition-colors hover:bg-home-orange-50 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-home-orange-500 ${
              procesando ? 'pointer-events-none opacity-60' : ''
            }`}
          >
            {procesando ? (
              <LuLoader className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
            ) : (
              <LuCamera className="h-4 w-4" aria-hidden="true" />
            )}
            {usuario.avatar ? 'Cambiar foto' : 'Subir foto'}
            <input type="file" accept="image/*" onChange={alElegir} disabled={procesando} className="sr-only" />
          </label>

          {usuario.avatar && (
            <button
              type="button"
              onClick={quitar}
              disabled={procesando}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-home-orange-50 disabled:opacity-60 ${ENFOQUE}`}
            >
              <LuTrash2 className="h-4 w-4" aria-hidden="true" />
              Quitar
            </button>
          )}
        </div>

        {error && (
          <p role="alert" className="mt-1.5 text-sm font-medium text-red-700">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}