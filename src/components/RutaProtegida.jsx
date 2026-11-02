import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { LuLoader } from 'react-icons/lu'
import { useSesion } from '../context/sesion'

// Envuelve las rutas que requieren sesión.
export default function RutaProtegida() {
  const { usuario, cargando } = useSesion()
  const location = useLocation()

  // Mientras Firebase confirma la sesión y se lee el perfil
  if (cargando) {
    return (
      <main className="grid min-h-[60vh] place-items-center px-4" aria-busy="true">
        <p className="flex items-center gap-2 text-gray-700">
          <LuLoader className="h-5 w-5 animate-spin text-home-orange-600 motion-reduce:animate-none" aria-hidden="true" />
          Cargando…
        </p>
      </main>
    )
  }

  // Sin sesión: al login, recordando la página que se intentaba abrir
  if (!usuario) {
    return <Navigate to="/login" replace state={{ desde: location.pathname + location.search }} />
  }

  // 2nd GUEST sin verificar su correo institucional: primero debe verificarlo
  if (usuario.rol === 'estudiante' && !usuario.correoVerificado) {
    return <Navigate to="/verificar-correo" replace />
  }

  return <Outlet />
}