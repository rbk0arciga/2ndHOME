import { useId } from 'react'
import { LuCheck } from 'react-icons/lu'

// Campo de texto con etiqueta, ícono opcional, ayuda, mensaje de error y mensaje de éxito.
// Todo lo demás (type, value, onChange, placeholder, ref...) se pasa directo al <input>.
export default function CampoFormulario({
  etiqueta,
  error,
  exito,
  ayuda,
  Icono,
  accionDerecha, 
  className = '',
  ...propsInput
}) {
  const id = useId()
  const idAyuda = `${id}-ayuda`
  const idError = `${id}-error`
  const idExito = `${id}-exito`
  const mostrarExito = exito && !error

  // Conecta el campo con sus mensajes para que los lectores de pantalla los lean
  const describedBy =
    [ayuda && idAyuda, error && idError, mostrarExito && idExito].filter(Boolean).join(' ') || undefined

  let claseBorde = 'border-home-orange-200 focus:border-home-orange-500'
  if (error) claseBorde = 'border-red-600 focus:border-red-700'
  else if (mostrarExito) claseBorde = 'border-green-600 focus:border-green-700'

  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm font-semibold text-gray-900">
        {etiqueta}
      </label>

      <div className="relative mt-1.5">
        {Icono && (
          <Icono
            className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-home-orange-500"
            aria-hidden="true"
          />
        )}

        <input
          id={id}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          className={`h-12 w-full rounded-xl border-2 bg-white text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none ${
            Icono ? 'pl-11' : 'pl-4'
          } ${accionDerecha ? 'pr-12' : 'pr-4'} ${claseBorde}`}
          {...propsInput}
        />

        {accionDerecha && <div className="absolute right-1.5 top-1/2 -translate-y-1/2">{accionDerecha}</div>}
      </div>

      {ayuda && (
        <p id={idAyuda} className="mt-1.5 text-xs text-gray-600">
          {ayuda}
        </p>
      )}
      {error && (
        <p id={idError} className="mt-1.5 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
      {mostrarExito && (
        <p id={idExito} className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-green-700">
          <LuCheck className="h-4 w-4" aria-hidden="true" />
          {exito}
        </p>
      )}
    </div>
  )
}