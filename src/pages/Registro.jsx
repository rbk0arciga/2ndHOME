import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import {
  LuUserRound,
  LuMail,
  LuLock,
  LuEye,
  LuEyeOff,
  LuLoader,
  LuGraduationCap,
  LuKeyRound,
  LuBookOpen,
  LuPhone,
  LuMailCheck,
  LuArrowLeft,
  LuChevronRight,
} from 'react-icons/lu'
import CampoFormulario from '../components/CampoFormulario'
import { usuarios } from '../data/mockData'

const ENFOQUE =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-home-orange-500'
const CLASE_ENLACE = `rounded font-semibold text-home-orange-800 underline underline-offset-4 hover:text-home-orange-900 ${ENFOQUE}`

const DOMINIO_ESTUDIANTE = '@alumnos.udg.mx'
const FORMATO_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Firebase Authentication exige contraseñas de al menos 6 caracteres
const LARGO_MINIMO_CONTRASENA = 6

// Tipos de cuenta según la URL (/registro/guest o /registro/host).
// "rol" es el nombre interno que usa el resto del código.
const TIPOS_CUENTA = {
  guest: {
    rol: 'estudiante',
    nombre: '2nd GUEST',
    titulo: 'Soy 2nd GUEST',
    descripcion: 'Soy estudiante y busco dónde vivir cerca de CUCEI.',
    Icono: LuGraduationCap,
  },
  host: {
    rol: 'arrendador',
    nombre: '2nd HOST',
    titulo: 'Soy 2nd HOST',
    descripcion: 'Quiero rentar un espacio a estudiantes.',
    Icono: LuKeyRound,
  },
}

// Orden en que se revisan los campos (para llevar el cursor al primer error)
const ORDEN_CAMPOS = ['nombre', 'correo', 'carrera', 'telefono', 'contrasena', 'confirmar']

/* ---------- Estado del correo del 2nd GUEST mientras escribe ---------- */
// 'neutral': aún no escribe @ o va escribiendo el dominio correcto ("@alum...")
// 'valido': termina en @alumnos.udg.mx
// 'invalido': escribió otro dominio
function estadoCorreoEstudiante(correo) {
  const valor = correo.trim().toLowerCase()
  if (!valor.includes('@')) return 'neutral'
  if (valor.endsWith(DOMINIO_ESTUDIANTE) && FORMATO_CORREO.test(valor)) return 'valido'
  const dominioEscrito = valor.slice(valor.indexOf('@'))
  if (DOMINIO_ESTUDIANTE.startsWith(dominioEscrito)) return 'neutral'
  return 'invalido'
}

/* ---------- Validación completa al enviar ---------- */
function validar(datos, rol) {
  const errores = {}
  const correo = datos.correo.trim().toLowerCase()

  if (datos.nombre.trim().length < 3) errores.nombre = 'Escribe tu nombre completo.'

  if (!correo) {
    errores.correo = 'Escribe tu correo.'
  } else if (!FORMATO_CORREO.test(correo)) {
    errores.correo = 'Revisa el formato del correo.'
  } else if (rol === 'estudiante' && !correo.endsWith(DOMINIO_ESTUDIANTE)) {
    errores.correo = `Usa tu correo institucional, que termina en ${DOMINIO_ESTUDIANTE}.`
  } else if (usuarios.some((u) => u.correo.toLowerCase() === correo)) {
    errores.correo = 'Ya existe una cuenta con este correo. Inicia sesión.'
  }

  if (rol === 'estudiante' && !datos.carrera.trim()) {
    errores.carrera = 'Escribe tu carrera.'
  }

  if (rol === 'arrendador' && datos.telefono.replace(/\D/g, '').length !== 10) {
    errores.telefono = 'El teléfono debe tener 10 dígitos.'
  }

  if (datos.contrasena.length < LARGO_MINIMO_CONTRASENA) {
    errores.contrasena = `Usa al menos ${LARGO_MINIMO_CONTRASENA} caracteres.`
  }
  if (!datos.confirmar || datos.confirmar !== datos.contrasena) {
    errores.confirmar = 'Las contraseñas no coinciden.'
  }

  return errores
}

/* ==========================================================
   /registro: elegir tipo de cuenta
   ========================================================== */
function SeleccionTipoCuenta() {
  return (
    <main className="px-4 pb-16 pt-8 md:pt-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Crea tu cuenta</h1>
        <p className="mt-2 text-gray-700">¿Cómo vas a usar 2nd HOME?</p>
      </div>

      <ul className="mx-auto mt-8 grid max-w-2xl gap-4 sm:grid-cols-2">
        {Object.entries(TIPOS_CUENTA).map(([clave, { titulo, descripcion, Icono }]) => (
          <li key={clave}>
            <Link
              to={`/registro/${clave}`}
              className={`flex h-full flex-col items-center rounded-3xl border-2 border-home-orange-200 bg-white p-8 text-center transition-colors hover:border-home-orange-500 ${ENFOQUE}`}
            >
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-home-orange-100 text-home-orange-800">
                <Icono className="h-8 w-8" aria-hidden="true" />
              </span>
              <span className="mt-4 text-xl font-bold text-gray-900">{titulo}</span>
              <span className="mt-1 text-sm text-gray-700">{descripcion}</span>
              <span className="mt-6 inline-flex items-center gap-1 font-semibold text-home-orange-800">
                Continuar
                <LuChevronRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-center text-sm text-gray-700">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className={CLASE_ENLACE}>
          Inicia sesión
        </Link>
      </p>
    </main>
  )
}

/* ==========================================================
   Pantalla de éxito
   ========================================================== */
function RegistroExitoso({ rol, correo }) {
  const tituloRef = useRef(null)

  // Lleva el foco al título para que los lectores de pantalla anuncien el cambio
  useEffect(() => {
    tituloRef.current?.focus()
  }, [])

  const esEstudiante = rol === 'estudiante'

  return (
    <main className="px-4 pb-16 pt-8 md:pt-12">
      <div className="mx-auto max-w-lg rounded-3xl border border-home-orange-200 bg-white p-6 text-center sm:p-8">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-home-orange-100 text-home-orange-700">
          {esEstudiante ? (
            <LuMailCheck className="h-8 w-8" aria-hidden="true" />
          ) : (
            <LuKeyRound className="h-8 w-8" aria-hidden="true" />
          )}
        </span>

        <h1 ref={tituloRef} tabIndex={-1} className="mt-5 text-2xl font-bold text-gray-900 focus:outline-none">
          {esEstudiante ? 'Revisa tu correo' : 'Tu cuenta de 2nd HOST está lista'}
        </h1>
        <p className="mt-2 text-gray-700">
          {esEstudiante ? (
            <>
              Enviamos un enlace de verificación a <span className="font-semibold text-gray-900">{correo}</span>.
              Ábrelo para activar tu cuenta de 2nd GUEST y empezar a buscar dónde vivir.
            </>
          ) : (
            'Inicia sesión para publicar tu primera propiedad. Nuestro equipo la revisará antes de que aparezca en el catálogo.'
          )}
        </p>

        <Link
          to="/login"
          className={`mt-6 inline-flex h-12 items-center justify-center rounded-full bg-home-orange-700 px-6 font-semibold text-white transition-colors hover:bg-home-orange-800 ${ENFOQUE}`}
        >
          Ir a iniciar sesión
        </Link>

        <p className="mt-6 text-xs text-gray-600">
          Maqueta: el registro real se activará al conectar Firebase. Por ahora, entra con las cuentas de prueba.
        </p>
      </div>
    </main>
  )
}

/* ==========================================================
   /registro/guest y /registro/host: formulario
   ========================================================== */
function FormularioRegistro({ tipo }) {
  const { rol, nombre: nombreTipo } = TIPOS_CUENTA[tipo]
  const esEstudiante = rol === 'estudiante'

  const [datos, setDatos] = useState({
    nombre: '',
    correo: '',
    carrera: '',
    telefono: '',
    contrasena: '',
    confirmar: '',
  })
  const [errores, setErrores] = useState({})
  const [mostrarContrasena, setMostrarContrasena] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [registrado, setRegistrado] = useState(false)

  // Referencias para llevar el cursor al primer campo con error
  const refs = {
    nombre: useRef(null),
    correo: useRef(null),
    carrera: useRef(null),
    telefono: useRef(null),
    contrasena: useRef(null),
    confirmar: useRef(null),
  }

  // Actualiza un campo y borra su error en cuanto el usuario lo corrige
  const actualizar = (campo, valor) => {
    setDatos((prev) => ({ ...prev, [campo]: valor }))
    if (errores[campo]) setErrores((prev) => ({ ...prev, [campo]: undefined }))
  }

  const alEnviar = (e) => {
    e.preventDefault()
    const nuevosErrores = validar(datos, rol)
    setErrores(nuevosErrores)

    const primerError = ORDEN_CAMPOS.find((campo) => nuevosErrores[campo])
    if (primerError) {
      refs[primerError].current?.focus()
      return
    }

    setEnviando(true)
    // MAQUETA: con Firebase aquí irán createUserWithEmailAndPassword,
    // sendEmailVerification (2nd GUESTS) y el guardado del perfil en Firestore.
    setTimeout(() => {
      setEnviando(false)
      setRegistrado(true)
    }, 900)
  }

  if (registrado) return <RegistroExitoso rol={rol} correo={datos.correo.trim()} />

  // Validación visual del dominio mientras se escribe (solo 2nd GUESTS)
  const estadoCorreo = esEstudiante ? estadoCorreoEstudiante(datos.correo) : 'neutral'
  const errorCorreo =
    errores.correo ||
    (estadoCorreo === 'invalido' ? `Solo se aceptan correos que terminan en ${DOMINIO_ESTUDIANTE}.` : undefined)
  const exitoCorreo = estadoCorreo === 'valido' ? 'Correo institucional válido' : undefined

  const botonVerContrasena = (
    <button
      type="button"
      onClick={() => setMostrarContrasena((valor) => !valor)}
      aria-label={mostrarContrasena ? 'Ocultar contraseñas' : 'Mostrar contraseñas'}
      aria-pressed={mostrarContrasena}
      className={`grid h-9 w-9 place-items-center rounded-lg text-gray-600 transition-colors hover:bg-home-orange-50 hover:text-home-orange-800 ${ENFOQUE}`}
    >
      {mostrarContrasena ? <LuEyeOff className="h-5 w-5" aria-hidden="true" /> : <LuEye className="h-5 w-5" aria-hidden="true" />}
    </button>
  )

  return (
    <main className="px-4 pb-16 pt-8 md:pt-12">
      <div className="mx-auto max-w-lg">
        <Link
          to="/registro"
          className={`inline-flex items-center gap-2 rounded text-sm font-semibold text-home-orange-800 hover:text-home-orange-900 ${ENFOQUE}`}
        >
          <LuArrowLeft className="h-4 w-4" aria-hidden="true" />
          Cambiar tipo de cuenta
        </Link>

        <div className="mt-4 rounded-3xl border border-home-orange-200 bg-white p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900">Crea tu cuenta de {nombreTipo}</h1>
          <p className="mt-1 text-sm text-gray-700">
            {esEstudiante
              ? 'Encuentra alojamiento revisado cerca de CUCEI.'
              : 'Publica tu espacio para estudiantes de CUCEI.'}
          </p>

          <form onSubmit={alEnviar} noValidate className="mt-6 space-y-5">
            <CampoFormulario
              ref={refs.nombre}
              etiqueta="Nombre completo"
              autoComplete="name"
              Icono={LuUserRound}
              value={datos.nombre}
              onChange={(e) => actualizar('nombre', e.target.value)}
              error={errores.nombre}
            />

            <CampoFormulario
              ref={refs.correo}
              etiqueta={esEstudiante ? 'Correo institucional' : 'Correo'}
              type="email"
              autoComplete="email"
              placeholder={esEstudiante ? `nombre${DOMINIO_ESTUDIANTE}` : 'nombre@correo.com'}
              Icono={LuMail}
              value={datos.correo}
              onChange={(e) => actualizar('correo', e.target.value)}
              ayuda={
                esEstudiante
                  ? `Solo se aceptan correos que terminan en ${DOMINIO_ESTUDIANTE}.`
                  : 'Puedes usar cualquier correo personal.'
              }
              error={errorCorreo}
              exito={exitoCorreo}
            />

            {esEstudiante ? (
              <CampoFormulario
                ref={refs.carrera}
                etiqueta="Carrera"
                placeholder="Ej. Ingeniería en Computación"
                Icono={LuBookOpen}
                value={datos.carrera}
                onChange={(e) => actualizar('carrera', e.target.value)}
                error={errores.carrera}
              />
            ) : (
              <CampoFormulario
                ref={refs.telefono}
                etiqueta="Teléfono"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="33 1234 5678"
                Icono={LuPhone}
                value={datos.telefono}
                onChange={(e) => actualizar('telefono', e.target.value)}
                ayuda="10 dígitos."
                error={errores.telefono}
              />
            )}

            <CampoFormulario
              ref={refs.contrasena}
              etiqueta="Contraseña"
              type={mostrarContrasena ? 'text' : 'password'}
              autoComplete="new-password"
              Icono={LuLock}
              value={datos.contrasena}
              onChange={(e) => actualizar('contrasena', e.target.value)}
              error={errores.contrasena}
              accionDerecha={botonVerContrasena}
            />

            <CampoFormulario
              ref={refs.confirmar}
              etiqueta="Confirma tu contraseña"
              type={mostrarContrasena ? 'text' : 'password'}
              autoComplete="new-password"
              Icono={LuLock}
              value={datos.confirmar}
              onChange={(e) => actualizar('confirmar', e.target.value)}
              error={errores.confirmar}
            />

            <button
              type="submit"
              disabled={enviando}
              className={`flex h-12 w-full items-center justify-center gap-2 rounded-full bg-home-orange-700 font-semibold text-white transition-colors hover:bg-home-orange-800 disabled:cursor-wait disabled:opacity-80 ${ENFOQUE}`}
            >
              {enviando && <LuLoader className="h-5 w-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
              {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-700">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className={CLASE_ENLACE}>
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}

/* ==========================================================
   Página
   ========================================================== */
export default function Registro() {
  const { tipo } = useParams()

  // /registro → elegir tipo de cuenta
  if (!tipo) return <SeleccionTipoCuenta />

  // /registro/otra-cosa → regresa a elegir
  if (!TIPOS_CUENTA[tipo]) return <Navigate to="/registro" replace />

  // key: al cambiar entre guest y host, el formulario empieza limpio
  return <FormularioRegistro key={tipo} tipo={tipo} />
}