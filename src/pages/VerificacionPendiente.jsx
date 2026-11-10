import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { doc, updateDoc } from 'firebase/firestore'
import { LuClock, LuUpload, LuInfo, LuLoader } from 'react-icons/lu'
import SubirDocumento from '../components/SubirDocumento'
import DialogoAviso from '../components/DialogoAviso'
import { useSesion } from '../context/sesion'
import { db } from '../firebase/config'
import { guardarDocumento } from '../utils/documentos'
import { formatoFechaLarga } from '../firebase/admision'

const ENFOQUE =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-home-orange-500'
const CLASE_ENLACE = `rounded font-semibold text-home-orange-800 underline underline-offset-4 hover:text-home-orange-900 ${ENFOQUE}`

// Contenido según el estado de la ficha
const CONTENIDO = {
  en_revision: {
    Icono: LuClock,
    titulo: 'Estamos revisando tu ficha de admisión',
    texto: 'Cuando el equipo de 2nd HOME la apruebe, podrás buscar alojamiento. Esta pantalla se actualizará sola.',
  },
  sin_enviar: {
    Icono: LuUpload,
    titulo: 'Sube tu ficha de admisión',
    texto: 'Necesitamos comprobar que fuiste admitido en CUCEI. Sube una foto o un PDF de tu ficha o dictamen de admisión.',
  },
  rechazada: {
    Icono: LuInfo,
    titulo: 'Tu ficha necesita correcciones',
    texto: 'El equipo de 2nd HOME no pudo aprobar tu ficha. Revisa el motivo y súbela de nuevo.',
  },
}

export default function VerificacionPendiente() {
  const { usuario, cargando, cerrarSesion } = useSesion()
  const [ficha, setFicha] = useState(null)
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [avisoAbierto, setAvisoAbierto] = useState(false)

  if (cargando) return null
  if (!usuario) return <Navigate to="/login" replace />
  // Solo aplica a aspirantes cuya ficha aún no está aprobada
  if (usuario.rol !== 'estudiante' || !usuario.aspirante || usuario.fichaEstado === 'aprobada') {
    return <Navigate to="/" replace />
  }
  if (!usuario.correoVerificado) return <Navigate to="/verificar-correo" replace />

  const { fichaEstado = 'sin_enviar', motivoFicha, vigenteHasta } = usuario
  const { Icono, titulo, texto } = CONTENIDO[fichaEstado] ?? CONTENIDO.sin_enviar
  const puedeSubir = fichaEstado === 'sin_enviar' || fichaEstado === 'rechazada'

  const enviar = async (e) => {
    e.preventDefault()
    if (!ficha) {
      setError('Elige el archivo de tu ficha de admisión.')
      return
    }
    setEnviando(true)
    setError('')
    try {
      await guardarDocumento(usuario.id, 'fichaAdmision', ficha)
      await updateDoc(doc(db, 'usuarios', usuario.id), { fichaEstado: 'en_revision' })
      setFicha(null)
    } catch {
      setError('No pudimos enviar tu ficha. Revisa tu conexión e inténtalo de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main className="px-4 pb-16 pt-8 md:pt-12">
      <div className="mx-auto max-w-lg rounded-3xl border border-home-orange-200 bg-white p-6 sm:p-8">
        <div className="text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-home-orange-100 text-home-orange-700">
            <Icono className="h-8 w-8" aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-2xl font-bold text-gray-900">{titulo}</h1>
          <p className="mt-2 text-gray-700">{texto}</p>
        </div>

        {fichaEstado === 'rechazada' && motivoFicha && (
          <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <span className="font-semibold">Motivo:</span> {motivoFicha}
          </p>
        )}

        {vigenteHasta && (
          <p className="mt-5 rounded-2xl bg-home-orange-50 p-4 text-sm text-home-orange-900">
            Tu cuenta de aspirante es válida hasta el{' '}
            <strong>{formatoFechaLarga(vigenteHasta.toDate())}</strong>. Antes de esa fecha deberás cambiar a tu correo
            institucional.
          </p>
        )}

        {puedeSubir && (
          <form onSubmit={enviar} noValidate className="mt-6 space-y-4">
            <SubirDocumento
              etiqueta="Ficha de admisión"
              ayuda="Solo la verá el equipo de 2nd HOME y la borraremos al terminar la revisión."
              valor={ficha}
              onCambiar={(documento) => {
                setFicha(documento)
                setError('')
              }}
              error={error}
            />
            <p className="text-xs text-gray-600">
              Al enviarla aceptas que tratemos tu ficha como se explica en el{' '}
              <button type="button" onClick={() => setAvisoAbierto(true)} className={CLASE_ENLACE}>
                aviso de privacidad
              </button>
              .
            </p>
            <button
              type="submit"
              disabled={enviando}
              className={`flex h-12 w-full items-center justify-center gap-2 rounded-full bg-home-orange-700 font-semibold text-white transition-colors hover:bg-home-orange-800 disabled:cursor-wait disabled:opacity-80 ${ENFOQUE}`}
            >
              {enviando && <LuLoader className="h-5 w-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
              {enviando ? 'Enviando…' : 'Enviar ficha'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center">
          <button
            type="button"
            onClick={cerrarSesion}
            className={`rounded text-sm text-gray-600 underline underline-offset-4 hover:text-gray-900 ${ENFOQUE}`}
          >
            Cerrar sesión
          </button>
        </p>
      </div>

      <DialogoAviso abierto={avisoAbierto} onCerrar={() => setAvisoAbierto(false)} />
    </main>
  )
}