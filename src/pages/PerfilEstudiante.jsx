import { useId, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { doc, updateDoc } from 'firebase/firestore'
import { LuPencil, LuMapPin, LuGraduationCap, LuCalendar, LuHeart, LuMail, LuLoader } from 'react-icons/lu'
import { FaStar } from 'react-icons/fa'
import Avatar from '../components/Avatar'
import PropertyCard from '../components/PropertyCard'
import CampoFormulario from '../components/CampoFormulario'
import SubirAvatar from '../components/SubirAvatar'
import { useSesion } from '../context/sesion'
import { usePropiedades } from '../context/propiedades'
import { useResenasDeAutor } from '../hooks/useResenas'
import { db } from '../firebase/config'

const ENFOQUE =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-home-orange-500'
const CLASE_BOTON_PRINCIPAL = `inline-flex items-center justify-center gap-2 rounded-full bg-home-orange-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-home-orange-800 disabled:opacity-80 ${ENFOQUE}`
const CLASE_BOTON_SECUNDARIO = `inline-flex items-center justify-center gap-2 rounded-full border-2 border-home-orange-700 px-5 py-2 text-sm font-semibold text-home-orange-800 transition-colors hover:bg-home-orange-50 ${ENFOQUE}`

// "2025-08" → "ago 2025"
function formatoMesCorto(anioMes) {
  const [anio, mes] = anioMes.split('-').map(Number)
  return new Date(anio, mes - 1, 1).toLocaleDateString('es-MX', { month: 'short', year: 'numeric' })
}

// "2026-06-20" → "junio de 2026"
function formatoMesLargo(fecha) {
  const [anio, mes] = fecha.split('-').map(Number)
  return new Date(anio, mes - 1, 1).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
}

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
function TarjetaPerfil({ usuario, onEditar }) {
  const datos = [
    usuario.carrera && {
      Icono: LuGraduationCap,
      texto: usuario.semestre ? `${usuario.carrera}, ${usuario.semestre}.º semestre` : usuario.carrera,
    },
    usuario.origen && { Icono: LuMapPin, texto: `Viene de ${usuario.origen}` },
    usuario.miembroDesde && { Icono: LuCalendar, texto: `En 2nd HOME desde ${formatoMesCorto(usuario.miembroDesde)}` },
    { Icono: LuMail, texto: usuario.correo },
  ].filter(Boolean)

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

      {usuario.bio && <p className="mt-5 leading-relaxed text-gray-700">{usuario.bio}</p>}

      <ul className="mt-5 space-y-3 border-t border-home-orange-100 pt-5">
        {datos.map(({ Icono, texto }) => (
          <li key={texto} className="flex items-start gap-3 text-sm text-gray-800">
            <Icono className="mt-0.5 h-4 w-4 shrink-0 text-home-orange-600" aria-hidden="true" />
            <span className="min-w-0 wrap-anywhere">{texto}</span>
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
   Editar perfil (se guarda en Firestore)
   ========================================================== */
function FormularioPerfil({ usuario, onTerminar }) {
  const [datos, setDatos] = useState({
    carrera: usuario.carrera ?? '',
    semestre: usuario.semestre ?? '',
    origen: usuario.origen ?? '',
    bio: usuario.bio ?? '',
  })
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [guardando, setGuardando] = useState(false)
  const idBio = useId()

  const actualizar = (campo, valor) => {
    setDatos((prev) => ({ ...prev, [campo]: valor }))
    if (errores[campo]) setErrores((prev) => ({ ...prev, [campo]: undefined }))
  }

  const alGuardar = async (e) => {
    e.preventDefault()
    const nuevosErrores = {}
    if (!datos.carrera.trim()) nuevosErrores.carrera = 'Escribe tu carrera.'
    const semestre = Number(datos.semestre)
    if (datos.semestre !== '' && (!Number.isInteger(semestre) || semestre < 1 || semestre > 14)) {
      nuevosErrores.semestre = 'Escribe un semestre entre 1 y 14, o déjalo vacío.'
    }
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    setGuardando(true)
    setErrorGeneral('')
    try {
      await updateDoc(doc(db, 'usuarios', usuario.id), {
        carrera: datos.carrera.trim(),
        semestre: datos.semestre === '' ? null : semestre,
        origen: datos.origen.trim(),
        bio: datos.bio.trim(),
      })
      onTerminar()
    } catch {
      setErrorGeneral('No pudimos guardar los cambios. Inténtalo de nuevo.')
      setGuardando(false)
    }
  }

  return (
    <section aria-labelledby="titulo-editar" className="rounded-3xl border border-home-orange-200 bg-white p-6">
      <h1 id="titulo-editar" className="text-xl font-bold text-gray-900">
        Editar perfil
      </h1>
      <div className="mt-5">
        <SubirAvatar usuario={usuario} />
      </div>
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

        {errorGeneral && (
          <p role="alert" className="text-sm font-medium text-red-700">
            {errorGeneral}
          </p>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          <button type="submit" disabled={guardando} className={CLASE_BOTON_PRINCIPAL}>
            {guardando && <LuLoader className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
            Guardar cambios
          </button>
          <button type="button" onClick={onTerminar} className={CLASE_BOTON_SECUNDARIO}>
            Cancelar
          </button>
        </div>
      </form>
    </section>
  )
}

/* ==========================================================
   Favoritos (se guardan en Firestore desde el corazón de cada tarjeta)
   ========================================================== */
function SeccionFavoritos({ idsFavoritos }) {
  const { propiedades } = usePropiedades()
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
          <p className="mt-3 text-sm text-gray-700">Toca el corazón de cualquier lugar del catálogo para guardarlo aquí.</p>
          <Link to="/" className={`${CLASE_BOTON_SECUNDARIO} mt-4`}>
            Explorar Alojamiento
          </Link>
        </div>
      )}
    </section>
  )
}

/* ==========================================================
   Mis reseñas
   ========================================================== */
function SeccionMisResenas({ resenasPropias }) {
  const { propiedades } = usePropiedades()

  return (
    <section aria-labelledby="titulo-mis-resenas">
      <h2 id="titulo-mis-resenas" className="text-xl font-bold text-gray-900">
        Mis reseñas
      </h2>
      <p className="mt-1 text-sm text-gray-700">
        Puedes reseñar cualquier lugar desde su página, en "Lo que se dice en los pasillos".
      </p>

      {resenasPropias.length > 0 ? (
        <ul className="mt-4 space-y-4">
          {resenasPropias.map((resena) => {
            const propiedad = propiedades.find((p) => p.id === resena.propiedadId)
            return (
              <li key={resena.id} className="rounded-3xl border border-home-orange-200 bg-white p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-semibold text-gray-900">
                    {propiedad ? (
                      <Link
                        to={`/propiedad/${propiedad.id}`}
                        className={`rounded hover:text-home-orange-800 hover:underline ${ENFOQUE}`}
                      >
                        {propiedad.titulo}
                      </Link>
                    ) : (
                      'Propiedad no disponible'
                    )}
                  </h3>
                  <time dateTime={resena.fecha} className="text-xs text-gray-600">
                    {formatoMesLargo(resena.fecha)}
                  </time>
                </div>
                <div className="mt-2">
                  <Estrellas valor={resena.calificacion} />
                  <span className="sr-only">{resena.calificacion} de 5 estrellas</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-gray-800">{resena.comentario}</p>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="mt-4 rounded-3xl border-2 border-dashed border-home-orange-200 bg-white px-6 py-10 text-center">
          <FaStar className="mx-auto h-8 w-8 text-home-orange-300" aria-hidden="true" />
          <p className="mt-3 text-sm text-gray-700">Todavía no has escrito reseñas.</p>
          <Link to="/" className={`${CLASE_BOTON_SECUNDARIO} mt-4`}>
            Explorar Alojamiento
          </Link>
        </div>
      )}
    </section>
  )
}

/* ==========================================================
   Página
   ========================================================== */
export default function PerfilEstudiante() {
  const { usuario } = useSesion()
  const resenasPropias = useResenasDeAutor(usuario.id)
  const [editando, setEditando] = useState(false)

  // Esta página es solo para 2nd GUESTS
  if (usuario.rol !== 'estudiante') return <Navigate to="/" replace />

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-6 md:px-8">
      <div className="grid items-start gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          {editando ? (
            <FormularioPerfil usuario={usuario} onTerminar={() => setEditando(false)} />
          ) : (
            <TarjetaPerfil usuario={usuario} onEditar={() => setEditando(true)} />
          )}
        </div>

        <div className="space-y-10 lg:col-span-8">
          <SeccionFavoritos idsFavoritos={usuario.favoritos ?? []} />
          <SeccionMisResenas resenasPropias={resenasPropias} />
        </div>
      </div>
    </main>
  )
}