import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { LuMail, LuMailCheck, LuLoader, LuLock } from 'react-icons/lu'
import CampoFormulario from '../components/CampoFormulario'
import { useSesion } from '../context/sesion'
import { formatoFechaLarga } from '../firebase/admision'
import { aspiranteVencido, esCorreoInstitucional, DOMINIO_INSTITUCIONAL } from '../utils/aspirantes'

const ENFOQUE =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-home-orange-500'
const CLASE_BOTON = `flex h-12 w-full items-center justify-center gap-2 rounded-full bg-home-orange-700 px-6 font-semibold text-white transition-colors hover:bg-home-orange-800 disabled:cursor-wait disabled:opacity-80 ${ENFOQUE}`
const CLASE_ENLACE = `rounded text-sm underline underline-offset-4 ${ENFOQUE}`

const FORMATO_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Errores de Firebase al solicitar el cambio → mensaje para el usuario
const MENSAJES_ERROR = {
  'auth/email-already-in-use': 'Ya existe una cuenta con ese correo. Inicia sesión con ella.',
  'auth/invalid-email': 'Revisa el formato del correo.',
  'auth/requires-recent-login': 'Por seguridad, cierra sesión, vuelve a entrar e inténtalo de nuevo.',
  'auth/too-many-requests': 'Ya enviamos varios correos. Espera unos minutos antes de pedir otro.',
  'auth/network-request-failed': 'No hay conexión con el servidor. Revisa tu internet.',
}

export default function ActualizarCorreo() {
  const { usuario, cargando, solicitarCambioCorreo, comprobarCambioCorreo, cerrarSesion } = useSesion()
  const navigate = useNavigate()
  const [correo, setCorreo] = useState('')
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [procesando, setProcesando] = useState(false)

  if (cargando) return null
  if (!usuario) return <Navigate to="/login" replace />
  // Solo aplica a aspirantes
  if (!usuario.aspirante) return <Navigate to="/" replace />

  const vencida = aspiranteVencido(usuario)
  const fechaVigencia = usuario.vigenteHasta ? formatoFechaLarga(usuario.vigenteHasta.toDate()) : ''

  const enviarEnlace = async (e) => {
    e.preventDefault()
    setError('')
    setMensaje('')
    const limpio = correo.trim().toLowerCase()
    if (!FORMATO_CORREO.test(limpio) || !esCorreoInstitucional(limpio)) {
      setError(`Escribe tu correo institucional, que termina en ${DOMINIO_INSTITUCIONAL}.`)
      return
    }

    setProcesando(true)
    try {
      await solicitarCambioCorreo(limpio)
      setEnviado(true)
    } catch (err) {
      setError(MENSAJES_ERROR[err.code] ?? 'No pudimos enviar el enlace. Inténtalo de nuevo.')
    } finally {
      setProcesando(false)
    }
  }

  const yaLoVerifique = async () => {
    setError('')
    setMensaje('')
    setProcesando(true)
    try {
      const resultado = await comprobarCambioCorreo()
      if (resultado === 'reiniciar') {
        navigate('/login', { replace: true })
        return
      }
      setMensaje('Todavía no aparece el cambio. Abre el enlace que te enviamos y vuelve a intentarlo.')
    } catch {
      setError('No pudimos comprobarlo. Revisa tu conexión e inténtalo de nuevo.')
    } finally {
      setProcesando(false)
    }
  }

  return (
    <main className="px-4 pb-16 pt-8 md:pt-12">
      <div className="mx-auto max-w-lg rounded-3xl border border-home-orange-200 bg-white p-6 sm:p-8">
        <div className="text-center">
          <span
            className={`mx-auto grid h-16 w-16 place-items-center rounded-2xl ${
              vencida ? 'bg-red-50 text-red-700' : 'bg-home-orange-100 text-home-orange-700'
            }`}
          >
            {vencida ? <LuLock className="h-8 w-8" aria-hidden="true" /> : <LuMail className="h-8 w-8" aria-hidden="true" />}
          </span>
          <h1 className="mt-5 text-2xl font-bold text-gray-900">
            {vencida ? 'Tu cuenta está suspendida' : 'Cambia a tu correo institucional'}
          </h1>
          <p className="mt-2 text-gray-700">
            {vencida
              ? `El periodo de aspirantes terminó el ${fechaVigencia}. Para volver a usar 2nd HOME, cambia a tu correo institucional y verifícalo.`
              : `Tu cuenta de aspirante vence el ${fechaVigencia}. Cambia a tu correo institucional antes para no perder el acceso.`}
          </p>
        </div>

        {error && (
          <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </p>
        )}
        {mensaje && (
          <p role="status" className="mt-5 rounded-xl bg-home-orange-50 p-3 text-sm text-home-orange-900">
            {mensaje}
          </p>
        )}

        {enviado ? (
          // Paso 2: abrir el enlace y confirmar
          <div className="mt-6 space-y-4 text-center">
            <p className="flex items-start gap-2 rounded-2xl bg-home-orange-50 p-4 text-left text-sm text-home-orange-900">
              <LuMailCheck className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <span>
                Enviamos un enlace a <strong>{correo.trim()}</strong>. Ábrelo para confirmar el cambio y después
                presiona el botón. Si no lo ves, revisa la carpeta de no deseados.
              </span>
            </p>
            <button type="button" onClick={yaLoVerifique} disabled={procesando} className={CLASE_BOTON}>
              {procesando && <LuLoader className="h-5 w-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
              Ya lo verifiqué
            </button>
            <button
              type="button"
              onClick={() => setEnviado(false)}
              className={`${CLASE_ENLACE} font-semibold text-home-orange-800 hover:text-home-orange-900`}
            >
              Usar otro correo
            </button>
          </div>
        ) : (
          // Paso 1: escribir el correo institucional
          <form onSubmit={enviarEnlace} noValidate className="mt-6 space-y-5">
            <CampoFormulario
              etiqueta="Correo institucional"
              type="email"
              autoComplete="email"
              placeholder={`nombre${DOMINIO_INSTITUCIONAL}`}
              Icono={LuMail}
              value={correo}
              onChange={(e) => {
                setCorreo(e.target.value)
                setError('')
              }}
              ayuda="Te enviaremos un enlace para verificarlo. Seguirás usando la misma contraseña."
            />
            <button type="submit" disabled={procesando} className={CLASE_BOTON}>
              {procesando && <LuLoader className="h-5 w-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
              Enviar enlace de verificación
            </button>
          </form>
        )}

        <div className="mt-6 flex flex-col items-center gap-2">
          {!vencida && (
            <Link to="/" className={`${CLASE_ENLACE} font-semibold text-home-orange-800 hover:text-home-orange-900`}>
              Hacerlo más tarde
            </Link>
          )}
          <button type="button" onClick={() => cerrarSesion()} className={`${CLASE_ENLACE} text-gray-600 hover:text-gray-900`}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </main>
  )
}