import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore'
import { LuSearch, LuX, LuLoader } from 'react-icons/lu'
import Avatar from '../Avatar'
import Pestanas from './Pestanas'
import FormularioMotivo from './FormularioMotivo'
import {
  ENFOQUE,
  CLASE_BOTON_SECUNDARIO,
  CLASE_BOTON_PELIGRO,
  ETIQUETA_ROL,
  formatoMesAnio,
  normalizar,
} from './estilos'
import { usePropiedades } from '../../context/propiedades'
import { db } from '../../firebase/config'

const ID_PANEL = 'panel-usuarios'

const CLASE_ENLACE = `rounded text-sm font-semibold text-home-orange-800 underline underline-offset-4 hover:text-home-orange-900 ${ENFOQUE}`

// Qué implica suspender, según el rol
const EFECTO_SUSPENSION = {
  estudiante: 'Su sesión se cerrará y no podrá volver a entrar ni escribir a los 2nd HOSTS.',
  arrendador: 'Su sesión se cerrará y no podrá volver a entrar.',
}

function FilaUsuario({ cuenta, numPropiedades, reportesAbiertos, onSuspender, onReactivar }) {
  const [suspendiendo, setSuspendiendo] = useState(false)
  const { id, rol, nombre, correo, avatar, carrera, estado, motivoSuspension, miembroDesde } = cuenta
  const suspendida = estado === 'suspendida'

  return (
    <li className="rounded-3xl border border-home-orange-200 bg-white p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex min-w-0 flex-1 gap-4">
          <Avatar src={avatar} nombre={nombre} tamano="lg" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-gray-900">{nombre}</h3>
              <span className="rounded-full bg-home-orange-100 px-2.5 py-0.5 text-xs font-semibold text-home-orange-900">
                {ETIQUETA_ROL[rol]}
              </span>
              {suspendida && (
                <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-800">
                  Suspendida
                </span>
              )}
            </div>
            <p className="mt-0.5 text-sm text-gray-700 wrap-anywhere">{correo}</p>
            <p className="mt-1 text-sm text-gray-600">
              {rol === 'estudiante' ? carrera : `${numPropiedades} ${numPropiedades === 1 ? 'propiedad' : 'propiedades'}`}
              {miembroDesde && ` · En 2nd HOME desde ${formatoMesAnio(miembroDesde)}`}
            </p>
            {reportesAbiertos > 0 && (
              <p className="mt-1 text-sm font-semibold text-red-700">
                {reportesAbiertos} {reportesAbiertos === 1 ? 'reporte abierto' : 'reportes abiertos'}
              </p>
            )}
          </div>
        </div>

        {/* Acciones */}
        {!suspendiendo && (
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            {rol === 'arrendador' && (
              <Link to={`/perfil-arrendador/${id}`} className={CLASE_ENLACE}>
                Ver perfil
              </Link>
            )}
            {suspendida ? (
              <button type="button" onClick={() => onReactivar(cuenta)} className={CLASE_BOTON_SECUNDARIO}>
                Reactivar
              </button>
            ) : (
              <button type="button" onClick={() => setSuspendiendo(true)} className={CLASE_BOTON_PELIGRO}>
                Suspender
              </button>
            )}
          </div>
        )}
      </div>

      {suspendida && motivoSuspension && (
        <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">
          <span className="font-semibold">Motivo de la suspensión:</span> {motivoSuspension}
        </p>
      )}

      {suspendiendo && (
        <div className="mt-4">
          <FormularioMotivo
            etiqueta={`Motivo para suspender a ${nombre}`}
            ayuda={EFECTO_SUSPENSION[rol]}
            placeholder="Ej. Pidió depósitos antes de mostrar la propiedad."
            textoConfirmar="Suspender cuenta"
            onConfirmar={(motivo) => {
              onSuspender(cuenta, motivo)
              setSuspendiendo(false)
            }}
            onCancelar={() => setSuspendiendo(false)}
          />
        </div>
      )}
    </li>
  )
}

export default function GestionUsuarios() {
  const { propiedades } = usePropiedades()
  const [cuentas, setCuentas] = useState([])
  const [reportesAbiertos, setReportesAbiertos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [rol, setRol] = useState('') // '' = todos
  const [aviso, setAviso] = useState('')

  // Cuentas en tiempo real desde Firestore (las reglas solo se lo permiten al administrador)
  useEffect(() => {
    return onSnapshot(
      collection(db, 'usuarios'),
      (resultado) => {
        setCuentas(resultado.docs.map((documento) => ({ id: documento.id, ...documento.data() })))
        setCargando(false)
      },
      (error) => {
        setErrorCarga(`No se pudieron cargar las cuentas (${error.code}).`)
        setCargando(false)
      }
    )
  }, [])

  // Reportes abiertos, para mostrar cuántos tiene cada cuenta
  useEffect(() => {
    const consulta = query(collection(db, 'reportes'), where('estado', '==', 'abierto'))
    return onSnapshot(
      consulta,
      (resultado) => setReportesAbiertos(resultado.docs.map((documento) => documento.data())),
      () => setReportesAbiertos([])
    )
  }, [])

  // Se gestionan 2nd GUESTS y 2nd HOSTS; las cuentas de administración no aparecen
  const gestionables = cuentas.filter((c) => c.rol !== 'admin')
  const conteos = {
    todos: gestionables.length,
    estudiante: gestionables.filter((c) => c.rol === 'estudiante').length,
    arrendador: gestionables.filter((c) => c.rol === 'arrendador').length,
  }

  const textoBuscado = normalizar(busqueda.trim())
  const lista = gestionables
    .filter((c) => !rol || c.rol === rol)
    .filter((c) => !textoBuscado || normalizar(`${c.nombre} ${c.correo}`).includes(textoBuscado))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))

  const suspender = async (cuenta, motivo) => {
    try {
      await updateDoc(doc(db, 'usuarios', cuenta.id), { estado: 'suspendida', motivoSuspension: motivo })
      setAviso(`Suspendiste la cuenta de ${cuenta.nombre}.`)
    } catch {
      setAviso('No pudimos suspender la cuenta. Revisa tu conexión e inténtalo de nuevo.')
    }
  }

  const reactivar = async (cuenta) => {
    try {
      await updateDoc(doc(db, 'usuarios', cuenta.id), { estado: 'activa', motivoSuspension: '' })
      setAviso(`Reactivaste la cuenta de ${cuenta.nombre}.`)
    } catch {
      setAviso('No pudimos reactivar la cuenta. Revisa tu conexión e inténtalo de nuevo.')
    }
  }

  if (cargando) {
    return (
      <p className="flex items-center gap-2 text-gray-700" aria-busy="true">
        <LuLoader className="h-5 w-5 animate-spin text-home-orange-600 motion-reduce:animate-none" aria-hidden="true" />
        Cargando cuentas…
      </p>
    )
  }

  if (errorCarga) {
    return <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{errorCarga}</p>
  }

  return (
    <section aria-label="Gestión de usuarios">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Pestanas
          etiqueta="Filtrar por rol"
          idPanel={ID_PANEL}
          activa={rol}
          onCambiar={setRol}
          opciones={[
            { valor: '', etiqueta: 'Todos', conteo: conteos.todos },
            { valor: 'estudiante', etiqueta: '2nd GUESTS', conteo: conteos.estudiante },
            { valor: 'arrendador', etiqueta: '2nd HOSTS', conteo: conteos.arrendador },
          ]}
        />

        <div role="search" className="relative lg:w-80">
          <label htmlFor="busqueda-usuarios" className="sr-only">
            Buscar por nombre o correo
          </label>
          <LuSearch
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-home-orange-500"
            aria-hidden="true"
          />
          <input
            id="busqueda-usuarios"
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o correo"
            className="h-11 w-full rounded-full border-2 border-home-orange-200 bg-white pl-12 pr-4 text-sm text-gray-900 placeholder:text-gray-500 focus:border-home-orange-500 focus:outline-none"
          />
        </div>
      </div>

      <div aria-live="polite">
        {aviso && (
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-home-orange-200 bg-home-orange-50 p-4 text-sm text-home-orange-900">
            <p className="flex-1">{aviso}</p>
            <button
              type="button"
              onClick={() => setAviso('')}
              aria-label="Cerrar aviso"
              className={`grid h-8 w-8 place-items-center rounded-full hover:bg-home-orange-100 ${ENFOQUE}`}
            >
              <LuX className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      <div id={ID_PANEL} role="tabpanel" aria-labelledby={`${ID_PANEL}-${rol || 'todos'}`} className="mt-6">
        {lista.length > 0 ? (
          <ul className="space-y-4">
            {lista.map((cuenta) => (
              <FilaUsuario
                key={cuenta.id}
                cuenta={cuenta}
                numPropiedades={propiedades.filter((p) => p.arrendador.id === cuenta.id).length}
                reportesAbiertos={reportesAbiertos.filter((r) => r.reportado?.id === cuenta.id).length}
                onSuspender={suspender}
                onReactivar={reactivar}
              />
            ))}
          </ul>
        ) : (
          <p className="rounded-3xl border-2 border-dashed border-home-orange-200 bg-white px-6 py-10 text-center text-sm text-gray-700">
            No hay cuentas que coincidan con la búsqueda.
          </p>
        )}
      </div>
    </section>
  )
}