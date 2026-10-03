import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LuHouse,
  LuUsers,
  LuMenu,
  LuX,
  LuMessageCircle,
  LuUserRound,
  LuShieldCheck,
  LuLogIn,
  LuLogOut,
} from 'react-icons/lu'
import logo from '../assets/logo.png'
import Avatar from './Avatar'
import { usuarioActual, conversaciones } from '../data/mockData'

// Contorno visible al navegar con teclado (se reutiliza en todo el archivo)
const ENFOQUE =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-home-orange-500'

// Secciones de la navegación secundaria
const SECCIONES = [
  { to: '/', etiqueta: 'Alojamiento', Icono: LuHouse },
  { to: '/comunidad', etiqueta: 'Comunidad', Icono: LuUsers },
]

// A dónde lleva "Mi perfil" según el rol
const PERFIL_POR_ROL = {
  estudiante: '/perfil-estudiante',
  arrendador: '/perfil-arrendador',
  admin: '/admin',
}

// Enlace destacado de la barra según quién haya iniciado sesión
function accionPorRol(usuario) {
  if (usuario?.rol === 'arrendador') return { to: '/perfil-arrendador', texto: 'Publicar propiedad' }
  if (usuario?.rol === 'admin') return null // El admin ya llega a su panel desde "Mi perfil"
  return { to: '/registro?rol=arrendador', texto: 'Sé un 2nd HOST' }
}

// "Alojamiento" también se marca como activa dentro del detalle de una propiedad
function esSeccionActiva(to, pathname) {
  if (to === '/') return pathname === '/' || pathname.startsWith('/propiedad')
  return pathname.startsWith(to)
}

/* ---------- Botón de perfil (avatar) ---------- */
function BotonPerfil({ usuario }) {
  if (!usuario) {
    return (
      <Link
        to="/login"
        aria-label="Iniciar sesión"
        className={`grid h-10 w-10 place-items-center rounded-full bg-home-orange-300 text-home-orange-900 transition-colors hover:bg-home-orange-400 ${ENFOQUE}`}
      >
        <LuUserRound className="h-5 w-5" aria-hidden="true" />
      </Link>
    )
  }

  return (
    <Link to={PERFIL_POR_ROL[usuario.rol]} aria-label="Ir a mi perfil" className={`rounded-full ${ENFOQUE}`}>
      <Avatar src={usuario.avatar} nombre={usuario.nombre} className="ring-2 ring-home-orange-300" />
    </Link>
  )
}

/* ---------- Menú desplegable (hamburguesa) ---------- */
function MenuUsuario({ usuario, accion }) {
  const [abierto, setAbierto] = useState(false)
  const contenedorRef = useRef(null)
  const cerrar = () => setAbierto(false)

  // Total de mensajes sin leer (se muestra como punto y como contador)
  const noLeidos = conversaciones.reduce((total, c) => total + c.noLeidos, 0)

  // Cierra el menú al hacer clic fuera de él o al presionar Escape
  useEffect(() => {
    if (!abierto) return

    function alHacerClicFuera(evento) {
      if (contenedorRef.current && !contenedorRef.current.contains(evento.target)) setAbierto(false)
    }
    function alPresionarTecla(evento) {
      if (evento.key === 'Escape') setAbierto(false)
    }

    document.addEventListener('mousedown', alHacerClicFuera)
    document.addEventListener('keydown', alPresionarTecla)
    return () => {
      document.removeEventListener('mousedown', alHacerClicFuera)
      document.removeEventListener('keydown', alPresionarTecla)
    }
  }, [abierto])

  const claseItem = `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-800 transition-colors hover:bg-home-orange-50 ${ENFOQUE}`
  const claseIcono = 'h-5 w-5 shrink-0 text-home-orange-500'

  return (
    <div ref={contenedorRef} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((valor) => !valor)}
        aria-expanded={abierto}
        aria-controls="menu-usuario"
        aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
        className={`relative grid h-10 w-10 place-items-center rounded-full bg-home-orange-300 text-home-orange-900 transition-colors hover:bg-home-orange-400 ${ENFOQUE}`}
      >
        {abierto ? <LuX className="h-5 w-5" aria-hidden="true" /> : <LuMenu className="h-5 w-5" aria-hidden="true" />}
        {noLeidos > 0 && !abierto && (
          <span className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-home-orange-100 bg-home-orange-700" />
        )}
      </button>

      {abierto && (
        <div
          id="menu-usuario"
          className="absolute right-0 top-12 w-64 rounded-2xl border border-home-orange-200 bg-white p-2 shadow-lg shadow-home-orange-900/10"
        >
          {usuario ? (
            <>
              {/* Datos de la sesión */}
              <div className="flex items-center gap-3 px-3 py-2">
                <Avatar src={usuario.avatar} nombre={usuario.nombre} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">{usuario.nombre}</p>
                  <p className="truncate text-xs text-gray-600">{usuario.correo}</p>
                </div>
              </div>
              <hr className="my-2 border-home-orange-100" />

              <Link to={PERFIL_POR_ROL[usuario.rol]} onClick={cerrar} className={claseItem}>
                {usuario.rol === 'admin' ? (
                  <><LuShieldCheck className={claseIcono} aria-hidden="true" /> Panel de administración</>
                ) : (
                  <><LuUserRound className={claseIcono} aria-hidden="true" /> Mi perfil</>
                )}
              </Link>

              {usuario.rol !== 'admin' && (
                <Link to="/chat" onClick={cerrar} className={claseItem}>
                  <LuMessageCircle className={claseIcono} aria-hidden="true" />
                  Mensajes
                  {noLeidos > 0 && (
                    <span className="ml-auto rounded-full bg-home-orange-700 px-2 py-0.5 text-xs font-semibold text-white">
                      {noLeidos}
                    </span>
                  )}
                </Link>
              )}

              {/* En móvil la acción principal vive aquí; en escritorio está en la barra */}
              {accion && (
                <Link to={accion.to} onClick={cerrar} className={`${claseItem} md:hidden`}>
                  <LuHouse className={claseIcono} aria-hidden="true" /> {accion.texto}
                </Link>
              )}

              <hr className="my-2 border-home-orange-100" />
              {/* Maqueta: más adelante cerrará la sesión real de Firebase */}
              <Link to="/login" onClick={cerrar} className={claseItem}>
                <LuLogOut className={claseIcono} aria-hidden="true" /> Cerrar sesión
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" onClick={cerrar} className={claseItem}>
                <LuLogIn className={claseIcono} aria-hidden="true" /> Iniciar sesión
              </Link>
              <Link to="/registro" onClick={cerrar} className={claseItem}>
                <LuUserRound className={claseIcono} aria-hidden="true" /> Crear cuenta
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  )
}

/* ---------- Navegación secundaria (Alojamiento, Comunidad, Consejos) ---------- */
function NavegacionSecundaria({ pathname }) {
  return (
    <nav aria-label="Secciones principales" className="px-4 pt-4 md:pt-6">
      <ul className="mx-auto flex max-w-sm gap-1 rounded-full border border-home-orange-200 bg-white p-1">
        {SECCIONES.map(({ to, etiqueta, Icono }) => {
          const activa = esSeccionActiva(to, pathname)
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                aria-current={activa ? 'page' : undefined}
                className={`flex items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-colors md:py-2.5 md:text-base ${ENFOQUE} ${
                  activa ? 'bg-home-orange-700 text-white' : 'text-home-orange-900 hover:bg-home-orange-100'
                }`}
              >
                <Icono className="h-5 w-5 shrink-0" aria-hidden="true" />
                {etiqueta}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/* ---------- Componente principal ---------- */
export default function Navbar() {
  // Mientras no exista Firebase Authentication, la sesión viene de mockData
  const usuario = usuarioActual
  const { pathname } = useLocation()
  const accion = accionPorRol(usuario)

  return (
    <>
      {/* Solo la barra superior se queda fija al hacer scroll, para no ocupar tanto espacio en móvil */}
      <header className="sticky top-0 z-40 border-b border-home-orange-200 bg-home-orange-100">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:h-20 md:px-8">
          <Link to="/" aria-label="2nd HOME, ir al inicio" className={`flex items-center gap-2 rounded-lg ${ENFOQUE}`}>
            <img src={logo} alt="" className="h-9 w-auto md:h-12" />
            {/* Si tu logo.svg solo contiene la casita, descomenta la siguiente línea: */}
            {/* <span className="font-logo text-2xl text-home-orange-800 md:text-3xl">2nd HOME</span> */}
          </Link>

          <div className="flex items-center gap-3 md:gap-4">
            {accion && (
              <Link
                to={accion.to}
                className={`hidden rounded-md font-medium text-home-orange-900 underline decoration-home-orange-400 decoration-2 underline-offset-4 transition-colors hover:text-home-orange-700 md:inline ${ENFOQUE}`}
              >
                {accion.texto}
              </Link>
            )}
            <BotonPerfil usuario={usuario} />
            <MenuUsuario usuario={usuario} accion={accion} />
          </div>
        </div>
      </header>

      <NavegacionSecundaria pathname={pathname} />
    </>
  )
}