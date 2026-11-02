import { useRef, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { LuMail, LuLock, LuEye, LuEyeOff, LuLoader, LuUserPlus } from 'react-icons/lu'
import CampoFormulario from '../components/CampoFormulario'
import { useSesion } from '../context/sesion'

const ENFOQUE =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-home-orange-500'

// Formato básico de correo: algo@algo.algo
const FORMATO_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Mensaje genérico para credenciales: no revela si el correo existe (buena práctica de seguridad)
const MENSAJE_CREDENCIALES = 'El correo o la contraseña no coinciden. Revísalos e inténtalo de nuevo.'

// Códigos de error de Firebase Authentication → mensaje para el usuario
const MENSAJES_ERROR = {
  'auth/invalid-credential': MENSAJE_CREDENCIALES,
  'auth/wrong-password': MENSAJE_CREDENCIALES,
  'auth/user-not-found': MENSAJE_CREDENCIALES,
  'auth/invalid-email': 'Revisa el formato del correo.',
  'auth/user-disabled': 'Esta cuenta está desactivada. Contacta al equipo de 2nd HOME.',
  'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos o restablece tu contraseña.',
  'auth/network-request-failed': 'No hay conexión con el servidor. Revisa tu internet.',
}

function validar({ correo, contrasena }) {
  const errores = {}
  if (!correo.trim()) {
    errores.correo = 'Escribe tu correo.'
  } else if (!FORMATO_CORREO.test(correo.trim())) {
    errores.correo = 'Revisa el formato del correo, por ejemplo nombre@alumnos.udg.mx.'
  }
  if (!contrasena) errores.contrasena = 'Escribe tu contraseña.'
  return errores
}

export default function Login() {
  const { usuario, avisoSesion, iniciarSesion, recuperarContrasena } = useSesion()
  const location = useLocation()

  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [mostrarContrasena, setMostrarContrasena] = useState(false)
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [avisoRecuperar, setAvisoRecuperar] = useState('')
  const [enviando, setEnviando] = useState(false)

  const correoRef = useRef(null)
  const contrasenaRef = useRef(null)

  // Con sesión iniciada, se envía a la página que intentaba abrir, o a la de su rol
  if (usuario) {
    return <Navigate to={location.state?.desde ?? (usuario.rol === 'admin' ? '/admin' : '/')} replace />
  }

  // Al escribir en un campo con error, el mensaje desaparece
  const alCambiarCorreo = (e) => {
    setCorreo(e.target.value)
    if (errores.correo) setErrores((prev) => ({ ...prev, correo: undefined }))
  }
  const alCambiarContrasena = (e) => {
    setContrasena(e.target.value)
    if (errores.contrasena) setErrores((prev) => ({ ...prev, contrasena: undefined }))
  }

  const alEnviar = async (e) => {
    e.preventDefault()
    setErrorGeneral('')
    setAvisoRecuperar('')

    const nuevosErrores = validar({ correo, contrasena })
    setErrores(nuevosErrores)

    // Lleva el cursor al primer campo con error
    if (nuevosErrores.correo) {
      correoRef.current?.focus()
      return
    }
    if (nuevosErrores.contrasena) {
      contrasenaRef.current?.focus()
      return
    }

    setEnviando(true)
    const resultado = await iniciarSesion(correo, contrasena)
    // Si todo salió bien, el contexto carga el perfil y este componente redirige solo
    if (resultado.error) {
      setEnviando(false)
      setErrorGeneral(MENSAJES_ERROR[resultado.error] ?? 'No pudimos iniciar sesión. Inténtalo de nuevo.')
    }
  }

  // Envía el correo para restablecer la contraseña al correo escrito arriba
  const alRecuperar = async () => {
    setErrorGeneral('')
    setAvisoRecuperar('')
    if (!FORMATO_CORREO.test(correo.trim())) {
      setErrores((prev) => ({ ...prev, correo: 'Escribe tu correo para enviarte el enlace de recuperación.' }))
      correoRef.current?.focus()
      return
    }
    try {
      await recuperarContrasena(correo)
    } catch (error) {
      if (error.code === 'auth/network-request-failed') {
        setErrorGeneral(MENSAJES_ERROR['auth/network-request-failed'])
        return
      }
      // Cualquier otro error se trata igual que el éxito, para no revelar qué correos existen
    }
    setAvisoRecuperar('Si existe una cuenta con ese correo, te enviamos un enlace para restablecer la contraseña.')
  }

  const mensajeVisible = errorGeneral || avisoSesion

  return (
    <main className="px-4 pb-16 pt-8 md:pt-12">
      <div className="mx-auto max-w-md rounded-3xl border border-home-orange-200 bg-white p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900">Inicia sesión</h1>
        <p className="mt-1 text-sm text-gray-700">Alojamiento revisado por el equipo de 2nd HOME, cerca de CUCEI.</p>

        {/* role="alert": los lectores de pantalla anuncian el error en cuanto aparece */}
        {mensajeVisible && (
          <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {mensajeVisible}
          </p>
        )}

        {/* noValidate: usamos nuestros propios mensajes en lugar de los del navegador */}
        <form onSubmit={alEnviar} noValidate className="mt-6 space-y-5">
          <CampoFormulario
            ref={correoRef}
            etiqueta="Correo"
            type="email"
            autoComplete="email"
            placeholder="nombre@alumnos.udg.mx"
            Icono={LuMail}
            value={correo}
            onChange={alCambiarCorreo}
            error={errores.correo}
          />

          <div>
            <CampoFormulario
              ref={contrasenaRef}
              etiqueta="Contraseña"
              type={mostrarContrasena ? 'text' : 'password'}
              autoComplete="current-password"
              Icono={LuLock}
              value={contrasena}
              onChange={alCambiarContrasena}
              error={errores.contrasena}
              accionDerecha={
                <button
                  type="button"
                  onClick={() => setMostrarContrasena((valor) => !valor)}
                  aria-label={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  aria-pressed={mostrarContrasena}
                  className={`grid h-9 w-9 place-items-center rounded-lg text-gray-600 transition-colors hover:bg-home-orange-50 hover:text-home-orange-800 ${ENFOQUE}`}
                >
                  {mostrarContrasena ? (
                    <LuEyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <LuEye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              }
            />

            <div className="mt-2 text-right">
              <button
                type="button"
                onClick={alRecuperar}
                className={`rounded text-sm font-semibold text-home-orange-800 underline underline-offset-4 hover:text-home-orange-900 ${ENFOQUE}`}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            {avisoRecuperar && (
              <p role="status" className="mt-2 rounded-xl bg-home-orange-50 p-3 text-sm text-home-orange-900">
                {avisoRecuperar}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={enviando}
            className={`flex h-12 w-full items-center justify-center gap-2 rounded-full bg-home-orange-700 font-semibold text-white transition-colors hover:bg-home-orange-800 disabled:cursor-wait disabled:opacity-80 ${ENFOQUE}`}
          >
            {enviando && <LuLoader className="h-5 w-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
            {enviando ? 'Entrando…' : 'Iniciar sesión'}
          </button>
        </form>

        {/* Separador y acceso a crear cuenta */}
        <div className="mt-6 flex items-center gap-3 text-sm text-gray-600">
          <span className="h-px flex-1 bg-home-orange-200" />
          ¿Primera vez en 2nd HOME?
          <span className="h-px flex-1 bg-home-orange-200" />
        </div>
        <Link
          to="/registro"
          className={`mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-home-orange-700 font-semibold text-home-orange-800 transition-colors hover:bg-home-orange-50 ${ENFOQUE}`}
        >
          <LuUserPlus className="h-5 w-5" aria-hidden="true" />
          Crear cuenta
        </Link>
      </div>
    </main>
  )
}