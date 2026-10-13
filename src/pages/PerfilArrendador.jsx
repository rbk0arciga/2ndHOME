import { useId, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { LuHouse, LuPlus, LuPencil } from 'react-icons/lu'
import { FaStar } from 'react-icons/fa'
import Avatar from '../components/Avatar'
import PropertyCard from '../components/PropertyCard'
import CampoFormulario from '../components/CampoFormulario'
import FormularioPropiedad from '../components/FormularioPropiedad'
import { useSesion } from '../context/sesion'
import { usuarios, resenas, ESTADOS_REVISION, formatoPrecio } from '../data/mockData'
import { usePropiedades } from '../context/propiedades'

const ENFOQUE =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-home-orange-500'
const CLASE_BOTON_PRINCIPAL = `inline-flex items-center justify-center gap-2 rounded-full bg-home-orange-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-home-orange-800 ${ENFOQUE}`
const CLASE_BOTON_SECUNDARIO = `inline-flex items-center justify-center gap-2 rounded-full border-2 border-home-orange-700 px-5 py-2 text-sm font-semibold text-home-orange-800 transition-colors hover:bg-home-orange-50 ${ENFOQUE}`
const CLASE_ENLACE = `rounded font-semibold text-home-orange-800 underline underline-offset-2 hover:text-home-orange-900 ${ENFOQUE}`

// Colores de cada estado de revisión
const ESTILO_ESTADO = {
  approved: 'border-green-200 bg-green-50 text-green-800',
  pending: 'border-home-orange-200 bg-home-orange-50 text-home-orange-900',
  rejected: 'border-red-200 bg-red-50 text-red-800',
}

const NOTA_ESTADO = {
  pending: 'En revisión por el equipo de 2nd HOME.',
  rejected: 'No fue aprobada. Revisa los datos y vuelve a enviarla.',
}

/* ==========================================================
   Utilidades
   ========================================================== */
const primerNombre = (nombre) => nombre.split(' ')[0]

// "2024-09" → "2 años" (tiempo desde esa fecha hasta hoy)
function tiempoComoAnfitrion(anioMes) {
  const [anio, mes] = anioMes.split('-').map(Number)
  const hoy = new Date()
  const meses = (hoy.getFullYear() - anio) * 12 + (hoy.getMonth() + 1 - mes)
  if (meses < 1) return 'Menos de un mes'
  if (meses < 12) return `${meses} ${meses === 1 ? 'mes' : 'meses'}`
  const anios = Math.floor(meses / 12)
  return `${anios} ${anios === 1 ? 'año' : 'años'}`
}

// Busca los datos del 2nd HOST. Si no tiene cuenta de ejemplo en mockData,
// usa los datos básicos que vienen copiados en sus propiedades.
function obtenerAnfitrion(id, listaPropiedades) {
  const cuenta = usuarios.find((u) => u.id === id && u.rol === 'arrendador')
  if (cuenta) return cuenta
  const propiedad = listaPropiedades.find((p) => p.arrendador.id === id)
  return propiedad ? propiedad.arrendador : null
}

/* ==========================================================
   Encabezado con los datos del 2nd HOST
   ========================================================== */
function EncabezadoAnfitrion({ anfitrion, perfil, esPropio, onEditar }) {
  // Solo se muestran los datos que existen
  const datos = [
    perfil.profesion && ['Profesión', perfil.profesion],
    perfil.edad && ['Edad', `${perfil.edad} años`],
    perfil.pasatiempo && ['Pasatiempo', perfil.pasatiempo],
    anfitrion.anfitrionDesde && ['Tiempo como 2nd HOST', tiempoComoAnfitrion(anfitrion.anfitrionDesde)],
  ].filter(Boolean)

  return (
    <section aria-labelledby="titulo-anfitrion" className="rounded-3xl border border-home-orange-200 bg-white p-6 md:p-8">
      <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:text-left">
        <Avatar src={anfitrion.avatar} nombre={anfitrion.nombre} tamano="xl" />

        <div className="min-w-0 flex-1">
          <p className="inline-block rounded-full bg-home-orange-100 px-3 py-1 text-xs font-semibold text-home-orange-900">
            2nd HOST
          </p>
          <h1 id="titulo-anfitrion" className="mt-2 text-2xl font-bold leading-tight text-gray-900 md:text-3xl">
            {esPropio ? anfitrion.nombre : `Conoce a ${anfitrion.nombre}`}
          </h1>
          {esPropio && <p className="mt-1 text-sm text-gray-600">Así ven tu perfil los 2nd GUESTS.</p>}

          {datos.length > 0 && (
            <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              {datos.map(([titulo, valor]) => (
                <div key={titulo}>
                  <dt className="font-semibold text-gray-900">{titulo}</dt>
                  <dd className="text-gray-700">{valor}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        {esPropio && (
          <button type="button" onClick={onEditar} className={`${CLASE_BOTON_SECUNDARIO} shrink-0`}>
            <LuPencil className="h-4 w-4" aria-hidden="true" />
            Editar perfil
          </button>
        )}
      </div>

      {perfil.bio && (
        <blockquote className="mt-6 border-l-4 border-home-orange-300 pl-4 leading-relaxed text-gray-800">
          {perfil.bio}
        </blockquote>
      )}
    </section>
  )
}

/* ==========================================================
   Formulario para editar el perfil del 2nd HOST
   ========================================================== */
function FormularioPerfilAnfitrion({ perfil, onGuardar, onCancelar }) {
  const [datos, setDatos] = useState(perfil)
  const [errores, setErrores] = useState({})
  const idBio = useId()

  const actualizar = (campo, valor) => {
    setDatos((prev) => ({ ...prev, [campo]: valor }))
    if (errores[campo]) setErrores((prev) => ({ ...prev, [campo]: undefined }))
  }

  const alGuardar = (e) => {
    e.preventDefault()
    const nuevosErrores = {}
    if (datos.edad !== '') {
      const edad = Number(datos.edad)
      if (!Number.isInteger(edad) || edad < 18 || edad > 99) {
        nuevosErrores.edad = 'Escribe una edad entre 18 y 99, o déjala vacía.'
      }
    }
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    // MAQUETA: con Firebase aquí se actualizará el documento del usuario en Firestore
    onGuardar({
      profesion: datos.profesion.trim(),
      edad: datos.edad === '' ? '' : Number(datos.edad),
      pasatiempo: datos.pasatiempo.trim(),
      bio: datos.bio.trim(),
    })
  }

  return (
    <section aria-labelledby="titulo-editar" className="rounded-3xl border border-home-orange-200 bg-white p-6 md:p-8">
      <h1 id="titulo-editar" className="text-xl font-bold text-gray-900">
        Editar perfil
      </h1>
      <p className="mt-1 text-sm text-gray-700">Esta información la ven los 2nd GUESTS en tu perfil.</p>

      <form onSubmit={alGuardar} noValidate className="mt-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <CampoFormulario
            etiqueta="Profesión"
            placeholder="Ej. Docente de secundaria"
            value={datos.profesion}
            onChange={(e) => actualizar('profesion', e.target.value)}
          />
          <CampoFormulario
            etiqueta="Edad"
            type="number"
            inputMode="numeric"
            min={18}
            max={99}
            value={datos.edad}
            onChange={(e) => actualizar('edad', e.target.value)}
            error={errores.edad}
          />
          <CampoFormulario
            etiqueta="Pasatiempo"
            placeholder="Ej. La jardinería"
            value={datos.pasatiempo}
            onChange={(e) => actualizar('pasatiempo', e.target.value)}
          />
        </div>

        <div>
          <label htmlFor={idBio} className="text-sm font-semibold text-gray-900">
            Presentación
          </label>
          <textarea
            id={idBio}
            rows={5}
            value={datos.bio}
            onChange={(e) => actualizar('bio', e.target.value)}
            placeholder="Cuéntales a los 2nd GUESTS cómo es vivir en tu casa."
            className="mt-1.5 w-full resize-y rounded-xl border-2 border-home-orange-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:border-home-orange-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button type="submit" className={CLASE_BOTON_PRINCIPAL}>
            Guardar cambios
          </button>
          <button type="button" onClick={onCancelar} className={CLASE_BOTON_SECUNDARIO}>
            Cancelar
          </button>
        </div>
      </form>
    </section>
  )
}

/* ==========================================================
   "Lo que se dice en los pasillos": reseñas de sus espacios
   ========================================================== */
function Estrellas({ valor }) {
  return (
    <span className="flex" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <FaStar key={n} className={`h-3.5 w-3.5 ${n <= valor ? 'text-home-orange-400' : 'text-home-orange-200'}`} />
      ))}
    </span>
  )
}

function PanelResenas({ propiedadesPublicas }) {
  const ids = propiedadesPublicas.map((p) => p.id)
  const lista = resenas.filter((r) => ids.includes(r.propiedadId)).slice(0, 3)

  // Promedio ponderado: cada propiedad pesa según su número de reseñas
  const conResenas = propiedadesPublicas.filter((p) => p.calificacion)
  const total = conResenas.reduce((suma, p) => suma + p.numResenas, 0)
  const promedio = total
    ? conResenas.reduce((suma, p) => suma + p.calificacion * p.numResenas, 0) / total
    : null

  return (
    <section aria-labelledby="titulo-pasillos" className="rounded-3xl bg-home-orange-100 p-6">
      <h2 id="titulo-pasillos" className="text-lg font-bold text-home-orange-900">
        Lo que se dice en los pasillos
      </h2>
      {promedio && (
        <p className="mt-1 flex items-center gap-1 text-sm">
          <FaStar className="h-4 w-4 text-home-orange-500" aria-hidden="true" />
          <span className="font-semibold text-gray-900">{promedio.toFixed(1)}</span>
          <span className="text-gray-700">
            de 5, {total} {total === 1 ? 'reseña' : 'reseñas'} en sus espacios
          </span>
        </p>
      )}

      {lista.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {lista.map((resena) => {
            const propiedad = propiedadesPublicas.find((p) => p.id === resena.propiedadId)
            return (
              <li key={resena.id} className="rounded-2xl bg-white p-4">
                <div className="flex items-center gap-3">
                  <Avatar src={resena.avatar} nombre={resena.autorNombre} />
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900">{resena.autorNombre}</p>
                    <p className="text-xs text-gray-600">{resena.autorCarrera}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <Estrellas valor={resena.calificacion} />
                  <span className="sr-only">{resena.calificacion} de 5 estrellas</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-gray-800">{resena.comentario}</p>
                {propiedad && (
                  <p className="mt-2 text-xs text-gray-600">
                    Vivió en:{' '}
                    <Link to={`/propiedad/${propiedad.id}`} className={CLASE_ENLACE}>
                      {propiedad.titulo}
                    </Link>
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="mt-4 rounded-2xl bg-white p-4 text-sm text-gray-700">Aún no hay reseñas de sus espacios.</p>
      )}
    </section>
  )
}

/* ==========================================================
   Vista pública: sus espacios publicados
   ========================================================== */
function SeccionEspacios({ nombre, propiedadesPublicas }) {
  return (
    <section aria-labelledby="titulo-espacios" className="mt-12">
      <h2 id="titulo-espacios" className="text-xl font-bold text-gray-900">
        Espacios de {primerNombre(nombre)}
      </h2>
      {propiedadesPublicas.length > 0 ? (
        <ul className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {propiedadesPublicas.map((propiedad) => (
            <li key={propiedad.id}>
              <PropertyCard propiedad={propiedad} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 rounded-3xl border border-home-orange-100 bg-white p-6 text-sm text-gray-700">
          Por ahora no tiene espacios publicados.
        </p>
      )}
    </section>
  )
}

/* ==========================================================
   Vista propia: gestión de propiedades
   ========================================================== */
function FotoMiniatura({ src, titulo }) {
  const [fallo, setFallo] = useState(false)

  if (!src || fallo) {
    return (
      <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-home-orange-100">
        <LuHouse className="h-8 w-8 text-home-orange-300" aria-hidden="true" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={`Foto de ${titulo}`}
      onError={() => setFallo(true)}
      className="h-20 w-20 shrink-0 rounded-2xl object-cover"
    />
  )
}

// Interruptor accesible (role="switch") para activar o pausar la disponibilidad
function InterruptorDisponibilidad({ idEtiqueta, activo, onCambiar }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      aria-labelledby={idEtiqueta}
      onClick={onCambiar}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        activo ? 'bg-home-orange-700' : 'bg-gray-300'
      } ${ENFOQUE}`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform motion-reduce:transition-none ${
          activo ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

function ItemGestion({ propiedad, onCambiarDisponibilidad }) {
  const { id, titulo, imagenes, precio, estado, disponible } = propiedad
  const esNueva = id.startsWith('nueva-') // Las recién publicadas aún no tienen página de detalle
  const idEtiqueta = `disponibilidad-${id}`

  return (
    <li className="flex flex-col gap-4 rounded-3xl border border-home-orange-200 bg-white p-5 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 gap-4">
        <FotoMiniatura src={imagenes?.[0]} titulo={titulo} />
        <div className="min-w-0">
          <h3 className="font-semibold leading-snug text-gray-900">{titulo}</h3>
          <p className="mt-0.5 text-sm text-gray-700">
            <span className="font-semibold text-home-orange-800">{formatoPrecio(precio)}</span> al mes
          </p>
          <p className="mt-2 flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${ESTILO_ESTADO[estado]}`}>
              {ESTADOS_REVISION[estado]}
            </span>
            {NOTA_ESTADO[estado] && <span className="text-xs text-gray-600">{NOTA_ESTADO[estado]}</span>}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-home-orange-100 pt-4 sm:border-t-0 sm:pt-0">
        {/* La disponibilidad solo se gestiona en propiedades aprobadas */}
        {estado === 'approved' && (
          <div className="flex items-center gap-2">
            <InterruptorDisponibilidad
              idEtiqueta={idEtiqueta}
              activo={disponible}
              onCambiar={() => onCambiarDisponibilidad(id)}
            />
            <span id={idEtiqueta} className="text-sm text-gray-800">
              {disponible ? 'Disponible' : 'No disponible'}
            </span>
          </div>
        )}
        {!esNueva && (
          <Link to={`/propiedad/${id}`} className={`text-sm ${CLASE_ENLACE}`}>
            Ver publicación
          </Link>
        )}
      </div>
    </li>
  )
}

function SeccionGestion({ propiedadesAnfitrion, onCambiarDisponibilidad }) {
  return (
    <section aria-labelledby="titulo-gestion" className="mt-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="titulo-gestion" className="text-xl font-bold text-gray-900">
            Mis propiedades
          </h2>
          <p className="mt-1 text-sm text-gray-700">Activa o pausa cada espacio según tengas lugares disponibles.</p>
        </div>
        <a href="#publicar" className={CLASE_BOTON_PRINCIPAL}>
          <LuPlus className="h-4 w-4" aria-hidden="true" />
          Publicar nueva propiedad
        </a>
      </div>

      {propiedadesAnfitrion.length > 0 ? (
        <ul className="mt-4 space-y-4">
          {propiedadesAnfitrion.map((propiedad) => (
            <ItemGestion
              key={propiedad.id}
              propiedad={propiedad}
              onCambiarDisponibilidad={onCambiarDisponibilidad}
            />
          ))}
        </ul>
      ) : (
        <p className="mt-4 rounded-3xl border-2 border-dashed border-home-orange-200 bg-white p-6 text-sm text-gray-700">
          Todavía no tienes propiedades. Publica la primera con el formulario de abajo.
        </p>
      )}
    </section>
  )
}

/* ==========================================================
   No encontrado
   ========================================================== */
function AnfitrionNoEncontrado() {
  return (
    <main className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-gray-900">No encontramos a este 2nd HOST</h1>
      <p className="mt-2 text-gray-700">Puede que el enlace tenga un error.</p>
      <Link to="/" className={`${CLASE_BOTON_PRINCIPAL} mt-6`}>
        Ver lugares disponibles
      </Link>
    </main>
  )
}

/* ==========================================================
   Vista completa del perfil
   ========================================================== */
function VistaPerfil({ idAnfitrion, esPropio }) {
  // Propiedades compartidas: los cambios aquí se reflejan en el catálogo
  const { propiedades, cambiarDisponibilidad, agregarPropiedad } = usePropiedades()
  const anfitrion = obtenerAnfitrion(idAnfitrion, propiedades)

  // MAQUETA: el perfil editado vive solo en esta página. Con Firebase se guardará en Firestore.
  const [perfil, setPerfil] = useState(() => ({
    profesion: anfitrion?.profesion ?? '',
    edad: anfitrion?.edad ?? '',
    pasatiempo: anfitrion?.pasatiempo ?? '',
    bio: anfitrion?.bio ?? '',
  }))
  const [editando, setEditando] = useState(false)

  if (!anfitrion) return <AnfitrionNoEncontrado />

  const propiedadesAnfitrion = propiedades.filter((p) => p.arrendador.id === idAnfitrion)
  const propiedadesPublicas = propiedadesAnfitrion.filter((p) => p.estado === 'approved')
  // En el perfil público solo se muestran los espacios con lugares disponibles, igual que en el catálogo
  const espaciosVisibles = propiedadesPublicas.filter((p) => p.disponible)

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-6 md:px-8">
      {/* items-start: cada recuadro mide lo que necesita su contenido */}
      <div className="grid items-start gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          {editando ? (
            <FormularioPerfilAnfitrion
              perfil={perfil}
              onGuardar={(nuevoPerfil) => {
                setPerfil(nuevoPerfil)
                setEditando(false)
              }}
              onCancelar={() => setEditando(false)}
            />
          ) : (
            <EncabezadoAnfitrion
              anfitrion={anfitrion}
              perfil={perfil}
              esPropio={esPropio}
              onEditar={() => setEditando(true)}
            />
          )}
        </div>
        <div className="lg:col-span-5">
          <PanelResenas propiedadesPublicas={propiedadesPublicas} />
        </div>
      </div>

      {esPropio ? (
        <>
          <SeccionGestion
            propiedadesAnfitrion={propiedadesAnfitrion}
            onCambiarDisponibilidad={cambiarDisponibilidad}
          />
          <FormularioPropiedad
            arrendador={{ id: anfitrion.id, nombre: anfitrion.nombre, avatar: anfitrion.avatar }}
            onPublicar={agregarPropiedad}
          />
        </>
      ) : (
        <SeccionEspacios nombre={anfitrion.nombre} propiedadesPublicas={espaciosVisibles} />
      )}
    </main>
  )
}

/* ==========================================================
   Página
   ========================================================== */
export default function PerfilArrendador() {
  const { id } = useParams()
  const { usuario } = useSesion()

  // /perfil-arrendador (sin ID) es el perfil propio: solo para 2nd HOSTS
  if (!id && usuario.rol !== 'arrendador') return <Navigate to="/" replace />

  const idAnfitrion = id ?? usuario.id

  // key: si se navega de un perfil a otro, la vista se reinicia con los datos correctos
  return <VistaPerfil key={idAnfitrion} idAnfitrion={idAnfitrion} esPropio={idAnfitrion === usuario.id} />
}