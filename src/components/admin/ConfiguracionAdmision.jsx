import { useId, useState } from 'react'
import { LuCalendarDays, LuLoader, LuCheck } from 'react-icons/lu'
import { CLASE_BOTON_PRINCIPAL } from './estilos'
import { usePeriodoAdmision } from '../../hooks/usePeriodoAdmision'
import {
  calcularVentana,
  guardarPeriodo,
  formatoFechaLarga,
  DIAS_ANTES,
  DIAS_DESPUES,
} from '../../firebase/admision'

const ESTADOS = {
  'sin-configurar': {
    texto: 'Sin configurar',
    clase: 'border-gray-200 bg-gray-50 text-gray-700',
    nota: 'Mientras no haya fecha, nadie puede registrarse como aspirante.',
  },
  proxima: {
    texto: 'Próxima',
    clase: 'border-home-orange-200 bg-home-orange-50 text-home-orange-900',
    nota: 'El registro de aspirantes todavía no abre.',
  },
  abierta: {
    texto: 'Abierta',
    clase: 'border-green-200 bg-green-50 text-green-800',
    nota: 'Los aspirantes de primer ingreso pueden registrarse con su correo personal.',
  },
  cerrada: {
    texto: 'Cerrada',
    clase: 'border-red-200 bg-red-50 text-red-800',
    nota: 'Ya no se aceptan registros de aspirantes. Las cuentas de aspirante que no cambiaron a su correo institucional quedan suspendidas.',
  },
}

export default function ConfiguracionAdmision() {
  const { periodo, cargando, estado } = usePeriodoAdmision()
  const [fecha, setFecha] = useState(null) // null = todavía no se edita; se muestra la guardada
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const idFecha = useId()

  if (cargando) {
    return (
      <p className="flex items-center gap-2 text-gray-700" aria-busy="true">
        <LuLoader className="h-5 w-5 animate-spin text-home-orange-600 motion-reduce:animate-none" aria-hidden="true" />
        Cargando configuración…
      </p>
    )
  }

  const valor = fecha ?? periodo?.fechaDictamen ?? ''
  const vistaPrevia = valor ? calcularVentana(valor) : null
  const infoEstado = ESTADOS[estado]

  const guardar = async (e) => {
    e.preventDefault()
    setMensaje('')
    setError('')
    if (!valor) {
      setError('Elige la fecha en que se publica el dictamen de admisión.')
      return
    }
    setGuardando(true)
    try {
      await guardarPeriodo(valor)
      setFecha(null)
      setMensaje('Guardaste el periodo de admisión.')
    } catch {
      setError('No pudimos guardar el periodo. Revisa tu conexión e inténtalo de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <section aria-labelledby="titulo-admision" className="rounded-3xl border border-home-orange-200 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="titulo-admision" className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <LuCalendarDays className="h-5 w-5 text-home-orange-600" aria-hidden="true" />
            Periodo de admisión
          </h2>
          <p className="mt-1 max-w-prose text-sm text-gray-700">
            Los aspirantes de primer ingreso pueden registrarse con su correo personal desde {DIAS_ANTES} días antes
            hasta {DIAS_DESPUES} días después de que se publica el dictamen. Al cerrar la ventana, sus cuentas se
            suspenden hasta que cambien a su correo institucional.
          </p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${infoEstado.clase}`}>
          {infoEstado.texto}
        </span>
      </div>

      {/* Periodo guardado */}
      <div className="mt-5 rounded-2xl bg-home-orange-50 p-4 text-sm text-home-orange-900">
        {periodo ? (
          <p>
            Registro abierto del <strong>{formatoFechaLarga(periodo.inicio)}</strong> al{' '}
            <strong>{formatoFechaLarga(periodo.fin)}</strong>.
          </p>
        ) : (
          <p>Todavía no hay un periodo guardado.</p>
        )}
        <p className="mt-1 text-home-orange-800">{infoEstado.nota}</p>
      </div>

      {/* Cambiar la fecha */}
      <form onSubmit={guardar} noValidate className="mt-6 space-y-4">
        <div className="max-w-xs">
          <label htmlFor={idFecha} className="text-sm font-semibold text-gray-900">
            Fecha de publicación del dictamen
          </label>
          <input
            id={idFecha}
            type="date"
            value={valor}
            onChange={(e) => {
              setFecha(e.target.value)
              setMensaje('')
              setError('')
            }}
            className="mt-1.5 h-12 w-full rounded-xl border-2 border-home-orange-200 bg-white px-3 text-sm text-gray-900 focus:border-home-orange-500 focus:outline-none"
          />
        </div>

        {vistaPrevia && fecha !== null && (
          <p className="text-sm text-gray-700">
            Con esta fecha, el registro de aspirantes estará abierto del{' '}
            <strong>{formatoFechaLarga(vistaPrevia.inicio)}</strong> al{' '}
            <strong>{formatoFechaLarga(vistaPrevia.fin)}</strong>.
          </p>
        )}

        <p className="text-xs text-gray-600">
          Cambiar la fecha no modifica la vigencia de las cuentas de aspirante que ya se registraron.
        </p>

        {error && (
          <p role="alert" className="text-sm font-medium text-red-700">
            {error}
          </p>
        )}
        {mensaje && (
          <p role="status" className="flex items-center gap-1.5 text-sm font-medium text-green-700">
            <LuCheck className="h-4 w-4" aria-hidden="true" />
            {mensaje}
          </p>
        )}

        <button type="submit" disabled={guardando} className={`${CLASE_BOTON_PRINCIPAL} disabled:opacity-80`}>
          {guardando && <LuLoader className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
          Guardar periodo
        </button>
      </form>
    </section>
  )
}