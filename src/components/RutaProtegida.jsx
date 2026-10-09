import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSesion } from '../context/sesion'

// Envuelve las rutas que requieren sesión.
// Sin sesión, manda al login y recuerda la página que se intentaba abrir.
export default function RutaProtegida() {
  const { usuario } = useSesion()
  const location = useLocation()

  if (!usuario) {
    return <Navigate to="/login" replace state={{ desde: location.pathname + location.search }} />
  }

  // Outlet muestra la página que corresponde a la ruta actual
  return <Outlet />
}