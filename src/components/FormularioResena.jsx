import { useId, useState } from 'react'
import { FaStar } from 'react-icons/fa'
import { LuLoader } from 'react-icons/lu'

const ENFOQUE =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-home-orange-500'
const LARGO_MINIMO = 20
const LARGO_MAXIMO = 1000

function SelectorEstrellas({ valor, onCambiar, error }) {
  const nombreGrupo = useId()

  return (
    <fieldset>
      <legend className="text-sm font-semibold text-gray-900">Calificación</legend>
      <div className="mt-1.5 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <label
            key={n}
            className="cursor-pointer rounded-md p-0.5 has-focus-visible:outline-2 has-focus-visible:outline-home-orange-500"
          >
            <input
              type="radio"
              name={nombreGrupo}
              value={n}
              checked={valor === n}
              onChange={() => onCambiar(n)}
              className="sr-only"
            />
            <FaStar
              className={`h-7 w-7 transition-colors ${n <= valor ? 'text-home-orange-400' : 'text-home-orange-100'}`}
              aria-hidden="true"
            />
            <span className="sr-only">
              {n} {n === 1 ? 'estrella' : 'estrellas'}
            </span>
          </label>
        ))}
      </div>
      {error && <p className="mt-1.5 text-sm font-medium text-red-700">{error}</p>}
    </fieldset>
  )
}

// onPublicar recibe { calificacion, comentario } y devuelve una promesa
export default function FormularioResena({ onPublicar, onCancelar }) {
  const [calificacion, setCalificacion] = useState(0)
  const [comentario, setComentario] = useState('')
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [enviando, setEnviando] = useState(false)
  const idComentario = useId()

  const alPublicar = async (e) => {
    e.preventDefault()
    const nuevosErrores = {}
    if (!calificacion) nuevosErrores.calificacion = 'Elige de 1 a 5 estrellas.'
    if (comentario.trim().length < LARGO_MINIMO) {
      nuevosErrores.comentario = `Cuéntanos un poco más (al menos ${LARGO_MINIMO} caracteres).`
    }
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    setEnviando(true)
    setErrorGeneral('')
    try {
      await onPublicar({ calificacion, comentario: comentario.trim() })
    } catch {
      setErrorGeneral('No pudimos publicar tu reseña. Revisa tu conexión e inténtalo de nuevo.')
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={alPublicar} noValidate className="space-y-4 rounded-2xl bg-home-orange-50 p-4">
      <SelectorEstrellas
        valor={calificacion}
        onCambiar={(n) => {
          setCalificacion(n)
          setErrores((prev) => ({ ...prev, calificacion: undefined }))
        }}
        error={errores.calificacion}
      />

      <div>
        <label htmlFor={idComentario} className="text-sm font-semibold text-gray-900">
          Tu reseña
        </label>
        <textarea
          id={idComentario}
          rows={4}
          maxLength={LARGO_MAXIMO}
          value={comentario}
          onChange={(e) => {
            setComentario(e.target.value)
            if (errores.comentario) setErrores((prev) => ({ ...prev, comentario: undefined }))
          }}
          placeholder="Cuéntanos tu experiencia: si viviste ahí, o lo visitaste, cómo es el lugar y el trato del 2nd HOST."
          aria-invalid={errores.comentario ? 'true' : undefined}
          className={`mt-1.5 w-full resize-y rounded-xl border-2 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none ${
            errores.comentario
              ? 'border-red-600 focus:border-red-700'
              : 'border-home-orange-200 focus:border-home-orange-500'
          }`}
        />
        {errores.comentario && <p className="mt-1.5 text-sm font-medium text-red-700">{errores.comentario}</p>}
      </div>

      {errorGeneral && (
        <p role="alert" className="text-sm font-medium text-red-700">
          {errorGeneral}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={enviando}
          className={`inline-flex items-center gap-2 rounded-full bg-home-orange-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-home-orange-800 disabled:cursor-wait disabled:opacity-80 ${ENFOQUE}`}
        >
          {enviando && <LuLoader className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
          Publicar reseña
        </button>
        {onCancelar && (
          <button
            type="button"
            onClick={onCancelar}
            className={`rounded-full border-2 border-home-orange-700 px-5 py-2 text-sm font-semibold text-home-orange-800 transition-colors hover:bg-home-orange-50 ${ENFOQUE}`}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}