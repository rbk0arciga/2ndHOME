import { useEffect, useId, useRef, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { LuSend, LuReply, LuTrash2 } from 'react-icons/lu'
import Avatar from '../Avatar'
import { db } from '../../firebase/config'
import { ENFOQUE, fechaRelativa } from './utilidades'

const MAXIMO_CARACTERES = 500

export default function Comentarios({ publicacionId, usuario }) {
  const [comentarios, setComentarios] = useState([])
  const [texto, setTexto] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const campoRef = useRef(null)
  const idCampo = useId()

  const esEstudiante = usuario.rol === 'estudiante'
  const esAdmin = usuario.rol === 'admin'

  // Comentarios de esta publicación en tiempo real, del más antiguo al más reciente
  useEffect(() => {
    const consulta = query(collection(db, 'publicaciones', publicacionId, 'comentarios'), orderBy('fecha', 'asc'))
    return onSnapshot(
      consulta,
      (resultado) =>
        setComentarios(
          // 'estimate': los recién enviados muestran la hora local mientras llega la del servidor
          resultado.docs.map((d) => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) }))
        ),
      () => setComentarios([])
    )
  }, [publicacionId])

  const enviar = async () => {
    const limpio = texto.trim()
    if (!limpio || enviando) return
    setEnviando(true)
    setError('')
    try {
      await addDoc(collection(db, 'publicaciones', publicacionId, 'comentarios'), {
        autor: {
          id: usuario.id,
          nombre: usuario.nombre,
          carrera: usuario.carrera ?? '',
          avatar: usuario.avatar ?? null,
        },
        texto: limpio,
        fecha: serverTimestamp(),
      })
      setTexto('')
    } catch {
      setError('No pudimos enviar tu comentario. Inténtalo de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  // "Responder" menciona a la persona y lleva el cursor al campo
  const responder = (nombre) => {
    setTexto(`@${nombre.split(' ')[0]} `)
    campoRef.current?.focus()
  }

  const eliminar = async (comentarioId) => {
    try {
      await deleteDoc(doc(db, 'publicaciones', publicacionId, 'comentarios', comentarioId))
    } catch {
      setError('No pudimos eliminar el comentario.')
    }
  }

  const claseAccion = `inline-flex items-center gap-1 rounded text-xs font-semibold transition-colors ${ENFOQUE}`

  return (
    <div className="flex h-full flex-col">
      <h3 className="text-sm font-semibold text-gray-900">
        {comentarios.length === 0
          ? 'Comentarios'
          : `${comentarios.length} ${comentarios.length === 1 ? 'comentario' : 'comentarios'}`}
      </h3>

      {comentarios.length > 0 ? (
        <ul className="mt-3 max-h-96 flex-1 space-y-4 overflow-y-auto pr-1">
          {comentarios.map((comentario) => (
            <li key={comentario.id} className="flex gap-3">
              <Avatar src={comentario.autor.avatar} nombre={comentario.autor.nombre} tamano="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <span className="font-semibold text-gray-900">{comentario.autor.nombre}</span>{' '}
                  <span className="text-xs text-gray-600">· {fechaRelativa(comentario.fecha)}</span>
                </p>
                {comentario.autor.carrera && <p className="text-xs text-gray-600">{comentario.autor.carrera}</p>}
                <p className="mt-1 whitespace-pre-wrap text-sm text-gray-800 wrap-anywhere">{comentario.texto}</p>

                <div className="mt-1 flex gap-3">
                  {esEstudiante && (
                    <button
                      type="button"
                      onClick={() => responder(comentario.autor.nombre)}
                      className={`${claseAccion} text-home-orange-800 hover:underline`}
                    >
                      <LuReply className="h-3.5 w-3.5" aria-hidden="true" />
                      Responder
                    </button>
                  )}
                  {(esAdmin || comentario.autor.id === usuario.id) && (
                    <button
                      type="button"
                      onClick={() => eliminar(comentario.id)}
                      className={`${claseAccion} text-gray-600 hover:text-red-700`}
                    >
                      <LuTrash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 flex-1 text-sm text-gray-600">
          {esEstudiante ? 'Sé la primera persona en comentar.' : 'Aún no hay comentarios.'}
        </p>
      )}

      {/* Campo para comentar (solo 2nd GUESTS) */}
      {esEstudiante && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            enviar()
          }}
          className="mt-4 flex items-end gap-2"
        >
          <label htmlFor={idCampo} className="sr-only">
            Escribe un comentario
          </label>
          <textarea
            id={idCampo}
            ref={campoRef}
            rows={1}
            maxLength={MAXIMO_CARACTERES}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => {
              // Enter envía; Shift + Enter hace un salto de línea
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                enviar()
              }
            }}
            placeholder="Deja tu comentario…"
            className="max-h-28 min-h-10 flex-1 resize-none rounded-2xl border-2 border-home-orange-200 bg-white px-4 py-2 text-sm text-gray-900 field-sizing-content placeholder:text-gray-500 focus:border-home-orange-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!texto.trim() || enviando}
            aria-label="Enviar comentario"
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-full bg-home-orange-700 text-white transition-colors hover:bg-home-orange-800 disabled:cursor-not-allowed disabled:bg-home-orange-200 disabled:text-home-orange-700 ${ENFOQUE}`}
          >
            <LuSend className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>
      )}

      {error && <p className="mt-2 text-sm font-medium text-red-700">{error}</p>}
    </div>
  )
}