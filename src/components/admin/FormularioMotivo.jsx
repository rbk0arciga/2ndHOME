import { useId, useState } from 'react'
import { CLASE_BOTON_PRINCIPAL, CLASE_BOTON_SECUNDARIO, CLASE_BOTON_PELIGRO_RELLENO } from './estilos'

// Formulario corto para escribir un motivo antes de confirmar una acción.
// children: contenido extra opcional antes de los botones (por ejemplo, una casilla).
export default function FormularioMotivo({
  etiqueta,
  ayuda,
  placeholder,
  textoConfirmar,
  tono = 'peligro', // 'peligro' (rojo) o 'neutral' (naranja)
  minimo = 10,
  mensajeError,
  onConfirmar,
  onCancelar,
  children,
}) {
  const [texto, setTexto] = useState('')
  const [error, setError] = useState('')
  const id = useId()
  const esPeligro = tono === 'peligro'

  const alConfirmar = (e) => {
    e.preventDefault()
    if (texto.trim().length < minimo) {
      setError(mensajeError ?? `Escribe al menos ${minimo} caracteres.`)
      return
    }
    onConfirmar(texto.trim())
  }

  let claseBorde = esPeligro ? 'border-red-200 focus:border-red-500' : 'border-home-orange-200 focus:border-home-orange-500'
  if (error) claseBorde = 'border-red-600 focus:border-red-700'

  return (
    <form
      onSubmit={alConfirmar}
      noValidate
      className={`space-y-3 rounded-2xl p-4 ${esPeligro ? 'bg-red-50' : 'bg-home-orange-50'}`}
    >
      <div>
        <label htmlFor={id} className="block text-sm font-semibold text-gray-900">
          {etiqueta}
        </label>
        {ayuda && <p className="mt-0.5 text-xs text-gray-700">{ayuda}</p>}
      </div>

      <textarea
        id={id}
        rows={3}
        autoFocus
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value)
          if (error) setError('')
        }}
        placeholder={placeholder}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full resize-y rounded-xl border-2 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none ${claseBorde}`}
      />
      {error && (
        <p id={`${id}-error`} className="text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      {children}

      <div className="flex flex-wrap gap-3">
        <button type="submit" className={esPeligro ? CLASE_BOTON_PELIGRO_RELLENO : CLASE_BOTON_PRINCIPAL}>
          {textoConfirmar}
        </button>
        <button type="button" onClick={onCancelar} className={CLASE_BOTON_SECUNDARIO}>
          Cancelar
        </button>
      </div>
    </form>
  )
}