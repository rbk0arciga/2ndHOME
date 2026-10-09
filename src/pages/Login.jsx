import { useRef, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { LuMail, LuLock, LuEye, LuEyeOff, LuLoader, LuUserPlus } from 'react-icons/lu'
import CampoFormulario from '../components/CampoFormulario'
import { useSesion } from '../context/sesion'
import { usuarios, CONTRASENA_DEMO } from '../data/mockData'

const ENFOQUE =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-home-orange-500'

const ETIQUETA_ROL = {
  estudiante: '2nd GUEST',
  arrendador: '2nd HOST',
  admin: 'Administrador',
}

// Formato básico de correo: algo@algo.algo
const FORMATO_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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
  const { usuario, iniciarSesion } = useSesion()
  const location = useLocation()

  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [mostrarContrasena, setMostrarContrasena] = useState(false)
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [avisoRecuperar, setAvisoRecuperar] = useState(false)
  const [enviando, setEnviando] = useState(false)

  const correoRef = useRef(null)
  const contrasenaRef = useRef(null)

  // Si ya hay sesión (por ejemplo, justo después de iniciarla), se envía a la
  // página que intentaba abrir antes del login, o al catálogo.
  if (usuario) {
    return <Navigate to={location.state?.desde ?? '/'} replace />
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

  const alEnviar = (e) => {
    e.preventDefault()
    setErrorGeneral('')

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

    // Simula la espera del servidor. Si los datos son correctos, el contexto guarda
    // la sesión y este componente redirige solo (ver el "if (usuario)" de arriba).
    setTimeout(() => {
      const resultado = iniciarSesion(correo, contrasena)
      if (!resultado) {
        setEnviando(false)
        // Mensaje genérico a propósito: no revela si el correo existe (buena práctica de seguridad)
        setErrorGeneral('El correo o la contraseña no coinciden. Revísalos e inténtalo de nuevo.')
      }
    }, 700)
  }

  // Llena el formulario con una cuenta de prueba
  const usarCuentaDemo = (cuenta) => {
    setCorreo(cuenta.correo)
    setContrasena(CONTRASENA_DEMO)
    setErrores({})
    setErrorGeneral('')
  }

  return (
    <main className="px-4 pb-16 pt-8 md:pt-12">
      <div className="mx-auto max-w-md">
        <div className="rounded-3xl border border-home-orange-200 bg-white p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900">Inicia sesión</h1>
          <p className="mt-1 text-sm text-gray-700">
            Alojamiento revisado por el equipo de 2nd HOME, cerca de CUCEI.
          </p>

          {/* role="alert": los lectores de pantalla anuncian el error en cuanto aparece */}
          {errorGeneral && (
            <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {errorGeneral}
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
                  onClick={() => setAvisoRecuperar(true)}
                  className={`rounded text-sm font-semibold text-home-orange-800 underline underline-offset-4 hover:text-home-orange-900 ${ENFOQUE}`}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              {avisoRecuperar && (
                <p role="status" className="mt-2 rounded-xl bg-home-orange-50 p-3 text-sm text-home-orange-900">
                  La recuperación de contraseña se activará al conectar Firebase.
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

        {/* MAQUETA: borrar este recuadro al conectar Firebase */}
        <section
          aria-labelledby="titulo-cuentas-prueba"
          className="mt-6 rounded-3xl border-2 border-dashed border-home-orange-300 p-5"
        >
          <h2 id="titulo-cuentas-prueba" className="text-sm font-semibold text-gray-900">
            Cuentas de prueba
          </h2>
          <p className="mt-1 text-xs text-gray-700">
            Contraseña para todas: <span className="font-mono font-semibold">{CONTRASENA_DEMO}</span>
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {usuarios.map((cuenta) => (
              <button
                key={cuenta.id}
                type="button"
                onClick={() => usarCuentaDemo(cuenta)}
                className={`rounded-full border border-home-orange-200 bg-white px-3 py-1.5 text-sm font-medium text-home-orange-900 transition-colors hover:border-home-orange-400 ${ENFOQUE}`}
              >
                {ETIQUETA_ROL[cuenta.rol]}
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}