import { useId, useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { LuImagePlus, LuLoader, LuX } from 'react-icons/lu'
import Avatar from '../Avatar'
import { db } from '../../firebase/config'
import { comprimirImagen, tamanoDataUrl } from '../../utils/imagenes'
import { CATEGORIAS_COMUNIDAD } from '../../data/mockData'
import { ENFOQUE, CLASE_CHIP } from './utilidades'

const MAXIMO_CARACTERES = 1000
const MAXIMO_FOTOS = 4
// Firestore admite documentos de hasta 1 MB; dejamos margen para el texto y los demás datos
const PESO_MAXIMO_FOTOS = 850_000

export default function FormularioPublicacion({ usuario }) {
  const [texto, setTexto] = useState('')
  const [categoria, setCategoria] = useState('')
  const [fotos, setFotos] = useState([]) // Imágenes ya comprimidas (base64)
  const [error, setError] = useState('')
  const [procesando, setProcesando] = useState(false)
  const [publicando, setPublicando] = useState(false)
  const idTexto = useId()
  const nombreGrupo = useId()

  const agregarFotos = async (e) => {
    const archivos = Array.from(e.target.files ?? [])
      .filter((archivo) => archivo.type.startsWith('image/'))
      .slice(0, MAXIMO_FOTOS - fotos.length)
    e.target.value = '' // Permite volver a elegir el mismo archivo
    if (archivos.length === 0) return

    setProcesando(true)
    setError('')
    try {
      const comprimidas = await Promise.all(archivos.map((archivo) => comprimirImagen(archivo)))
      setFotos((prev) => [...prev, ...comprimidas])
    } catch {
      setError('No pudimos procesar una de las fotos. Usa imágenes JPG o PNG.')
    } finally {
      setProcesando(false)
    }
  }

  const quitarFoto = (indice) => setFotos((prev) => prev.filter((_, i) => i !== indice))

  const publicar = async (e) => {
    e.preventDefault()
    const limpio = texto.trim()
    if (!limpio) {
      setError('Escribe algo para publicar.')
      return
    }
    if (!categoria) {
      setError('Elige una categoría.')
      return
    }
    const pesoFotos = fotos.reduce((total, foto) => total + tamanoDataUrl(foto), 0)
    if (pesoFotos > PESO_MAXIMO_FOTOS) {
      setError('Las fotos pesan demasiado juntas. Quita alguna e inténtalo de nuevo.')
      return
    }

    setPublicando(true)
    setError('')
    try {
      await addDoc(collection(db, 'publicaciones'), {
        autor: {
          id: usuario.id,
          nombre: usuario.nombre,
          carrera: usuario.carrera ?? '',
          avatar: usuario.avatar ?? null,
        },
        categoria,
        texto: limpio,
        imagenes: fotos,
        meGusta: [],
        fecha: serverTimestamp(),
      })
      setTexto('')
      setCategoria('')
      setFotos([])
    } catch {
      setError('No pudimos publicar. Revisa tu conexión e inténtalo de nuevo.')
    } finally {
      setPublicando(false)
    }
  }

  return (
    <form onSubmit={publicar} noValidate className="rounded-3xl border border-home-orange-200 bg-white p-5">
      <div className="flex gap-3">
        <Avatar src={usuario.avatar} nombre={usuario.nombre} />
        <div className="min-w-0 flex-1">
          <label htmlFor={idTexto} className="sr-only">
            ¿Qué quieres compartir con la comunidad?
          </label>
          <textarea
            id={idTexto}
            rows={3}
            maxLength={MAXIMO_CARACTERES}
            value={texto}
            onChange={(e) => {
              setTexto(e.target.value)
              if (error) setError('')
            }}
            placeholder="¿Qué quieres compartir con la comunidad?"
            className="w-full resize-y rounded-2xl border-2 border-home-orange-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:border-home-orange-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Categoría */}
      <fieldset className="mt-3">
        <legend className="text-sm font-semibold text-gray-900">Categoría</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {Object.entries(CATEGORIAS_COMUNIDAD).map(([clave, etiqueta]) => (
            <label key={clave} className="cursor-pointer">
              <input
                type="radio"
                name={nombreGrupo}
                checked={categoria === clave}
                onChange={() => {
                  setCategoria(clave)
                  if (error) setError('')
                }}
                className="peer sr-only"
              />
              <span className={CLASE_CHIP}>{etiqueta}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Vista previa de las fotos */}
      {fotos.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {fotos.map((foto, indice) => (
            <li key={indice} className="relative h-20 w-20 overflow-hidden rounded-xl bg-home-orange-100">
              <img src={foto} alt={`Foto ${indice + 1} para publicar`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => quitarFoto(indice)}
                aria-label={`Quitar foto ${indice + 1}`}
                className={`absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-white/90 text-gray-800 hover:bg-white ${ENFOQUE}`}
              >
                <LuX className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <label
          className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-home-orange-800 transition-colors hover:bg-home-orange-50 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-home-orange-500 ${
            fotos.length >= MAXIMO_FOTOS ? 'pointer-events-none opacity-50' : ''
          }`}
        >
          {procesando ? (
            <LuLoader className="h-5 w-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
          ) : (
            <LuImagePlus className="h-5 w-5" aria-hidden="true" />
          )}
          {procesando ? 'Procesando fotos…' : `Fotos (${fotos.length}/${MAXIMO_FOTOS})`}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={agregarFotos}
            disabled={fotos.length >= MAXIMO_FOTOS || procesando}
            className="sr-only"
          />
        </label>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600">
            {texto.length}/{MAXIMO_CARACTERES}
          </span>
          <button
            type="submit"
            disabled={publicando || procesando}
            className={`inline-flex items-center gap-2 rounded-full bg-home-orange-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-home-orange-800 disabled:cursor-wait disabled:opacity-80 ${ENFOQUE}`}
          >
            {publicando && <LuLoader className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
            {publicando ? 'Publicando…' : 'Publicar'}
          </button>
        </div>
      </div>
    </form>
  )
}