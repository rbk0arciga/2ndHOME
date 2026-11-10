import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { LuHouse, LuUsers, LuFlag, LuSettings, LuShieldCheck } from 'react-icons/lu'
import RevisionPropiedades from '../components/admin/RevisionPropiedades'
import RevisionFichas from '../components/admin/RevisionFichas'
import GestionUsuarios from '../components/admin/GestionUsuarios'
import GestionReportes from '../components/admin/GestionReportes'
import ConfiguracionAdmision from '../components/admin/ConfiguracionAdmision'
import { ENFOQUE } from '../components/admin/estilos'
import { useSesion } from '../context/sesion'
import { usePropiedades } from '../context/propiedades'
import { db } from '../firebase/config'

const SECCIONES = [
  { clave: 'propiedades', etiqueta: 'Propiedades', Icono: LuHouse },
  { clave: 'verificaciones', etiqueta: 'Verificaciones', Icono: LuShieldCheck },
  { clave: 'usuarios', etiqueta: 'Usuarios', Icono: LuUsers },
  { clave: 'reportes', etiqueta: 'Reportes', Icono: LuFlag },
  { clave: 'configuracion', etiqueta: 'Configuración', Icono: LuSettings },
]

// Cuenta en tiempo real los documentos de una consulta (para los contadores de pendientes)
function useConteo(esAdmin, crearConsulta) {
  const [conteo, setConteo] = useState(0)
  useEffect(() => {
    if (!esAdmin) return
    return onSnapshot(
      crearConsulta(),
      (resultado) => setConteo(resultado.size),
      () => setConteo(0)
    )
    // crearConsulta es una función fija definida abajo, fuera del componente
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [esAdmin])
  return conteo
}

const consultaReportesAbiertos = () => query(collection(db, 'reportes'), where('estado', '==', 'abierto'))
const consultaFichasEnRevision = () => query(collection(db, 'usuarios'), where('fichaEstado', '==', 'en_revision'))

export default function PanelAdmin() {
  const { usuario } = useSesion()
  const { propiedades } = usePropiedades()
  const { seccion = 'propiedades' } = useParams() // /admin, /admin/verificaciones, /admin/usuarios...
  const esAdmin = usuario.rol === 'admin'

  const reportesAbiertos = useConteo(esAdmin, consultaReportesAbiertos)
  const fichasEnRevision = useConteo(esAdmin, consultaFichasEnRevision)

  // Esta página es solo para el administrador
  if (!esAdmin) return <Navigate to="/" replace />
  if (!SECCIONES.some((s) => s.clave === seccion)) return <Navigate to="/admin" replace />

  const pendientes = {
    propiedades: propiedades.filter((p) => p.estado === 'pending').length,
    verificaciones: fichasEnRevision,
    reportes: reportesAbiertos,
  }

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-6 md:px-8">
      <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Panel de administración</h1>
      <p className="mt-1 text-gray-700">Revisa propiedades, verificaciones, cuentas y reportes de la comunidad.</p>

      {/* Navegación entre secciones: cada una tiene su propia dirección */}
      <nav aria-label="Secciones del panel" className="mt-6 border-b border-home-orange-200">
        <ul className="-mb-px flex gap-6 overflow-x-auto">
          {SECCIONES.map(({ clave, etiqueta, Icono }) => {
            const activa = clave === seccion
            return (
              <li key={clave}>
                <Link
                  to={clave === 'propiedades' ? '/admin' : `/admin/${clave}`}
                  aria-current={activa ? 'page' : undefined}
                  className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-semibold transition-colors ${ENFOQUE} ${
                    activa
                      ? 'border-home-orange-700 text-home-orange-900'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icono className="h-4 w-4" aria-hidden="true" />
                  {etiqueta}
                  {pendientes[clave] > 0 && (
                    <span className="rounded-full bg-home-orange-700 px-2 py-0.5 text-xs text-white">
                      {pendientes[clave]}
                      <span className="sr-only"> pendientes</span>
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="mt-6">
        {seccion === 'propiedades' && <RevisionPropiedades />}
        {seccion === 'verificaciones' && <RevisionFichas />}
        {seccion === 'usuarios' && <GestionUsuarios />}
        {seccion === 'reportes' && <GestionReportes />}
        {seccion === 'configuracion' && <ConfiguracionAdmision />}
      </div>
    </main>
  )
}