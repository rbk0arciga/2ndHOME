import { useRef } from 'react'
import { ENFOQUE } from './estilos'

// Pestañas accesibles: Tab entra a la pestaña activa; las flechas izquierda/derecha cambian de pestaña.
// opciones: [{ valor, etiqueta, conteo? }]. El panel asociado debe tener id={idPanel}
// y aria-labelledby={`${idPanel}-${valor activo || 'todos'}`}.
export default function Pestanas({ etiqueta, opciones, activa, onCambiar, idPanel }) {
  const botonesRef = useRef([])

  const alPresionarTecla = (e, indice) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const paso = e.key === 'ArrowRight' ? 1 : -1
    const siguiente = (indice + paso + opciones.length) % opciones.length
    onCambiar(opciones[siguiente].valor)
    botonesRef.current[siguiente]?.focus()
  }

  return (
    <div
      role="tablist"
      aria-label={etiqueta}
      className="flex gap-1 overflow-x-auto rounded-full border border-home-orange-200 bg-white p-1 sm:inline-flex"
    >
      {opciones.map(({ valor, etiqueta: texto, conteo }, indice) => {
        const seleccionada = activa === valor
        return (
          <button
            key={valor || 'todos'}
            ref={(elemento) => {
              botonesRef.current[indice] = elemento
            }}
            type="button"
            role="tab"
            id={`${idPanel}-${valor || 'todos'}`}
            aria-selected={seleccionada}
            aria-controls={idPanel}
            tabIndex={seleccionada ? 0 : -1}
            onClick={() => onCambiar(valor)}
            onKeyDown={(e) => alPresionarTecla(e, indice)}
            className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold transition-colors sm:flex-none sm:px-4 ${ENFOQUE} ${
              seleccionada ? 'bg-home-orange-700 text-white' : 'text-home-orange-900 hover:bg-home-orange-100'
            }`}
          >
            {texto}
            {conteo !== undefined && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  seleccionada ? 'bg-white/20 text-white' : 'bg-home-orange-100 text-home-orange-900'
                }`}
              >
                {conteo}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}