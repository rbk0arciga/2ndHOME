import { useEffect, useId, useRef, useState } from 'react'
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
  LuShieldCheck,
} from 'react-icons/lu'
import CampoFormulario from '../components/CampoFormulario'
import DialogoAviso from '../components/DialogoAviso'
import SubirDocumento from '../components/SubirDocumento'
import { useSesion } from '../context/sesion'
import { usePeriodoAdmision } from '../hooks/usePeriodoAdmision'
import { formatoFechaLarga } from '../firebase/admision'

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
    descripcion: 'Soy estudiante o aspirante y busco dónde vivir cerca de CUCEI.',
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
const ORDEN_CAMPOS = ['nombre', 'correo', 'carrera', 'ficha', 'telefono', 'contrasena', 'confirmar', 'aviso']

// Códigos de error de Firebase al crear la cuenta → mensaje para el usuario
const MENSAJES_ERROR_REGISTRO = {
  'auth/email-already-in-use': 'Ya existe una cuenta con este correo. Inicia sesión.',
  'auth/invalid-email': 'Revisa el formato del correo.',
  'auth/weak-password': 'La contraseña es muy débil. Usa al menos 6 caracteres.',
  'auth/network-request-failed': 'No hay conexión con el servidor. Revisa tu internet.',
  'permission-denied':
    'No pudimos guardar tu perfil. Revisa que tu correo sea el correcto y, si eres aspirante, que el registro de aspirantes siga abierto.',
}

/* ---------- Estado del correo institucional mientras se escribe ---------- */
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

/* ---------- Texto de la opción "aspirante" según el periodo de admisión ---------- */
function textoOpcionAspirante(estado, periodo) {
  if (estado === 'abierta') return `Registro con correo personal abierto hasta el ${formatoFechaLarga(periodo.fin)}.`
  if (estado === 'proxima') return `Disponible a partir del ${formatoFechaLarga(periodo.inicio)}.`
  if (estado === 'cerrada') return 'El registro de aspirantes de este periodo ya cerró.'
  return 'Por ahora no está disponible.'
}

/* ---------- Validación completa al enviar ---------- */
function validar(datos, rol, esAspirante, ficha) {
  const errores = {}
  const correo = datos.correo.trim().toLowerCase()

  if (datos.nombre.trim().length < 3) errores.nombre = 'Escribe tu nombre completo.'

  if (!correo) {
    errores.correo = 'Escribe tu correo.'
  } else if (!FORMATO_CORREO.test(correo)) {
    errores.correo = 'Revisa el formato del correo.'
  } else if (rol === 'estudiante' && !esAspirante && !correo.endsWith(DOMINIO_ESTUDIANTE)) {
    errores.correo = `Usa tu correo institucional, que termina en ${DOMINIO_ESTUDIANTE}.`
  } else if (esAspirante && correo.endsWith(DOMINIO_ESTUDIANTE)) {
    errores.correo = 'Ese es un correo institucional: elige "Sí, ya lo tengo".'
  }

  if (rol === 'estudiante' && !datos.carrera.trim()) {
    errores.carrera = esAspirante ? 'Escribe la carrera a la que fuiste admitido.' : 'Escribe tu carrera.'
  }

  if (esAspirante && !ficha) errores.ficha = 'Sube tu ficha de admisión.'

  if (rol === 'arrendador' && datos.telefono.replace(/\D/g, '').length !== 10) {
    errores.telefono = 'El teléfono debe tener 10 dígitos.'
  }

  if (datos.contrasena.length < LARGO_MINIMO_CONTRASENA) {
    errores.contrasena = `Usa al menos ${LARGO_MINIMO_CONTRASENA} caracteres.`
  }
  if (!datos.confirmar || datos.confirmar !== datos.contrasena) {
    errores.confirmar = 'Las contraseñas no coinciden.'
  }

  if (!datos.aceptaAviso) {
    errores.aviso = 'Para crear tu cuenta, lee y acepta el aviso de privacidad.'
  }

  return errores
}

/* ==========================================================
   /registro: elegir tipo de cuenta
   ========================================================== */
function SeleccionTipoCuenta() {
  const [avisoAbierto, setAvisoAbierto] = useState(false)

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

      {/* Aviso de privacidad visible desde que se elige el tipo de cuenta */}
      <p className="mx-auto mt-6 flex max-w-2xl items-start justify-center gap-2 text-center text-sm text-gray-700">
        <LuShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-home-orange-600" aria-hidden="true" />
        <span>
          Al crear una cuenta aceptas nuestro{' '}
          <button type="button" onClick={() => setAvisoAbierto(true)} className={CLASE_ENLACE}>
            aviso de privacidad
          </button>
          .
        </span>
      </p>

      <p className="mt-6 text-center text-sm text-gray-700">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className={CLASE_ENLACE}>
          Inicia sesión
        </Link>
      </p>

      <DialogoAviso abierto={avisoAbierto} onCerrar={() => setAvisoAbierto(false)} />
    </main>
  )
}

/* ==========================================================
   Pantalla de éxito
   ========================================================== */
function RegistroExitoso({ rol, correo, aspirante }) {
  const tituloRef = useRef(null)

  // Lleva el foco al título para que los lectores de pantalla anuncien el cambio
  useEffect(() => {
    tituloRef.current?.focus()
  }, [])

  const esEstudiante = rol === 'estudiante'

  let texto = 'Ya puedes publicar tu primera propiedad. Nuestro equipo la revisará antes de que aparezca en el catálogo.'
  if (esEstudiante) {
    texto = aspirante ? (
      <>
        Enviamos un enlace de verificación a <span className="font-semibold text-gray-900">{correo}</span>. Ábrelo y
        después revisaremos tu ficha de admisión. Si no ves el correo, revisa la carpeta de no deseados.
      </>
    ) : (
      <>
        Enviamos un enlace de verificación a <span className="font-semibold text-gray-900">{correo}</span>. Ábrelo para
        activar tu cuenta de 2nd GUEST. Si no lo ves, revisa la carpeta de no deseados.
      </>
    )
  }

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
        <p className="mt-2 text-gray-700">{texto}</p>

        <Link
          to={esEstudiante ? '/verificar-correo' : '/perfil-arrendador'}
          className={`mt-6 inline-flex h-12 items-center justify-center rounded-full bg-home-orange-700 px-6 font-semibold text-white transition-colors hover:bg-home-orange-800 ${ENFOQUE}`}
        >
          {esEstudiante ? 'Continuar' : 'Ir a mi perfil'}
        </Link>
      </div>
    </main>
  )
}

/* ==========================================================
   Opción "¿Ya tienes tu correo institucional?"
   ========================================================== */
function OpcionCorreo({ nombre, checked, disabled = false, onChange, titulo, descripcion }) {
  return (
    <label
      className={`flex items-start gap-3 rounded-2xl border-2 p-3 transition-colors has-checked:border-home-orange-700 has-checked:bg-home-orange-50 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-home-orange-500 ${
        disabled
          ? 'cursor-not-allowed border-gray-200 bg-gray-50 opacity-70'
          : 'cursor-pointer border-home-orange-200 bg-white hover:border-home-orange-400'
      }`}
    >
      <input
        type="radio"
        name={nombre}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="mt-1 h-4 w-4 shrink-0 accent-home-orange-600"
      />
      <span>
        <span className="block text-sm font-semibold text-gray-900">{titulo}</span>
        <span className="block text-xs text-gray-700">{descripcion}</span>
      </span>
    </label>
  )
}

/* ==========================================================
   /registro/guest y /registro/host: formulario
   ========================================================== */
function FormularioRegistro({ tipo }) {
  const { rol, nombre: nombreTipo } = TIPOS_CUENTA[tipo]
  const esEstudiante = rol === 'estudiante'
  const { registrarse } = useSesion()
  const { periodo, estado: estadoVentana } = usePeriodoAdmision()

  const [datos, setDatos] = useState({
    nombre: '',
    correo: '',
    carrera: '',
    telefono: '',
    contrasena: '',
    confirmar: '',
    aceptaAviso: false,
  })
  const [esAspirante, setEsAspirante] = useState(false)
  const [ficha, setFicha] = useState(null)
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [mostrarContrasena, setMostrarContrasena] = useState(false)
  const [avisoAbierto, setAvisoAbierto] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [registrado, setRegistrado] = useState(false)
  const idAviso = useId()
  const nombreOpcionCorreo = useId()

  // Referencias para llevar el cursor al primer campo con error
  const refNombre = useRef(null)
  const refCorreo = useRef(null)
  const refCarrera = useRef(null)
  const refFicha = useRef(null)
  const refTelefono = useRef(null)
  const refContrasena = useRef(null)
  const refConfirmar = useRef(null)
  const refAviso = useRef(null)

  const aspiranteDisponible = estadoVentana === 'abierta'

  // Actualiza un campo y borra su error en cuanto el usuario lo corrige
  const actualizar = (campo, valor) => {
    setDatos((prev) => ({ ...prev, [campo]: valor }))
    if (errores[campo]) setErrores((prev) => ({ ...prev, [campo]: undefined }))
  }

  const cambiarModo = (aspirante) => {
    setEsAspirante(aspirante)
    setErrores((prev) => ({ ...prev, correo: undefined, carrera: undefined, ficha: undefined }))
  }

  // "Acepto el aviso" en la ventana marca la casilla y cierra la ventana
  const aceptarAviso = () => {
    setDatos((prev) => ({ ...prev, aceptaAviso: true }))
    setErrores((prev) => ({ ...prev, aviso: undefined }))
    setAvisoAbierto(false)
  }

  const alEnviar = async (e) => {
    e.preventDefault()
    setErrorGeneral('')
    const nuevosErrores = validar(datos, rol, esAspirante, ficha)
    setErrores(nuevosErrores)

    // El objeto se arma aquí (en el evento), no durante el render
    const refsPorCampo = {
      nombre: refNombre,
      correo: refCorreo,
      carrera: refCarrera,
      ficha: refFicha,
      telefono: refTelefono,
      contrasena: refContrasena,
      confirmar: refConfirmar,
      aviso: refAviso,
    }
    const primerError = ORDEN_CAMPOS.find((campo) => nuevosErrores[campo])
    if (primerError) {
      refsPorCampo[primerError].current?.focus()
      return
    }

    // La ventana pudo cerrarse mientras se llenaba el formulario
    if (esAspirante && !aspiranteDisponible) {
      setErrorGeneral('El registro de aspirantes no está abierto en este momento.')
      return
    }

    setEnviando(true)
    try {
      await registrarse({
        rol,
        ...datos,
        aspirante: esAspirante,
        vigenteHasta: esAspirante ? periodo.fin : null,
        ficha: esAspirante ? ficha : null,
      })
      setRegistrado(true)
    } catch (error) {
      const mensaje = MENSAJES_ERROR_REGISTRO[error.code] ?? 'No pudimos crear la cuenta. Inténtalo de nuevo.'
      // Si el correo ya existe, el error se muestra en ese campo
      if (error.code === 'auth/email-already-in-use') {
        setErrores((prev) => ({ ...prev, correo: mensaje }))
        refCorreo.current?.focus()
      } else {
        setErrorGeneral(mensaje)
      }
    } finally {
      setEnviando(false)
    }
  }

  if (registrado) return <RegistroExitoso rol={rol} correo={datos.correo.trim()} aspirante={esAspirante} />

  // Validación visual del dominio mientras se escribe (solo 2nd GUESTS con correo institucional)
  const validarDominio = esEstudiante && !esAspirante
  const estadoCorreo = validarDominio ? estadoCorreoEstudiante(datos.correo) : 'neutral'
  const errorCorreo =
    errores.correo ||
    (estadoCorreo === 'invalido' ? `Solo se aceptan correos que terminan en ${DOMINIO_ESTUDIANTE}.` : undefined)
  const exitoCorreo = estadoCorreo === 'valido' ? 'Correo institucional válido' : undefined

  let etiquetaCorreo = 'Correo'
  let ayudaCorreo = 'Puedes usar cualquier correo personal.'
  if (esEstudiante && esAspirante) {
    etiquetaCorreo = 'Correo personal'
    ayudaCorreo = `Te enviaremos un enlace para verificarlo. Antes del ${formatoFechaLarga(
      periodo.fin
    )} deberás cambiarlo por tu correo institucional.`
  } else if (esEstudiante) {
    etiquetaCorreo = 'Correo institucional'
    ayudaCorreo = `Solo se aceptan correos que terminan en ${DOMINIO_ESTUDIANTE}.`
  }

  let ayudaAviso = 'Explica qué datos pedimos, para qué los usamos y qué ven los 2nd HOSTS de tu perfil.'
  if (!esEstudiante) {
    ayudaAviso =
      'Explica qué datos pedimos y cómo cuidamos los documentos que te pediremos antes de publicar: tu identificación oficial y un comprobante de domicilio.'
  } else if (esAspirante) {
    ayudaAviso =
      'Explica cómo cuidamos tu ficha de admisión y que los 2nd HOSTS verán que eres aspirante de primer ingreso.'
  }

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

          {errorGeneral && (
            <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {errorGeneral}
            </p>
          )}

          <form onSubmit={alEnviar} noValidate className="mt-6 space-y-5">
            {/* Solo 2nd GUESTS: ¿correo institucional o aspirante? */}
            {esEstudiante && (
              <fieldset>
                <legend className="text-sm font-semibold text-gray-900">¿Ya tienes tu correo @alumnos.udg.mx?</legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <OpcionCorreo
                    nombre={nombreOpcionCorreo}
                    checked={!esAspirante}
                    onChange={() => cambiarModo(false)}
                    titulo="Sí, ya lo tengo"
                    descripcion="Soy estudiante de CUCEI."
                  />
                  <OpcionCorreo
                    nombre={nombreOpcionCorreo}
                    checked={esAspirante}
                    disabled={!aspiranteDisponible}
                    onChange={() => cambiarModo(true)}
                    titulo="Aún no, soy aspirante"
                    descripcion={textoOpcionAspirante(estadoVentana, periodo)}
                  />
                </div>
              </fieldset>
            )}

            <CampoFormulario
              ref={refNombre}
              etiqueta="Nombre completo"
              autoComplete="name"
              Icono={LuUserRound}
              value={datos.nombre}
              onChange={(e) => actualizar('nombre', e.target.value)}
              error={errores.nombre}
            />

            <CampoFormulario
              ref={refCorreo}
              etiqueta={etiquetaCorreo}
              type="email"
              autoComplete="email"
              placeholder={validarDominio ? `nombre${DOMINIO_ESTUDIANTE}` : 'nombre@correo.com'}
              Icono={LuMail}
              value={datos.correo}
              onChange={(e) => actualizar('correo', e.target.value)}
              ayuda={ayudaCorreo}
              error={errorCorreo}
              exito={exitoCorreo}
            />

            {esEstudiante ? (
              <CampoFormulario
                ref={refCarrera}
                etiqueta={esAspirante ? 'Carrera a la que fuiste admitido' : 'Carrera'}
                placeholder="Ej. Ingeniería en Computación"
                Icono={LuBookOpen}
                value={datos.carrera}
                onChange={(e) => actualizar('carrera', e.target.value)}
                error={errores.carrera}
              />
            ) : (
              <CampoFormulario
                ref={refTelefono}
                etiqueta="Teléfono"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="33 1234 5678"
                Icono={LuPhone}
                value={datos.telefono}
                onChange={(e) => actualizar('telefono', e.target.value)}
                ayuda="10 dígitos. No se muestra a otros usuarios."
                error={errores.telefono}
              />
            )}

            {/* Solo aspirantes: ficha de admisión */}
            {esEstudiante && esAspirante && (
              <SubirDocumento
                ref={refFicha}
                etiqueta="Ficha de admisión"
                ayuda="Foto o PDF de tu dictamen o ficha de admisión a CUCEI. Solo la verá el equipo de 2nd HOME y la borraremos al terminar la revisión."
                valor={ficha}
                onCambiar={(documento) => {
                  setFicha(documento)
                  if (errores.ficha) setErrores((prev) => ({ ...prev, ficha: undefined }))
                }}
                error={errores.ficha}
              />
            )}

            <CampoFormulario
              ref={refContrasena}
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
              ref={refConfirmar}
              etiqueta="Confirma tu contraseña"
              type={mostrarContrasena ? 'text' : 'password'}
              autoComplete="new-password"
              Icono={LuLock}
              value={datos.confirmar}
              onChange={(e) => actualizar('confirmar', e.target.value)}
              error={errores.confirmar}
            />

            {/* Aceptación del aviso de privacidad */}
            <div>
              <div
                className={`flex items-start gap-3 rounded-2xl border-2 p-4 ${
                  errores.aviso ? 'border-red-600 bg-red-50' : 'border-transparent bg-home-orange-50'
                }`}
              >
                <input
                  ref={refAviso}
                  id={idAviso}
                  type="checkbox"
                  checked={datos.aceptaAviso}
                  onChange={(e) => actualizar('aceptaAviso', e.target.checked)}
                  aria-invalid={errores.aviso ? 'true' : undefined}
                  aria-describedby={errores.aviso ? `${idAviso}-error` : `${idAviso}-ayuda`}
                  className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-home-orange-600"
                />
                <div className="text-sm">
                  <label htmlFor={idAviso} className="cursor-pointer font-semibold text-gray-900">
                    He leído y acepto el aviso de privacidad
                  </label>
                  <p id={`${idAviso}-ayuda`} className="mt-1 text-gray-700">
                    {ayudaAviso}
                  </p>
                  <button type="button" onClick={() => setAvisoAbierto(true)} className={`mt-2 ${CLASE_ENLACE}`}>
                    Leer el aviso de privacidad
                  </button>
                </div>
              </div>
              {errores.aviso && (
                <p id={`${idAviso}-error`} className="mt-1.5 text-sm font-medium text-red-700">
                  {errores.aviso}
                </p>
              )}
            </div>

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

      <DialogoAviso abierto={avisoAbierto} onCerrar={() => setAvisoAbierto(false)} onAceptar={aceptarAviso} />
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