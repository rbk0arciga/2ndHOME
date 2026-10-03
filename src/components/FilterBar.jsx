import { useEffect, useRef, useSyncExternalStore } from 'react'
import { LuX } from 'react-icons/lu'
import { COLONIAS, TIPOS_PROPIEDAD, formatoPrecio } from '../data/mockData'

const ENFOQUE =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-home-orange-500'

/* ---------- Detectar si la pantalla es de celular ---------- */
// Coincide con el breakpoint md de Tailwind (768px)
const CONSULTA_MOVIL = '(max-width: 767px)'

function suscribirACambiosDePantalla(callback) {
  const consulta = window.matchMedia(CONSULTA_MOVIL)
  consulta.addEventListener('change', callback)
  return () => consulta.removeEventListener('change', callback)
}

// Devuelve true en pantallas de celular y se actualiza si cambia el tamaño de la ventana
function useEsMovil() {
  return useSyncExternalStore(suscribirACambiosDePantalla, () => window.matchMedia(CONSULTA_MOVIL).matches)
}

/* ---------- Opciones de los filtros ---------- */
const OPCIONES_TIPO = { '': 'Todos', ...TIPOS_PROPIEDAD }

// Etiquetas pensadas desde quien busca (la lógica está en Home.jsx)
const OPCIONES_GENERO = {
  '': 'Cualquiera',
  mujeres: 'Mujeres',
  hombres: 'Hombres',
  mixto: 'Solo mixtos',
}

/* ---------- Grupo de opciones con forma de chip ---------- */
// Son radio buttons reales (accesibles con teclado y lectores de pantalla),
// ocultos visualmente con sr-only y estilizados a través de "peer".
function GrupoChips({ titulo, nombre, opciones, valor, onSeleccionar, ayuda }) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-gray-900">{titulo}</legend>
      {ayuda && <p className="mt-0.5 text-xs text-gray-600">{ayuda}</p>}
      <div className="mt-2 flex flex-wrap gap-2">
        {Object.entries(opciones).map(([clave, etiqueta]) => (
          <label key={clave || 'todos'} className="cursor-pointer">
            <input
              type="radio"
              name={nombre}
              value={clave}
              checked={valor === clave}
              onChange={() => onSeleccionar(clave)}
              className="peer sr-only"
            />
            <span className="block rounded-full border border-home-orange-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 transition-colors hover:border-home-orange-400 peer-checked:border-home-orange-700 peer-checked:bg-home-orange-700 peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-home-orange-500">
              {etiqueta}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

/* ---------- Campos de filtro (se comparten entre móvil y escritorio) ---------- */
function ContenidoFiltros({ filtros, cambiar, rangoPrecio }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Colonia */}
      <div>
        <label htmlFor="filtro-colonia" className="text-sm font-semibold text-gray-900">
          Colonia
        </label>
        <select
          id="filtro-colonia"
          value={filtros.colonia}
          onChange={(e) => cambiar('colonia', e.target.value)}
          className="mt-2 w-full rounded-xl border border-home-orange-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-home-orange-500 focus:outline-none"
        >
          <option value="">Todas las colonias</option>
          {COLONIAS.map((colonia) => (
            <option key={colonia} value={colonia}>
              {colonia}
            </option>
          ))}
        </select>
      </div>

      {/* Tipo de lugar */}
      <GrupoChips
        titulo="Tipo de lugar"
        nombre="filtro-tipo"
        opciones={OPCIONES_TIPO}
        valor={filtros.tipo}
        onSeleccionar={(valor) => cambiar('tipo', valor)}
      />

      {/* Género */}
      <GrupoChips
        titulo="Espacios para"
        nombre="filtro-genero"
        opciones={OPCIONES_GENERO}
        valor={filtros.genero}
        onSeleccionar={(valor) => cambiar('genero', valor)}
      />

      {/* Precio y servicios */}
      <div>
        <div className="flex items-baseline justify-between gap-2">
          <label htmlFor="filtro-precio" className="text-sm font-semibold text-gray-900">
            Renta máxima
          </label>
          <span className="text-sm font-semibold text-home-orange-800">
            {formatoPrecio(filtros.precioMax)}
          </span>
        </div>
        <input
          id="filtro-precio"
          type="range"
          min={rangoPrecio.min}
          max={rangoPrecio.max}
          step={100}
          value={filtros.precioMax}
          onChange={(e) => cambiar('precioMax', Number(e.target.value))}
          aria-valuetext={`Hasta ${formatoPrecio(filtros.precioMax)} al mes`}
          className="mt-3 w-full accent-home-orange-600"
        />
        <div className="mt-1 flex justify-between text-xs text-gray-600">
          <span>{formatoPrecio(rangoPrecio.min)}</span>
          <span>{formatoPrecio(rangoPrecio.max)}</span>
        </div>

        <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-gray-800">
          <input
            type="checkbox"
            checked={filtros.soloServiciosIncluidos}
            onChange={(e) => cambiar('soloServiciosIncluidos', e.target.checked)}
            className="h-4 w-4 accent-home-orange-600"
          />
          Solo con servicios incluidos
        </label>
      </div>
    </div>
  )
}

/* ---------- Botones del pie ---------- */
function PieFiltros({ onLimpiar, onCerrar, totalResultados }) {
  const textoBoton =
    totalResultados === 0
      ? 'Cerrar'
      : `Ver ${totalResultados} ${totalResultados === 1 ? 'lugar' : 'lugares'}`

  return (
    <div className="flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={onLimpiar}
        className={`rounded-full px-2 py-2.5 text-sm font-semibold text-home-orange-800 underline underline-offset-4 hover:text-home-orange-900 ${ENFOQUE}`}
      >
        Limpiar filtros
      </button>
      <button
        type="button"
        onClick={onCerrar}
        className={`rounded-full bg-home-orange-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-home-orange-800 ${ENFOQUE}`}
      >
        {textoBoton}
      </button>
    </div>
  )
}

/* ---------- Componente principal ---------- */
export default function FilterBar({
  id,
  abierto,
  onCerrar,
  filtros,
  onCambiar,
  onLimpiar,
  rangoPrecio,
  totalResultados,
}) {
  const esMovil = useEsMovil()
  const panelRef = useRef(null)

  // Actualiza un solo campo y conserva los demás filtros
  const cambiar = (campo, valor) => onCambiar({ ...filtros, [campo]: valor })

  // La tecla Escape cierra el panel
  useEffect(() => {
    if (!abierto) return
    const alPresionarTecla = (e) => {
      if (e.key === 'Escape') onCerrar()
    }
    document.addEventListener('keydown', alPresionarTecla)
    return () => document.removeEventListener('keydown', alPresionarTecla)
  }, [abierto, onCerrar])

  // En móvil: bloquea el scroll de la página de fondo y lleva el foco al panel
  useEffect(() => {
    if (!abierto || !esMovil) return
    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()
    return () => {
      document.body.style.overflow = overflowAnterior
    }
  }, [abierto, esMovil])

  if (!abierto) return null

  const contenido = <ContenidoFiltros filtros={filtros} cambiar={cambiar} rangoPrecio={rangoPrecio} />
  const pie = <PieFiltros onLimpiar={onLimpiar} onCerrar={onCerrar} totalResultados={totalResultados} />

  /* Móvil: hoja inferior que cubre la pantalla */
  if (esMovil) {
    return (
      <div className="fixed inset-0 z-50">
        {/* Fondo oscurecido: al tocarlo se cierra el panel */}
        <div className="absolute inset-0 bg-home-orange-900/40" onClick={onCerrar} aria-hidden="true" />

        <div
          id={id}
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${id}-titulo`}
          tabIndex={-1}
          className="absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col rounded-t-3xl bg-white focus:outline-none"
        >
          <div className="flex items-center justify-between border-b border-home-orange-100 px-5 py-4">
            <h2 id={`${id}-titulo`} className="text-lg font-bold text-gray-900">
              Filtros
            </h2>
            <button
              type="button"
              onClick={onCerrar}
              aria-label="Cerrar filtros"
              className={`grid h-9 w-9 place-items-center rounded-full bg-home-orange-100 text-home-orange-900 transition-colors hover:bg-home-orange-200 ${ENFOQUE}`}
            >
              <LuX className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Solo esta zona hace scroll; el encabezado y el pie quedan fijos */}
          <div className="flex-1 overflow-y-auto px-5 py-5">{contenido}</div>
          <div className="border-t border-home-orange-100 px-5 py-4">{pie}</div>
        </div>
      </div>
    )
  }

  /* Tablet y escritorio: panel dentro de la página */
  return (
    <section
      id={id}
      aria-labelledby={`${id}-titulo`}
      className="mt-4 rounded-3xl border border-home-orange-200 bg-white p-6"
    >
      <h2 id={`${id}-titulo`} className="sr-only">
        Filtros
      </h2>
      {contenido}
      <div className="mt-6 border-t border-home-orange-100 pt-4">{pie}</div>
    </section>
  )
}