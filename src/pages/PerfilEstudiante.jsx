import { useId, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { LuPencil, LuMapPin, LuGraduationCap, LuCalendar, LuHouse, LuHeart, LuMail } from 'react-icons/lu'
import { FaStar } from 'react-icons/fa'
import Avatar from '../components/Avatar'
import PropertyCard from '../components/PropertyCard'
import CampoFormulario from '../components/CampoFormulario'
import { useSesion } from '../context/sesion'
import { obtenerPropiedad, resenas } from '../data/mockData'
import { usePropiedades } from '../context/propiedades'

const ENFOQUE =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-home-orange-500'
const CLASE_BOTON_PRINCIPAL = `inline-flex items-center justify-center gap-2 rounded-full bg-home-orange-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-home-orange-800 ${ENFOQUE}`
const CLASE_BOTON_SECUNDARIO = `inline-flex items-center justify-center gap-2 rounded-full border-2 border-home-orange-700 px-5 py-2 text-sm font-semibold text-home-orange-800 transition-colors hover:bg-home-orange-50 ${ENFOQUE}`

const LARGO_MINIMO_RESENA = 20

/* ==========================================================
   Utilidades de fecha
   ========================================================== */
// "2025-08" → "ago 2025" (se arma por partes para evitar desfases de zona horaria)
function formatoMesCorto(anioMes) {
  const [anio, mes] = anioMes.split('-').map(Number)
  return new Date(anio, mes - 1, 1).toLocaleDateString('es-MX', { month: 'short', year: 'numeric' })
}

// "2026-06-20" → "junio de 2026"
function formatoMesLargo(fecha) {
  const [anio, mes] = fecha.split('-').map(Number)
  return new Date(anio, mes - 1, 1).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
}

// Fecha de hoy como "2026-10-12", en hora local
function hoyComoTexto() {
  const hoy = new Date()
  const mes = String(hoy.getMonth() + 1).padStart(2, '0')
  const dia = String(hoy.getDate()).padStart(2, '0')
  return `${hoy.getFullYear()}-${mes}-${dia}`
}

/* ==========================================================
   Estrellas (solo lectura)
   ========================================================== */
function Estrellas({ valor }) {
  return (
    <span className="flex" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <FaStar key={n} className={`h-4 w-4 ${n <= valor ? 'text-home-orange-400' : 'text-home-orange-100'}`} />
      ))}
    </span>
  )
}

/* ==========================================================
   Tarjeta del perfil
   ========================================================== */
function TarjetaPerfil({ usuario, perfil, onEditar }) {
  const datos = [
    { Icono: LuGraduationCap, texto: `${perfil.carrera}, ${perfil.semestre}.º semestre` },
    { Icono: LuMapPin, texto: `Viene de ${perfil.origen}` },
    { Icono: LuCalendar, texto: `En 2nd HOME desde ${formatoMesCorto(usuario.miembroDesde)}` },
    { Icono: LuMail, texto: usuario.correo },
  ]

  return (
    <section aria-labelledby="titulo-perfil" className="rounded-3xl border border-home-orange-200 bg-white p-6">
      <div className="flex flex-col items-center text-center">
        <Avatar src={usuario.avatar} nombre={usuario.nombre} tamano="xl" />
        <h1 id="titulo-perfil" className="mt-4 text-2xl font-bold text-gray-900">
          {usuario.nombre}
        </h1>
        <p className="mt-1 rounded-full bg-home-orange-100 px-3 py-1 text-xs font-semibold text-home-orange-900">
          2nd GUEST
        </p>
      </div>

      {perfil.bio && <p className="mt-5 leading-relaxed text-gray-700">{perfil.bio}</p>}

      <ul className="mt-5 space-y-3 border-t border-home-orange-100 pt-5">
        {datos.map(({ Icono, texto }) => (
          <li key={texto} className="flex items-start gap-3 text-sm text-gray-800">
            <Icono className="mt-0.5 h-4 w-4 shrink-0 text-home-orange-600" aria-hidden="true" />
            <span className="min-w-0 [overflow-wrap:anywhere]">{texto}</span>
          </li>
        ))}
      </ul>

      <button type="button" onClick={onEditar} className={`${CLASE_BOTON_SECUNDARIO} mt-6 w-full`}>
        <LuPencil className="h-4 w-4" aria-hidden="true" />
        Editar perfil
      </button>
    </section>
  )
}

/* ==========================================================
   Formulario para editar el perfil
   ========================================================== */
function FormularioPerfil({ perfil, onGuardar, onCancelar }) {
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
    if (!datos.carrera.trim()) nuevosErrores.carrera = 'Escribe tu carrera.'
    const semestre = Number(datos.semestre)
    if (!Number.isInteger(semestre) || semestre < 1 || semestre > 14) {
      nuevosErrores.semestre = 'Escribe un semestre entre 1 y 14.'
    }
    if (!datos.origen.trim()) nuevosErrores.origen = 'Escribe de dónde vienes.'
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    // MAQUETA: con Firebase aquí se actualizará el documento del usuario en Firestore
    onGuardar({ ...datos, semestre })
  }

  return (
    <section aria-labelledby="titulo-editar" className="rounded-3xl border border-home-orange-200 bg-white p-6">
      <h1 id="titulo-editar" className="text-xl font-bold text-gray-900">
        Editar perfil
      </h1>

      <form onSubmit={alGuardar} noValidate className="mt-5 space-y-4">
        <CampoFormulario
          etiqueta="Carrera"
          value={datos.carrera}
          onChange={(e) => actualizar('carrera', e.target.value)}
          error={errores.carrera}
        />
        <CampoFormulario
          etiqueta="Semestre"
          type="number"
          inputMode="numeric"
          min={1}
          max={14}
          value={datos.semestre}
          onChange={(e) => actualizar('semestre', e.target.value)}
          error={errores.semestre}
        />
        <CampoFormulario
          etiqueta="¿De dónde vienes?"
          placeholder="Ej. Colima, Colima"
          value={datos.origen}
          onChange={(e) => actualizar('origen', e.target.value)}
          error={errores.origen}
        />

        <div>
          <label htmlFor={idBio} className="text-sm font-semibold text-gray-900">
            Sobre ti
          </label>
          <textarea
            id={idBio}
            rows={4}
            value={datos.bio}
            onChange={(e) => actualizar('bio', e.target.value)}
            placeholder="Cuéntales a los 2nd HOSTS cómo eres y qué buscas."
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
   Favoritos
   ========================================================== */
function SeccionFavoritos({ idsFavoritos }) {
    const { propiedades } = usePropiedades()
  // Solo se muestran las que siguen publicadas
  const favoritos = propiedades.filter((p) => idsFavoritos.includes(p.id) && p.estado === 'approved')
  return (
    <section aria-labelledby="titulo-favoritos">
      <h2 id="titulo-favoritos" className="text-xl font-bold text-gray-900">
        Mis favoritos
      </h2>

      {favoritos.length > 0 ? (
        <ul className="mt-4 grid gap-6 sm:grid-cols-2">
          {favoritos.map((propiedad) => (
            <li key={propiedad.id}>
              <PropertyCard propiedad={propiedad} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4 rounded-3xl border-2 border-dashed border-home-orange-200 bg-white px-6 py-10 text-center">
          <LuHeart className="mx-auto h-8 w-8 text-home-orange-300" aria-hidden="true" />
          <p className="mt-3 text-sm text-gray-700">
            Toca el corazón de cualquier lugar del catálogo para guardarlo aquí.
          </p>
          <Link to="/" className={`${CLASE_BOTON_SECUNDARIO} mt-4`}>
            Explorar Alojamiento
          </Link>
        </div>
      )}
    </section>
  )
}

/* ==========================================================
   Formulario de reseña
   ========================================================== */
function SelectorEstrellas({ valor, onCambiar, error }) {
  // Cada formulario necesita un nombre propio para su grupo de radios
  const nombreGrupo = useId()

  return (
    <fieldset>
      <legend className="text-sm font-semibold text-gray-900">Calificación</legend>
      <div className="mt-1.5 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <label
            key={n}
            className="cursor-pointer rounded-md p-0.5 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-home-orange-500"
          >
            <input
              type="radio"
              name={nombreGrupo}
              value={n}
              checked={valor === n}
              onChange={() => onCambiar(n)}
              className="sr-only"
            />
            <FaStar
              className={`h-7 w-7 transition-colors ${n <= valor ? 'text-home-orange-400' : 'text-home-orange-100'}`}
              aria-hidden="true"
            />
            <span className="sr-only">
              {n} {n === 1 ? 'estrella' : 'estrellas'}
            </span>
          </label>
        ))}
      </div>
      {error && <p className="mt-1.5 text-sm font-medium text-red-700">{error}</p>}
    </fieldset>
  )
}

function FormularioResena({ onPublicar, onCancelar }) {
  const [calificacion, setCalificacion] = useState(0)
  const [comentario, setComentario] = useState('')
  const [errores, setErrores] = useState({})
  const idComentario = useId()

  const alPublicar = (e) => {
    e.preventDefault()
    const nuevosErrores = {}
    if (!calificacion) nuevosErrores.calificacion = 'Elige de 1 a 5 estrellas.'
    if (comentario.trim().length < LARGO_MINIMO_RESENA) {
      nuevosErrores.comentario = `Cuéntanos un poco más (al menos ${LARGO_MINIMO_RESENA} caracteres).`
    }
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return
    onPublicar({ calificacion, comentario: comentario.trim() })
  }

  return (
    <form onSubmit={alPublicar} noValidate className="mt-4 space-y-4 rounded-2xl bg-home-orange-50 p-4">
      <SelectorEstrellas
        valor={calificacion}
        onCambiar={(n) => {
          setCalificacion(n)
          setErrores((prev) => ({ ...prev, calificacion: undefined }))
        }}
        error={errores.calificacion}
      />

      <div>
        <label htmlFor={idComentario} className="text-sm font-semibold text-gray-900">
          Tu reseña
        </label>
        <textarea
          id={idComentario}
          rows={4}
          value={comentario}
          onChange={(e) => {
            setComentario(e.target.value)
            if (errores.comentario) setErrores((prev) => ({ ...prev, comentario: undefined }))
          }}
          placeholder="¿Cómo fue vivir ahí? Piensa en la convivencia, el ruido, la limpieza y el trato del 2nd HOST."
          aria-invalid={errores.comentario ? 'true' : undefined}
          className={`mt-1.5 w-full resize-y rounded-xl border-2 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none ${
            errores.comentario
              ? 'border-red-600 focus:border-red-700'
              : 'border-home-orange-200 focus:border-home-orange-500'
          }`}
        />
        {errores.comentario && <p className="mt-1.5 text-sm font-medium text-red-700">{errores.comentario}</p>}
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="submit" className={CLASE_BOTON_PRINCIPAL}>
          Publicar reseña
        </button>
        <button type="button" onClick={onCancelar} className={CLASE_BOTON_SECUNDARIO}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

/* ==========================================================
   Historial: dónde ha vivido y sus reseñas
   ========================================================== */
function FotoMiniatura({ src, titulo }) {
  const [fallo, setFallo] = useState(false)

  if (!src || fallo) {
    return (
      <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-home-orange-100 sm:h-24 sm:w-24">
        <LuHouse className="h-8 w-8 text-home-orange-300" aria-hidden="true" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={`Foto de ${titulo}`}
      onError={() => setFallo(true)}
      className="h-20 w-20 shrink-0 rounded-2xl object-cover sm:h-24 sm:w-24"
    />
  )
}

function ItemHistorial({ estancia, resena, onPublicar }) {
  const [escribiendo, setEscribiendo] = useState(false)
  const propiedad = obtenerPropiedad(estancia.propiedadId)
  if (!propiedad) return null

  const publicar = (datos) => {
    onPublicar(propiedad.id, datos)
    setEscribiendo(false)
  }

  return (
    <li className="rounded-3xl border border-home-orange-200 bg-white p-5">
      <div className="flex gap-4">
        <FotoMiniatura src={propiedad.imagenes?.[0]} titulo={propiedad.titulo} />
        <div className="min-w-0">
          <h3 className="font-semibold leading-snug text-gray-900">
            <Link
              to={`/propiedad/${propiedad.id}`}
              className={`rounded hover:text-home-orange-800 hover:underline ${ENFOQUE}`}
            >
              {propiedad.titulo}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-gray-700">2nd HOST: {propiedad.arrendador.nombre}</p>
          <p className="mt-1 text-sm text-gray-600">
            {formatoMesCorto(estancia.desde)} – {estancia.hasta ? formatoMesCorto(estancia.hasta) : 'actualidad'}
          </p>
        </div>
      </div>

      {/* Reseña publicada, formulario o botón para escribirla */}
      {resena ? (
        <div className="mt-4 rounded-2xl bg-home-orange-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-gray-900">Tu reseña</p>
            <time dateTime={resena.fecha} className="text-xs text-gray-600">
              {formatoMesLargo(resena.fecha)}
            </time>
          </div>
          <div className="mt-2">
            <Estrellas valor={resena.calificacion} />
            <span className="sr-only">{resena.calificacion} de 5 estrellas</span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-gray-800">{resena.comentario}</p>
        </div>
      ) : escribiendo ? (
        <FormularioResena onPublicar={publicar} onCancelar={() => setEscribiendo(false)} />
      ) : (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-home-orange-200 p-4">
          <p className="text-sm text-gray-700">¿Cómo te fue en este lugar? Tu reseña ayuda a otros 2nd GUESTS.</p>
          <button type="button" onClick={() => setEscribiendo(true)} className={CLASE_BOTON_PRINCIPAL}>
            Escribir reseña
          </button>
        </div>
      )}
    </li>
  )
}

function SeccionHistorial({ historial, resenasPropias, onPublicar }) {
  return (
    <section aria-labelledby="titulo-historial">
      <h2 id="titulo-historial" className="text-xl font-bold text-gray-900">
        Dónde he vivido
      </h2>
      <p className="mt-1 text-sm text-gray-700">Solo puedes reseñar los lugares donde viviste a través de 2nd HOME.</p>

      {historial.length > 0 ? (
        <ul className="mt-4 space-y-4">
          {historial.map((estancia) => (
            <ItemHistorial
              key={`${estancia.propiedadId}-${estancia.desde}`}
              estancia={estancia}
              resena={resenasPropias.find((r) => r.propiedadId === estancia.propiedadId)}
              onPublicar={onPublicar}
            />
          ))}
        </ul>
      ) : (
        <p className="mt-4 rounded-3xl border border-home-orange-100 bg-white p-6 text-sm text-gray-700">
          Cuando vivas en un lugar a través de 2nd HOME, aparecerá aquí y podrás dejar tu reseña.
        </p>
      )}
    </section>
  )
}

/* ==========================================================
   Página
   ========================================================== */
export default function PerfilEstudiante() {
  const { usuario } = useSesion()

  // MAQUETA: los cambios viven solo en esta página. Con Firebase se guardarán en Firestore.
  const [perfil, setPerfil] = useState(() => ({
    carrera: usuario.carrera ?? '',
    semestre: usuario.semestre ?? 1,
    origen: usuario.origen ?? '',
    bio: usuario.bio ?? '',
  }))
  const [editando, setEditando] = useState(false)
  const [resenasPropias, setResenasPropias] = useState(() => resenas.filter((r) => r.autorId === usuario.id))

  // Esta página es solo para 2nd GUESTS
  if (usuario.rol !== 'estudiante') return <Navigate to="/" replace />

  const publicarResena = (propiedadId, { calificacion, comentario }) => {
    const nueva = {
      id: `r-${Date.now()}`,
      propiedadId,
      autorId: usuario.id,
      autorNombre: usuario.nombre,
      autorCarrera: perfil.carrera,
      avatar: usuario.avatar,
      calificacion,
      fecha: hoyComoTexto(),
      comentario,
    }
    setResenasPropias((prev) => [...prev, nueva])
  }

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-6 md:px-8">
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Columna izquierda: datos del perfil */}
        <div className="lg:col-span-4">
          {editando ? (
            <FormularioPerfil
              perfil={perfil}
              onGuardar={(nuevoPerfil) => {
                setPerfil(nuevoPerfil)
                setEditando(false)
              }}
              onCancelar={() => setEditando(false)}
            />
          ) : (
            <TarjetaPerfil usuario={usuario} perfil={perfil} onEditar={() => setEditando(true)} />
          )}
        </div>

        {/* Columna derecha: favoritos e historial */}
        <div className="space-y-10 lg:col-span-8">
          <SeccionFavoritos idsFavoritos={usuario.favoritos ?? []} />
          <SeccionHistorial
            historial={usuario.historial ?? []}
            resenasPropias={resenasPropias}
            onPublicar={publicarResena}
          />
        </div>
      </div>
    </main>
  )
}