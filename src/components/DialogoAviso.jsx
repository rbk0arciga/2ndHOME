import { useEffect, useRef } from 'react'
import { LuX, LuShieldCheck } from 'react-icons/lu'
import ContenidoAviso from './ContenidoAviso'

const ENFOQUE =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-home-orange-500'

// Ventana con el aviso de privacidad.
// onAceptar es opcional: si se pasa, aparece el botón "Acepto el aviso".
export default function DialogoAviso({ abierto, onCerrar, onAceptar }) {
  const dialogoRef = useRef(null)

  // Abre o cierra la ventana cuando cambia "abierto"
  useEffect(() => {
    const dialogo = dialogoRef.current
    if (!dialogo) return
    if (abierto && !dialogo.open) dialogo.showModal()
    if (!abierto && dialogo.open) dialogo.close()
  }, [abierto])

  return (
    <dialog
      ref={dialogoRef}
      onClose={onCerrar} // También se dispara al presionar Escape
      aria-labelledby="titulo-dialogo-aviso"
      className="m-auto w-[min(48rem,calc(100%-2rem))] overflow-hidden rounded-3xl bg-white p-0 shadow-xl backdrop:bg-home-orange-900/40"
    >
      <div className="flex max-h-[85dvh] flex-col">
        <header className="flex items-center gap-3 border-b border-home-orange-100 px-5 py-4 sm:px-8">
          <LuShieldCheck className="h-6 w-6 shrink-0 text-home-orange-700" aria-hidden="true" />
          <h2 id="titulo-dialogo-aviso" className="flex-1 text-lg font-bold text-gray-900">
            Aviso de privacidad
          </h2>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar aviso de privacidad"
            className={`grid h-9 w-9 place-items-center rounded-full bg-home-orange-100 text-home-orange-900 transition-colors hover:bg-home-orange-200 ${ENFOQUE}`}
          >
            <LuX className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        {/* Solo el texto hace scroll; el encabezado y los botones quedan fijos */}
        <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-8">
          <ContenidoAviso nivel={3} />
        </div>

        <footer className="flex flex-wrap justify-end gap-3 border-t border-home-orange-100 px-5 py-4 sm:px-8">
          <button
            type="button"
            onClick={onCerrar}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold text-home-orange-800 hover:bg-home-orange-50 ${ENFOQUE}`}
          >
            Cerrar
          </button>
          {onAceptar && (
            <button
              type="button"
              onClick={onAceptar}
              className={`rounded-full bg-home-orange-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-home-orange-800 ${ENFOQUE}`}
            >
              Acepto el aviso
            </button>
          )}
        </footer>
      </div>
    </dialog>
  )
}