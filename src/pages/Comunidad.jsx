import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore'
import { LuUsers, LuLoader, LuMessagesSquare } from 'react-icons/lu'
import FormularioPublicacion from '../components/comunidad/FormularioPublicacion'
import TarjetaPublicacion from '../components/comunidad/TarjetaPublicacion'
import { ENFOQUE } from '../components/comunidad/utilidades'
import { useSesion } from '../context/sesion'
import { db } from '../firebase/config'
import { CATEGORIAS_COMUNIDAD } from '../data/mockData'

// Número de publicaciones recientes que se cargan
const LIMITE_PUBLICACIONES = 30

/* ---------- Aviso para 2nd HOSTS ---------- */
function SoloParaGuests() {
  return (
    <main className="mx-auto max-w-xl px-4 py-16 text-center">
      <LuUsers className="mx-auto h-12 w-12 text-home-orange-400" aria-hidden="true" />
      <h1 className="mt-4 text-2xl font-bold text-gray-900">Comunidad es solo para 2nd GUESTS</h1>
      <p className="mt-2 text-gray-700">
        Es un espacio para que los estudiantes compartan avisos, recomendaciones y preguntas entre ellos.
      </p>
      <Link
        to="/"
        className={`mt-6 inline-block rounded-full bg-home-orange-700 px-6 py-3 font-semibold text-white transition-colors hover:bg-home-orange-800 ${ENFOQUE}`}
      >
        Ir a Alojamiento
      </Link>
    </main>
  )
}

/* ---------- Página ---------- */
export default function Comunidad() {
  const { usuario } = useSesion()
  const [publicaciones, setPublicaciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')
  const [categoria, setCategoria] = useState('') // '' = todas

  const puedeVer = usuario.rol === 'estudiante' || usuario.rol === 'admin'

  // Publicaciones más recientes, en tiempo real
  useEffect(() => {
    if (!puedeVer) return
    const consulta = query(collection(db, 'publicaciones'), orderBy('fecha', 'desc'), limit(LIMITE_PUBLICACIONES))
    return onSnapshot(
      consulta,
      (resultado) => {
        // 'estimate': las recién publicadas muestran la hora local mientras llega la del servidor
        setPublicaciones(resultado.docs.map((d) => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) })))
        setCargando(false)
      },
      (error) => {
        setErrorCarga(`No se pudo cargar la comunidad (${error.code}).`)
        setCargando(false)
      }
    )
  }, [puedeVer])

  if (!puedeVer) return <SoloParaGuests />

  const lista = categoria ? publicaciones.filter((p) => p.categoria === categoria) : publicaciones
  const filtros = [['', 'Todas'], ...Object.entries(CATEGORIAS_COMUNIDAD)]

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-6 md:px-8">
      <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Comunidad</h1>
      <p className="mt-1 text-gray-700">
        Un espacio solo para 2nd GUESTS: avisos, compra-venta, recomendaciones y preguntas sobre la vida cerca de
        CUCEI.
      </p>

      {usuario.rol === 'admin' && (
        <p className="mt-4 rounded-2xl bg-home-orange-50 p-3 text-sm text-home-orange-900">
          Estás viendo la comunidad como administrador: puedes eliminar publicaciones y comentarios, pero no publicar.
        </p>
      )}

      {usuario.rol === 'estudiante' && (
        <div className="mt-6">
          <FormularioPublicacion usuario={usuario} />
        </div>
      )}

      {/* Filtro por categoría */}
      <div role="group" aria-label="Filtrar por categoría" className="mt-8 flex flex-wrap gap-2">
        {filtros.map(([clave, etiqueta]) => {
          const activo = categoria === clave
          return (
            <button
              key={clave || 'todas'}
              type="button"
              aria-pressed={activo}
              onClick={() => setCategoria(clave)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${ENFOQUE} ${
                activo
                  ? 'border-home-orange-700 bg-home-orange-700 text-white'
                  : 'border-home-orange-200 bg-white text-gray-800 hover:border-home-orange-400'
              }`}
            >
              {etiqueta}
            </button>
          )
        })}
      </div>

      {/* Publicaciones */}
      <div className="mt-6">
        {cargando ? (
          <p className="flex items-center gap-2 text-gray-700" aria-busy="true">
            <LuLoader className="h-5 w-5 animate-spin text-home-orange-600 motion-reduce:animate-none" aria-hidden="true" />
            Cargando publicaciones…
          </p>
        ) : errorCarga ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{errorCarga}</p>
        ) : lista.length > 0 ? (
          <ul className="space-y-6">
            {lista.map((publicacion) => (
              <li key={publicacion.id}>
                <TarjetaPublicacion publicacion={publicacion} usuario={usuario} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-3xl border-2 border-dashed border-home-orange-200 bg-white px-6 py-12 text-center">
            <LuMessagesSquare className="mx-auto h-10 w-10 text-home-orange-300" aria-hidden="true" />
            <p className="mt-3 text-sm text-gray-700">
              {categoria ? 'Todavía no hay publicaciones en esta categoría.' : 'Todavía no hay publicaciones.'}
              {usuario.rol === 'estudiante' && ' ¡Comparte la primera!'}
            </p>
          </div>
        )}
      </div>
    </main>
  )
}