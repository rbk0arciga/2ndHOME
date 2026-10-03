import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LuFootprints, LuHeart, LuHouse } from 'react-icons/lu'
import { FaStar } from 'react-icons/fa'
import Avatar from './Avatar'
import {
  TIPOS_PROPIEDAD,
  GENEROS,
  usuarioActual,
  minutosAPie,
  formatoPrecio,
} from '../data/mockData'

/* ---------- Foto con respaldo si no existe o no carga ---------- */
function FotoPropiedad({ src, titulo }) {
  const [fallo, setFallo] = useState(false)

  if (!src || fallo) {
    return (
      <div className="grid h-full w-full place-items-center bg-home-orange-100">
        <LuHouse className="h-14 w-14 text-home-orange-300" aria-hidden="true" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={`Foto de ${titulo}`}
      loading="lazy" // La imagen se descarga solo cuando está cerca de verse en pantalla
      onError={() => setFallo(true)}
      className="h-full w-full object-cover"
    />
  )
}

/* ---------- Etiqueta protagonista: distancia a CUCEI ---------- */
function DistanciaCucei({ km }) {
  return (
    <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-2xl bg-white/95 py-1.5 pl-1.5 pr-3 shadow-sm">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-home-orange-600 text-white">
        <LuFootprints className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-bold text-gray-900">{minutosAPie(km)} min a pie</span>
        <span className="block text-xs text-gray-700">{km} km de CUCEI</span>
      </span>
    </div>
  )
}

/* ---------- Botón de favorito (solo para estudiantes) ---------- */
// Maqueta: el estado vive solo en este componente. Con Firebase se guardará en el perfil.
function BotonFavorito({ propiedadId, titulo }) {
  const [guardado, setGuardado] = useState(
    usuarioActual?.favoritos?.includes(propiedadId) ?? false
  )

  return (
    <button
      type="button"
      onClick={() => setGuardado((valor) => !valor)}
      aria-pressed={guardado}
      aria-label={`Guardar ${titulo} en favoritos`}
      // z-10: queda por encima del enlace que cubre toda la tarjeta
      className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/95 text-home-orange-700 shadow-sm transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-home-orange-500"
    >
      <LuHeart className={`h-5 w-5 ${guardado ? 'fill-current' : ''}`} aria-hidden="true" />
    </button>
  )
}

/* ---------- Calificación compacta ---------- */
function Calificacion({ calificacion, numResenas }) {
  // Propiedades sin reseñas todavía
  if (!calificacion) {
    return (
      <span className="rounded-full bg-home-orange-100 px-2.5 py-1 text-xs font-semibold text-home-orange-800">
        Nuevo
      </span>
    )
  }

  return (
    <p className="flex shrink-0 items-center gap-1 text-sm">
      <FaStar className="h-4 w-4 text-home-orange-400" aria-hidden="true" />
      <span className="sr-only">Calificación:</span>
      <span className="font-semibold text-gray-900">{calificacion.toFixed(1)}</span>
      <span className="text-gray-600">
        ({numResenas} {numResenas === 1 ? 'reseña' : 'reseñas'})
      </span>
    </p>
  )
}

/* ---------- Tarjeta principal ---------- */
export default function PropertyCard({ propiedad }) {
  const {
    id,
    tipo,
    titulo,
    imagenes,
    distanciaKm,
    precio,
    calificacion,
    numResenas,
    genero,
    serviciosIncluidos,
    contratoMeses,
    disponible,
    arrendador,
  } = propiedad

  const esEstudiante = usuarioActual?.rol === 'estudiante'
  const claseEtiqueta = 'rounded-full border border-home-orange-200 bg-home-orange-50 px-2.5 py-1 text-xs font-medium text-home-orange-900'

  return (
    // relative: permite que el enlace del título cubra toda la tarjeta.
    // has-[a:focus-visible]: muestra un contorno en la tarjeta al llegar con el teclado.
    <article className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-home-orange-200 bg-white transition-colors hover:border-home-orange-400 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-home-orange-500">
      {/* Imagen con etiquetas encima */}
      <div className="relative aspect-4/3 bg-home-orange-100">
        <FotoPropiedad src={imagenes?.[0]} titulo={titulo} />
        <DistanciaCucei km={distanciaKm} />

        {!disponible && (
          <span className="absolute left-3 top-3 rounded-full bg-gray-900/80 px-3 py-1 text-xs font-semibold text-white">
            Sin lugares por ahora
          </span>
        )}

        {esEstudiante && <BotonFavorito propiedadId={id} titulo={titulo} />}
      </div>

      {/* Información */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="text-xs font-medium text-gray-600">{TIPOS_PROPIEDAD[tipo]}</p>
          <h3 className="mt-0.5 text-lg font-semibold leading-snug text-gray-900">
            {/* El ::after de este enlace se estira sobre toda la tarjeta: cualquier clic lleva al detalle */}
            <Link to={`/propiedad/${id}`} className="after:absolute after:inset-0 focus-visible:outline-none">
              {titulo}
            </Link>
          </h3>
        </div>

        <div className="flex items-end justify-between gap-2">
          <p>
            <span className="text-2xl font-bold text-home-orange-800">{formatoPrecio(precio)}</span>
            <span className="text-sm text-gray-600"> al mes</span>
          </p>
          <Calificacion calificacion={calificacion} numResenas={numResenas} />
        </div>

        {/* Solo los datos que cambian entre propiedades */}
        <ul className="flex flex-wrap gap-2">
          <li className={claseEtiqueta}>{GENEROS[genero]}</li>
          <li className={claseEtiqueta}>Contrato de {contratoMeses} meses</li>
          {!serviciosIncluidos && <li className={claseEtiqueta}>Servicios no incluidos</li>}
        </ul>

        {/* mt-auto: empuja al anfitrión al fondo para alinear tarjetas de distinta altura */}
        <div className="mt-auto flex items-center gap-2 border-t border-home-orange-100 pt-3">
          <Avatar src={arrendador.avatar} nombre={arrendador.nombre} tamano="sm" />
          <p className="text-sm text-gray-700">
            2nd HOST: <span className="font-medium text-gray-900">{arrendador.nombre}</span>
          </p>
        </div>
      </div>
    </article>
  )
}