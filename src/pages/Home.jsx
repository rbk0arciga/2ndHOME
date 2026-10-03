import { useMemo, useState } from 'react'
import { LuSearch, LuSlidersHorizontal } from 'react-icons/lu'
import ConsejosBanner from '../components/ConsejosBanner'
import PropertyCard from '../components/PropertyCard'
import FilterBar from '../components/FilterBar'
import { propiedadesAprobadas } from '../data/mockData'

const ENFOQUE =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-home-orange-500'

// Rango de precios real del catálogo (lo usa el control de precio en los filtros)
const precios = propiedadesAprobadas.map((p) => p.precio)
const RANGO_PRECIO = { min: Math.min(...precios), max: Math.max(...precios) }

// Estado inicial de los filtros (sin ningún filtro aplicado)
const FILTROS_INICIALES = {
  colonia: '',
  tipo: '',
  genero: '',
  precioMax: RANGO_PRECIO.max,
  soloServiciosIncluidos: false,
}

// Opciones para ordenar los resultados
const ORDENES = {
  cercania: { etiqueta: 'Más cerca de CUCEI', comparar: (a, b) => a.distanciaKm - b.distanciaKm },
  precio: { etiqueta: 'Menor precio', comparar: (a, b) => a.precio - b.precio },
  calificacion: { etiqueta: 'Mejor calificadas', comparar: (a, b) => (b.calificacion ?? 0) - (a.calificacion ?? 0) },
}

// Quita acentos y mayúsculas: "olimpica" encuentra "Olímpica"
const normalizar = (texto) =>
  texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

// Cuenta los filtros activos (se muestra como número en el botón "Filtros")
function contarFiltrosActivos(filtros) {
  let total = 0
  if (filtros.colonia) total++
  if (filtros.tipo) total++
  if (filtros.genero) total++
  if (filtros.precioMax < RANGO_PRECIO.max) total++
  if (filtros.soloServiciosIncluidos) total++
  return total
}

// Decide si una propiedad cumple la búsqueda y los filtros
function cumpleFiltros(propiedad, textoBuscado, filtros) {
  if (textoBuscado && !normalizar(`${propiedad.titulo} ${propiedad.colonia}`).includes(textoBuscado)) return false
  if (filtros.colonia && propiedad.colonia !== filtros.colonia) return false
  if (filtros.tipo && propiedad.tipo !== filtros.tipo) return false
  if (propiedad.precio > filtros.precioMax) return false
  if (filtros.soloServiciosIncluidos && !propiedad.serviciosIncluidos) return false

  // Género: quien busca "mujeres" u "hombres" también ve los espacios mixtos,
  // porque también puede vivir ahí. "mixto" muestra solo los mixtos.
  if (filtros.genero === 'mixto' && propiedad.genero !== 'mixto') return false
  if (
    (filtros.genero === 'mujeres' || filtros.genero === 'hombres') &&
    propiedad.genero !== filtros.genero &&
    propiedad.genero !== 'mixto'
  ) {
    return false
  }

  return true
}

export default function Home() {
  const [busqueda, setBusqueda] = useState('')
  const [filtros, setFiltros] = useState(FILTROS_INICIALES)
  const [orden, setOrden] = useState('cercania')
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)

  // Recalcula los resultados solo cuando cambia la búsqueda, los filtros o el orden
  const resultados = useMemo(() => {
    const textoBuscado = normalizar(busqueda.trim())
    return propiedadesAprobadas
      .filter((p) => cumpleFiltros(p, textoBuscado, filtros))
      .sort(ORDENES[orden].comparar)
  }, [busqueda, filtros, orden])

  const filtrosActivos = contarFiltrosActivos(filtros)

  const limpiarTodo = () => {
    setFiltros(FILTROS_INICIALES)
    setBusqueda('')
  }

  return (
    <main className="pb-16">
      <ConsejosBanner />

      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <h1 className="mt-8 text-2xl font-bold leading-tight text-orange-900 md:mt-10 md:text-xl">
          Encuentra el lugar donde vas a sobrevivir al semestre
        </h1>

        {/* Búsqueda y botón de filtros */}
        <div className="mt-4 flex gap-3">
          <div role="search" className="relative flex-1">
            <label htmlFor="busqueda" className="sr-only">
              Buscar por colonia o nombre
            </label>
            <LuSearch
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-home-orange-500"
              aria-hidden="true"
            />
            <input
              id="busqueda"
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="¿Dónde buscamos? Prueba con una colonia"
              className="h-12 w-full rounded-full border-2 border-home-orange-300 bg-white pl-12 pr-4 text-sm text-gray-900 placeholder:text-gray-500 focus:border-home-orange-500 focus:outline-none md:h-14 md:text-base"
            />
          </div>

          <button
            type="button"
            onClick={() => setFiltrosAbiertos((valor) => !valor)}
            aria-expanded={filtrosAbiertos}
            aria-controls="panel-filtros"
            className={`flex h-12 shrink-0 items-center gap-2 rounded-full bg-home-orange-300 px-4 font-semibold text-home-orange-900 transition-colors hover:bg-home-orange-400 md:h-14 md:px-6 ${ENFOQUE}`}
          >
            <LuSlidersHorizontal className="h-5 w-5" aria-hidden="true" />
            {/* En móvil solo se ve el ícono, pero el texto sigue disponible para lectores de pantalla */}
            <span className="sr-only sm:not-sr-only">Filtros</span>
            {filtrosActivos > 0 && (
              <span className="grid h-6 min-w-6 place-items-center rounded-full bg-home-orange-700 px-1.5 text-xs text-white">
                {filtrosActivos}
              </span>
            )}
          </button>
        </div>

        {/* Panel de filtros: Home guarda el estado y FilterBar solo lo muestra y lo modifica */}
        <FilterBar
          id="panel-filtros"
          abierto={filtrosAbiertos}
          onCerrar={() => setFiltrosAbiertos(false)}
          filtros={filtros}
          onCambiar={setFiltros}
          onLimpiar={() => setFiltros(FILTROS_INICIALES)}
          rangoPrecio={RANGO_PRECIO}
          totalResultados={resultados.length}
        />

        {/* Encabezado de resultados */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          {/* aria-live: los lectores de pantalla anuncian el nuevo total al filtrar */}
          <p className="text-sm text-gray-700" aria-live="polite">
            <span className="font-semibold text-gray-900">{resultados.length}</span>{' '}
            {resultados.length === 1 ? 'lugar disponible' : 'lugares disponibles'}
          </p>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            Ordenar por
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              className="rounded-full border border-home-orange-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 focus:border-home-orange-500 focus:outline-none"
            >
              {Object.entries(ORDENES).map(([clave, { etiqueta }]) => (
                <option key={clave} value={clave}>
                  {etiqueta}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Catálogo: 1 columna en móvil, 2 en tablet, 3 en escritorio */}
        {resultados.length > 0 ? (
          <ul className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {resultados.map((propiedad) => (
              <li key={propiedad.id}>
                <PropertyCard propiedad={propiedad} />
              </li>
            ))}
          </ul>
        ) : (
          // Estado vacío: explica qué pasó y ofrece una salida
          <div className="mt-6 rounded-3xl border-2 border-dashed border-home-orange-200 bg-white px-6 py-12 text-center">
            <LuSearch className="mx-auto h-10 w-10 text-home-orange-400" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              No encontramos lugares con esos filtros
            </h2>
            <p className="mt-1 text-sm text-gray-700">Prueba con otra colonia o amplía tu presupuesto.</p>
            <button
              type="button"
              onClick={limpiarTodo}
              className={`mt-6 rounded-full bg-home-orange-700 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-home-orange-800 ${ENFOQUE}`}
            >
              Quitar filtros y búsqueda
            </button>
          </div>
        )}
      </div>
    </main>
  )
}