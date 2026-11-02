import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { LuMailCheck, LuLoader } from 'react-icons/lu'
import { useSesion } from '../context/sesion'

const ENFOQUE =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-home-orange-500'

export default function VerificarCorreo() {
  const { usuario, cargando, reenviarVerificacion, recargarVerificacion, cerrarSesion } = useSesion()
  const navigate = useNavigate()
  const [mensaje, setMensaje] = useState('')
  const [revisando, setRevisando] = useState(false)

  if (cargando) return null
  if (!usuario) return <Navigate to="/login" replace />
  // Si ya está verificado (o no es 2nd GUEST), no tiene nada que hacer aquí
  if (usuario.rol !== 'estudiante' || usuario.correoVerificado) return <Navigate to="/" replace />

  const yaLoVerifique = async () => {
    setRevisando(true)
    setMensaje('')
    try {
      const verificado = await recargarVerificacion()
      if (verificado) {
        navigate('/', { replace: true })
      } else {
        setMensaje('Todavía no aparece verificado. Abre el enlace del correo y vuelve a intentarlo.')
      }
    } catch {
      setMensaje('No pudimos comprobarlo. Revisa tu conexión e inténtalo de nuevo.')
    } finally {
      setRevisando(false)
    }
  }

  const reenviar = async () => {
    setMensaje('')
    try {
      await reenviarVerificacion()
      setMensaje(`Te enviamos un correo nuevo a ${usuario.correo}.`)
    } catch (error) {
      setMensaje(
        error.code === 'auth/too-many-requests'
          ? 'Ya enviamos varios correos. Espera unos minutos antes de pedir otro.'
          : 'No pudimos enviar el correo. Inténtalo de nuevo.'
      )
    }
  }

  return (
    <main className="px-4 pb-16 pt-8 md:pt-12">
      <div className="mx-auto max-w-lg rounded-3xl border border-home-orange-200 bg-white p-6 text-center sm:p-8">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-home-orange-100 text-home-orange-700">
          <LuMailCheck className="h-8 w-8" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-2xl font-bold text-gray-900">Verifica tu correo institucional</h1>
        <p className="mt-2 text-gray-700">
          Enviamos un enlace a <span className="font-semibold text-gray-900">{usuario.correo}</span>. Ábrelo y
          después regresa aquí. Si no lo ves, revisa la carpeta de correo no deseado.
        </p>

        {mensaje && (
          <p role="status" className="mt-5 rounded-xl bg-home-orange-50 p-3 text-sm text-home-orange-900">
            {mensaje}
          </p>
        )}

        <div className="mt-6 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={yaLoVerifique}
            disabled={revisando}
            className={`flex h-12 w-full items-center justify-center gap-2 rounded-full bg-home-orange-700 px-6 font-semibold text-white transition-colors hover:bg-home-orange-800 disabled:cursor-wait disabled:opacity-80 sm:w-auto ${ENFOQUE}`}
          >
            {revisando && <LuLoader className="h-5 w-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
            Ya lo verifiqué
          </button>
          <button
            type="button"
            onClick={reenviar}
            className={`rounded text-sm font-semibold text-home-orange-800 underline underline-offset-4 hover:text-home-orange-900 ${ENFOQUE}`}
          >
            Reenviar el correo
          </button>
          <button
            type="button"
            onClick={cerrarSesion}
            className={`rounded text-sm text-gray-600 underline underline-offset-4 hover:text-gray-900 ${ENFOQUE}`}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </main>
  )
}