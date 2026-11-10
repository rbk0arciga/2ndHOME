import { useId, useState } from 'react'
import { LuUpload, LuFileText, LuX, LuLoader } from 'react-icons/lu'
import { prepararDocumento, ErrorDocumento } from '../utils/documentos'

const ENFOQUE =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-home-orange-500'
const ENFOQUE_INTERNO =
  'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-home-orange-500'

// Campo para subir un documento personal (foto o PDF), con vista previa y peso.
// valor: el documento ya preparado o null. ref: va al campo de archivo, para llevar el foco ahí si hay error.
export default function SubirDocumento({ ref, etiqueta, ayuda, valor, onCambiar, error }) {
  const [procesando, setProcesando] = useState(false)
  const [errorArchivo, setErrorArchivo] = useState('')
  const id = useId()
  const mensajeError = errorArchivo || error

  const alElegir = async (e) => {
    const archivo = e.target.files?.[0]
    e.target.value = '' // Permite volver a elegir el mismo archivo
    if (!archivo) return

    setProcesando(true)
    setErrorArchivo('')
    try {
      onCambiar(await prepararDocumento(archivo))
    } catch (err) {
      setErrorArchivo(
        err instanceof ErrorDocumento ? err.message : 'No pudimos leer el archivo. Usa una foto JPG o PNG, o un PDF.'
      )
    } finally {
      setProcesando(false)
    }
  }

  const campoArchivo = (
    <input
      ref={ref}
      id={id}
      type="file"
      accept="image/jpeg,image/png,image/webp,application/pdf"
      onChange={alElegir}
      disabled={procesando}
      aria-invalid={mensajeError ? 'true' : undefined}
      aria-describedby={[ayuda && `${id}-ayuda`, mensajeError && `${id}-error`].filter(Boolean).join(' ') || undefined}
      className="sr-only"
    />
  )

  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-gray-900">
        {etiqueta}
      </label>
      {ayuda && (
        <p id={`${id}-ayuda`} className="mt-0.5 text-xs text-gray-600">
          {ayuda}
        </p>
      )}

      {valor ? (
        // Archivo elegido: vista previa, peso y opciones para cambiarlo o quitarlo
        <div className="mt-2 flex items-center gap-3 rounded-2xl border-2 border-home-orange-200 bg-white p-3">
          {valor.tipoMime === 'application/pdf' ? (
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-home-orange-100 text-home-orange-700">
              <LuFileText className="h-7 w-7" aria-hidden="true" />
            </span>
          ) : (
            <img
              src={valor.contenido}
              alt={`Vista previa: ${etiqueta}`}
              className="h-14 w-14 shrink-0 rounded-xl object-cover"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">{valor.nombre}</p>
            <p className="text-xs text-gray-600">{Math.round(valor.tamano / 1024)} KB</p>
          </div>
          <label
            className={`cursor-pointer rounded-full px-3 py-1.5 text-sm font-semibold text-home-orange-800 hover:bg-home-orange-50 ${ENFOQUE_INTERNO}`}
          >
            Cambiar
            {campoArchivo}
          </label>
          <button
            type="button"
            onClick={() => onCambiar(null)}
            aria-label={`Quitar archivo: ${etiqueta}`}
            className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-gray-600 hover:bg-home-orange-50 hover:text-gray-900 ${ENFOQUE}`}
          >
            <LuX className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        // Sin archivo: zona para elegirlo
        <label
          className={`mt-2 flex cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-colors hover:bg-home-orange-50 ${ENFOQUE_INTERNO} ${
            mensajeError ? 'border-red-600' : 'border-home-orange-300'
          }`}
        >
          {procesando ? (
            <LuLoader className="h-6 w-6 animate-spin text-home-orange-600 motion-reduce:animate-none" aria-hidden="true" />
          ) : (
            <LuUpload className="h-6 w-6 text-home-orange-600" aria-hidden="true" />
          )}
          <span className="text-sm font-semibold text-home-orange-800">
            {procesando ? 'Preparando archivo…' : 'Elegir archivo'}
          </span>
          <span className="text-xs text-gray-600">Foto (JPG o PNG) o PDF de hasta 650 KB</span>
          {campoArchivo}
        </label>
      )}

      {mensajeError && (
        <p id={`${id}-error`} className="mt-1.5 text-sm font-medium text-red-700">
          {mensajeError}
        </p>
      )}
    </div>
  )
}