import { useId, useRef, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { LuCheck, LuX, LuEye, LuHouse, LuMapPin, LuUndo2, LuInbox } from 'react-icons/lu'
import Avatar from '../components/Avatar'
import { useSesion } from '../context/sesion'
import { usePropiedades } from '../context/propiedades'
import { TIPOS_PROPIEDAD, GENEROS, SERVICIOS, formatoPrecio, direccionCompleta } from '../data/mockData'

const ENFOQUE =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-home-orange-500'
const CLASE_BOTON_PRINCIPAL = `inline-flex items-center justify-center gap-2 rounded-full bg-home-orange-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-home-orange-800 ${ENFOQUE}`
const CLASE_BOTON_SECUNDARIO = `inline-flex items-center justify-center gap-2 rounded-full border-2 border-home-orange-700 px-4 py-1.5 text-sm font-semibold text-home-orange-800 transition-colors hover:bg-home-orange-50 ${ENFOQUE}`
const CLASE_BOTON_PELIGRO = `inline-flex items-center justify-center gap-2 rounded-full border-2 border-red-700 px-4 py-1.5 text-sm font-semibold text-red-800 transition-colors hover:bg-red-50 ${ENFOQUE}`
const CLASE_BOTON_PELIGRO_RELLENO = `inline-flex items-center justify-center gap-2 rounded-full bg-red-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-800 ${ENFOQUE}`

const PESTANAS = [
  { estado: 'pending', etiqueta: 'Pendientes' },
  { estado: 'approved', etiqueta: 'Aprobadas' },
  { estado: 'rejected', etiqueta: 'Rechazadas' },
]

const MENSAJE_VACIO = {
  pending: 'No hay propiedades por revisar. Las nuevas publicaciones de los 2nd HOSTS aparecerán aquí.',
  approved: 'Todavía no hay propiedades aprobadas.',
  rejected: 'No hay propiedades rechazadas.',
}

const LARGO_MINIMO_MOTIVO = 10

// "2026-09-29" → "29 de septiembre de 2026" (se arma por partes para evitar desfases de zona horaria)
function formatoFecha(fecha) {
  const [anio, mes, dia] = fecha.split('-').map(Number)
  return new Date(anio, mes - 1, dia).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
}

/* ==========================================================
   Pestañas accesibles (se recorren con las flechas izquierda/derecha)
   ========================================================== */
function Pestanas({ activa, onCambiar, conteos }) {
  const botonesRef = useRef([])

  const alPresionarTecla = (e, indice) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const paso = e.key === 'ArrowRight' ? 1 : -1
    const siguiente = (indice + paso + PESTANAS.length) % PESTANAS.length
    onCambiar(PESTANAS[siguiente].estado)
    botonesRef.current[siguiente]?.focus()
  }

  return (
    <div
      role="tablist"
      aria-label="Estado de revisión"
      className="flex gap-1 rounded-full border border-home-orange-200 bg-white p-1 sm:inline-flex"
    >
      {PESTANAS.map(({ estado, etiqueta }, indice) => {
        const seleccionada = activa === estado
        return (
          <button
            key={estado}
            ref={(elemento) => {
              botonesRef.current[indice] = elemento
            }}
            type="button"
            role="tab"
            id={`pestana-${estado}`}
            aria-selected={seleccionada}
            aria-controls="panel-revision"
            // Solo la pestaña activa entra en el recorrido con Tab; las demás, con flechas
            tabIndex={seleccionada ? 0 : -1}
            onClick={() => onCambiar(estado)}
            onKeyDown={(e) => alPresionarTecla(e, indice)}
            className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold transition-colors sm:flex-none sm:px-4 ${ENFOQUE} ${
              seleccionada ? 'bg-home-orange-700 text-white' : 'text-home-orange-900 hover:bg-home-orange-100'
            }`}
          >
            {etiqueta}
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                seleccionada ? 'bg-white/20 text-white' : 'bg-home-orange-100 text-home-orange-900'
              }`}
            >
              {conteos[estado]}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/* ==========================================================
   Tarjeta de revisión de una propiedad
   ========================================================== */
function FotoPortada({ src, titulo }) {
  const [fallo, setFallo] = useState(false)

  if (!src || fallo) {
    return (
      <div className="grid h-full w-full place-items-center">
        <LuHouse className="h-12 w-12 text-home-orange-300" aria-hidden="true" />
      </div>
    )
  }

  return <img src={src} alt={`Foto de ${titulo}`} onError={() => setFallo(true)} className="h-full w-full object-cover" />
}

function FormularioRechazo({ onConfirmar, onCancelar }) {
  const [motivo, setMotivo] = useState('')
  const [error, setError] = useState('')
  const idMotivo = useId()

  const alConfirmar = (e) => {
    e.preventDefault()
    if (motivo.trim().length < LARGO_MINIMO_MOTIVO) {
      setError(`Escribe el motivo para que el 2nd HOST pueda corregirlo (al menos ${LARGO_MINIMO_MOTIVO} caracteres).`)
      return
    }
    onConfirmar(motivo.trim())
  }

  return (
    <form onSubmit={alConfirmar} noValidate className="mt-auto space-y-3 rounded-2xl bg-red-50 p-4">
      <div>
        <label htmlFor={idMotivo} className="block text-sm font-semibold text-gray-900">
          Motivo del rechazo
        </label>
        <p className="mt-0.5 text-xs text-gray-700">El 2nd HOST lo verá en su perfil para poder corregir la publicación.</p>
      </div>
      <textarea
        id={idMotivo}
        rows={3}
        autoFocus
        value={motivo}
        onChange={(e) => {
          setMotivo(e.target.value)
          if (error) setError('')
        }}
        placeholder="Ej. Las fotos no muestran la habitación que se renta."
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${idMotivo}-error` : undefined}
        className={`w-full resize-y rounded-xl border-2 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none ${
          error ? 'border-red-600 focus:border-red-700' : 'border-red-200 focus:border-red-500'
        }`}
      />
      {error && (
        <p id={`${idMotivo}-error`} className="text-sm font-medium text-red-700">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <button type="submit" className={CLASE_BOTON_PELIGRO_RELLENO}>
          Confirmar rechazo
        </button>
        <button type="button" onClick={onCancelar} className={CLASE_BOTON_SECUNDARIO}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

function TarjetaRevision({ propiedad, onCambiarEstado }) {
  const [rechazando, setRechazando] = useState(false)
  const { id, titulo, tipo, imagenes, precio, genero, servicios, estado, arrendador, fechaPublicacion, motivoRechazo } =
    propiedad

  return (
    <li className="overflow-hidden rounded-3xl border border-home-orange-200 bg-white md:flex">
      {/* Portada con el número de fotos */}
      <div className="relative aspect-4/3 bg-home-orange-100 md:aspect-auto md:w-64 md:shrink-0">
        <FotoPortada src={imagenes?.[0]} titulo={titulo} />
        <span className="absolute bottom-3 left-3 rounded-full bg-gray-900/75 px-2.5 py-1 text-xs font-semibold text-white">
          {imagenes.length} {imagenes.length === 1 ? 'foto' : 'fotos'}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-600">{TIPOS_PROPIEDAD[tipo]}</p>
            <h3 className="mt-0.5 text-lg font-semibold leading-snug text-gray-900">{titulo}</h3>
            <p className="mt-1 flex items-start gap-1.5 text-sm text-gray-700">
              <LuMapPin className="mt-0.5 h-4 w-4 shrink-0 text-home-orange-600" aria-hidden="true" />
              {direccionCompleta(propiedad)}
            </p>
          </div>
          <p className="shrink-0">
            <span className="text-xl font-bold text-home-orange-800">{formatoPrecio(precio)}</span>
            <span className="text-sm text-gray-600"> al mes</span>
          </p>
        </div>

        {/* Datos para decidir */}
        <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-gray-600">2nd HOST</dt>
            <dd className="mt-0.5 flex items-center gap-2 font-medium text-gray-900">
              <Avatar src={arrendador.avatar} nombre={arrendador.nombre} tamano="sm" />
              {arrendador.nombre}
            </dd>
          </div>
          <div>
            <dt className="text-gray-600">Espacios para</dt>
            <dd className="mt-0.5 font-medium text-gray-900">{GENEROS[genero]}</dd>
          </div>
          <div>
            <dt className="text-gray-600">Servicios incluidos</dt>
            <dd className="mt-0.5 font-medium text-gray-900">
              {servicios.length > 0 ? servicios.map((clave) => SERVICIOS[clave]).join(', ') : 'Ninguno'}
            </dd>
          </div>
          <div>
            <dt className="text-gray-600">Enviada</dt>
            <dd className="mt-0.5 font-medium text-gray-900">{formatoFecha(fechaPublicacion)}</dd>
          </div>
        </dl>

        {estado === 'rejected' && motivoRechazo && (
          <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800">
            <span className="font-semibold">Motivo del rechazo:</span> {motivoRechazo}
          </p>
        )}

        {/* Acciones según el estado */}
        {rechazando ? (
          <FormularioRechazo
            onConfirmar={(motivo) => onCambiarEstado(propiedad, 'rejected', motivo)}
            onCancelar={() => setRechazando(false)}
          />
        ) : (
          <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-home-orange-100 pt-4">
            <Link to={`/propiedad/${id}`} className={CLASE_BOTON_SECUNDARIO}>
              <LuEye className="h-4 w-4" aria-hidden="true" />
              Vista previa
            </Link>
            {estado !== 'approved' && (
              <button type="button" onClick={() => onCambiarEstado(propiedad, 'approved')} className={CLASE_BOTON_PRINCIPAL}>
                <LuCheck className="h-4 w-4" aria-hidden="true" />
                Aprobar
              </button>
            )}
            {estado !== 'rejected' && (
              <button type="button" onClick={() => setRechazando(true)} className={CLASE_BOTON_PELIGRO}>
                <LuX className="h-4 w-4" aria-hidden="true" />
                {estado === 'approved' ? 'Retirar del catálogo' : 'Rechazar'}
              </button>
            )}
          </div>
        )}
      </div>
    </li>
  )
}

/* ==========================================================
   Página
   ========================================================== */
export default function PanelAdmin() {
  const { usuario } = useSesion()
  const { propiedades, cambiarEstado } = usePropiedades()
  const [pestana, setPestana] = useState('pending')
  // Último aviso: { texto, deshacer? } donde deshacer guarda el estado anterior
  const [aviso, setAviso] = useState(null)

  // Esta página es solo para el administrador
  if (usuario.rol !== 'admin') return <Navigate to="/" replace />

  const conteos = { pending: 0, approved: 0, rejected: 0 }
  propiedades.forEach((p) => {
    conteos[p.estado] += 1
  })

  // Pendientes: la más antigua primero (orden de llegada). Las demás: la más reciente primero.
  const lista = propiedades
    .filter((p) => p.estado === pestana)
    .sort((a, b) =>
      pestana === 'pending'
        ? a.fechaPublicacion.localeCompare(b.fechaPublicacion)
        : b.fechaPublicacion.localeCompare(a.fechaPublicacion)
    )

  const aplicarCambio = (propiedad, nuevoEstado, motivo = '') => {
    cambiarEstado(propiedad.id, nuevoEstado, motivo)

    let texto = `Rechazaste "${propiedad.titulo}". El 2nd HOST verá el motivo en su perfil.`
    if (nuevoEstado === 'approved') {
      texto = propiedad.disponible
        ? `Aprobaste "${propiedad.titulo}". Ya aparece en el catálogo.`
        : `Aprobaste "${propiedad.titulo}". Aparecerá en el catálogo cuando el 2nd HOST la marque como disponible.`
    }

    setAviso({
      texto,
      deshacer: { id: propiedad.id, estado: propiedad.estado, motivo: propiedad.motivoRechazo ?? '' },
    })
  }

  const deshacer = () => {
    const { id, estado, motivo } = aviso.deshacer
    cambiarEstado(id, estado, motivo)
    setAviso({ texto: 'Se deshizo el último cambio.' })
  }

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-6 md:px-8">
      <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Panel de administración</h1>
      <p className="mt-1 text-gray-700">Revisa cada propiedad antes de que aparezca en el catálogo.</p>

      <div className="mt-6">
        <Pestanas activa={pestana} onCambiar={setPestana} conteos={conteos} />
      </div>

      {/* Aviso de la última acción, con opción de deshacer */}
      <div aria-live="polite">
        {aviso && (
          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-home-orange-200 bg-home-orange-50 p-4 text-sm text-home-orange-900">
            <p className="flex-1">{aviso.texto}</p>
            {aviso.deshacer && (
              <button
                type="button"
                onClick={deshacer}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-semibold text-home-orange-800 hover:bg-home-orange-100 ${ENFOQUE}`}
              >
                <LuUndo2 className="h-4 w-4" aria-hidden="true" />
                Deshacer
              </button>
            )}
            <button
              type="button"
              onClick={() => setAviso(null)}
              aria-label="Cerrar aviso"
              className={`grid h-8 w-8 place-items-center rounded-full hover:bg-home-orange-100 ${ENFOQUE}`}
            >
              <LuX className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {/* Contenido de la pestaña activa */}
      <div id="panel-revision" role="tabpanel" aria-labelledby={`pestana-${pestana}`} className="mt-6">
        {lista.length > 0 ? (
          <ul className="space-y-5">
            {lista.map((propiedad) => (
              <TarjetaRevision key={propiedad.id} propiedad={propiedad} onCambiarEstado={aplicarCambio} />
            ))}
          </ul>
        ) : (
          <div className="rounded-3xl border-2 border-dashed border-home-orange-200 bg-white px-6 py-12 text-center">
            <LuInbox className="mx-auto h-10 w-10 text-home-orange-300" aria-hidden="true" />
            <p className="mt-3 text-sm text-gray-700">{MENSAJE_VACIO[pestana]}</p>
          </div>
        )}
      </div>
    </main>
  )
}