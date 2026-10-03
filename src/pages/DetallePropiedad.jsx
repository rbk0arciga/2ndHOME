import { useId, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  LuArrowLeft,
  LuChevronLeft,
  LuChevronRight,
  LuChevronDown,
  LuFootprints,
  LuMessageCircle,
  LuHouse,
  LuMapPin,
  LuExternalLink,
  LuRoute,
  LuWifi,
  LuDroplet,
  LuZap,
  LuFlame,
  LuSparkles,
  LuTv,
  LuWashingMachine,
  LuCookingPot,
  LuBookOpen,
  LuTrees,
  LuSun,
  LuDoorOpen,
  LuDoorClosed,
  LuUtensils,
  LuCar,
  LuBedSingle,
  LuBedDouble,
  LuFan,
  LuLampDesk,
  LuBath,
  LuShirt,
  LuPawPrint,
  LuClock,
  LuPartyPopper,
  LuCigaretteOff,
  LuUsers,
  LuFileText,
  LuUserRound,
} from 'react-icons/lu'
import { FaStar } from 'react-icons/fa'
import Avatar from '../components/Avatar'
import {
  obtenerPropiedad,
  resenasDePropiedad,
  usuarios,
  usuarioActual,
  TIPOS_PROPIEDAD,
  GENEROS,
  SERVICIOS,
  CARACTERISTICAS,
  AMENIDADES,
  REGLAS,
  ESTADOS_REVISION,
  CUCEI,
  minutosAPie,
  formatoPrecio,
  direccionCompleta,
} from '../data/mockData'

const ENFOQUE =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-home-orange-500'

// Ícono para cada clave de los catálogos de mockData
const ICONOS = {
  // Servicios
  wifi: LuWifi,
  agua: LuDroplet,
  luz: LuZap,
  gas: LuFlame,
  limpieza: LuSparkles,
  tv: LuTv,
  // Características de la casa
  lavado: LuWashingMachine,
  cocina: LuCookingPot,
  estudio: LuBookOpen,
  patio: LuTrees,
  terraza: LuSun,
  accesoUnico: LuDoorOpen,
  comedor: LuUtensils,
  estacionamiento: LuCar,
  // Amenidades de la habitación
  camaIndividual: LuBedSingle,
  camaMatrimonial: LuBedDouble,
  ventilador: LuFan,
  escritorio: LuLampDesk,
  banoPrivado: LuBath,
  armario: LuShirt,
  // Reglas
  noMascotas: LuPawPrint,
  visitasConHorario: LuClock,
  noFiestas: LuPartyPopper,
  noFumar: LuCigaretteOff,
}

/* ---------- Utilidades de texto ---------- */
// plural(3, 'baño', 'baños') → "3 baños"
const plural = (cantidad, singular, varios) => `${cantidad} ${cantidad === 1 ? singular : varios}`

// "2026-06-20" → "junio de 2026" (se arma la fecha por partes para evitar desfases de zona horaria)
function formatoMesAnio(fecha) {
  const [anio, mes] = fecha.split('-').map(Number)
  return new Date(anio, mes - 1, 1).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
}

const primerNombre = (nombreCompleto) => nombreCompleto.split(' ')[0]

/* ==========================================================
   Galería de fotos
   ========================================================== */
function Galeria({ imagenes, titulo }) {
  const [actual, setActual] = useState(0)
  const [fallidas, setFallidas] = useState({})
  const inicioToque = useRef(null)
  const total = imagenes.length

  const irA = (indice) => setActual((indice + total) % total)

  const alTerminarToque = (e) => {
    if (inicioToque.current === null) return
    const diferencia = e.changedTouches[0].clientX - inicioToque.current
    if (Math.abs(diferencia) > 50) irA(actual + (diferencia < 0 ? 1 : -1))
    inicioToque.current = null
  }

  const src = imagenes[actual]
  const sinImagen = total === 0 || fallidas[src]
  const claseFlecha = `absolute top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-home-orange-800 shadow-sm transition-colors hover:bg-white ${ENFOQUE}`

  return (
    <div
      className="relative aspect-4/3 overflow-hidden rounded-3xl bg-home-orange-100"
      onTouchStart={(e) => (inicioToque.current = e.touches[0].clientX)}
      onTouchEnd={alTerminarToque}
    >
      {sinImagen ? (
        <div className="grid h-full place-items-center">
          <LuHouse className="h-20 w-20 text-home-orange-300" aria-hidden="true" />
        </div>
      ) : (
        <img
          src={src}
          alt={`Foto ${actual + 1} de ${total} de ${titulo}`}
          onError={() => setFallidas((prev) => ({ ...prev, [src]: true }))}
          className="h-full w-full object-cover"
        />
      )}

      {total > 1 && (
        <>
          <button type="button" onClick={() => irA(actual - 1)} aria-label="Foto anterior" className={`${claseFlecha} left-3`}>
            <LuChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => irA(actual + 1)} aria-label="Foto siguiente" className={`${claseFlecha} right-3`}>
            <LuChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>

          <span className="absolute right-3 top-3 rounded-full bg-gray-900/75 px-2.5 py-1 text-xs font-semibold text-white">
            {actual + 1} / {total}
          </span>

          <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1">
            {imagenes.map((imagen, indice) => (
              <button
                key={imagen}
                type="button"
                onClick={() => irA(indice)}
                aria-label={`Ver foto ${indice + 1}`}
                aria-current={indice === actual ? 'true' : undefined}
                className={`rounded-full p-1.5 ${ENFOQUE}`}
              >
                <span
                  className={`block h-2 rounded-full transition-all ${
                    indice === actual ? 'w-6 bg-home-orange-500' : 'w-2 bg-white/80'
                  }`}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ==========================================================
   Encabezado: tipo, título, datos clave y descripción
   ========================================================== */
function Encabezado({ propiedad }) {
  const { tipo, titulo, calificacion, numResenas, distanciaKm, genero, descripcion } = propiedad

  return (
    <div className="mt-6">
      <p className="text-sm font-medium text-gray-600">{TIPOS_PROPIEDAD[tipo]}</p>
      <h1 className="mt-1 text-2xl font-bold leading-tight text-gray-900 md:text-4xl">{titulo}</h1>
      <p className="mt-2 flex items-start gap-1.5 text-sm text-gray-700">
        <LuMapPin className="mt-0.5 h-4 w-4 shrink-0 text-home-orange-600" aria-hidden="true" />
        {direccionCompleta(propiedad)}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        {calificacion ? (
          <a href="#resenas" className={`flex items-center gap-1 rounded hover:underline ${ENFOQUE}`}>
            <FaStar className="h-4 w-4 text-home-orange-400" aria-hidden="true" />
            <span className="font-semibold text-gray-900">{calificacion.toFixed(1)}</span>
            <span className="text-gray-700">({plural(numResenas, 'reseña', 'reseñas')})</span>
          </a>
        ) : (
          <span className="rounded-full bg-home-orange-100 px-2.5 py-1 text-xs font-semibold text-home-orange-800">
            Nuevo
          </span>
        )}

        <span className="flex items-center gap-1.5 text-gray-800">
          <LuFootprints className="h-4 w-4 text-home-orange-600" aria-hidden="true" />
          <span>
            <span className="font-semibold">{minutosAPie(distanciaKm)} min a pie</span> de CUCEI ({distanciaKm} km)
          </span>
        </span>

        <span className="rounded-full border border-home-orange-200 bg-home-orange-50 px-2.5 py-1 text-xs font-medium text-home-orange-900">
          {GENEROS[genero]}
        </span>
      </div>

      <p className="mt-4 max-w-prose leading-relaxed text-gray-700">{descripcion}</p>
    </div>
  )
}

/* ==========================================================
   Renta, depósito y botón de contacto
   ========================================================== */
function AccionContacto({ propiedadId, arrendador }) {
  const nombre = primerNombre(arrendador.nombre)
  const claseBoton = `mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-home-orange-700 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-home-orange-800 ${ENFOQUE}`

  // Sin sesión: primero hay que iniciar sesión
  if (!usuarioActual) {
    return (
      <Link to="/login" className={claseBoton}>
        Inicia sesión para escribirle a {nombre}
      </Link>
    )
  }

  // Estudiante: abre el chat con esta propiedad seleccionada
  if (usuarioActual.rol === 'estudiante') {
    return (
      <>
        <Link to={`/chat?propiedad=${propiedadId}`} className={claseBoton}>
          <LuMessageCircle className="h-5 w-5" aria-hidden="true" />
          Enviar mensaje a {nombre}
        </Link>
        <p className="mt-3 text-center text-sm text-gray-600">
          ¿Es tu próximo hogar? Empieza tu historia aquí.
        </p>
      </>
    )
  }

  // El dueño viendo su propia propiedad
  if (usuarioActual.id === arrendador.id) {
    return (
      <p className="mt-6 rounded-2xl bg-home-orange-50 p-4 text-center text-sm text-home-orange-900">
        Esta es una de tus propiedades.
      </p>
    )
  }

  // Otros arrendadores y el administrador no ven botón de contacto
  return null
}

function TarjetaRenta({ propiedad }) {
  const { id, precio, deposito, contratoMeses, serviciosIncluidos, arrendador } = propiedad

  return (
    <section aria-labelledby="titulo-renta" className="rounded-3xl border-2 border-home-orange-300 bg-white p-6">
      <h2 id="titulo-renta" className="text-sm font-semibold text-gray-700">
        Renta mensual
      </h2>
      <p className="mt-1">
        <span className="text-4xl font-bold text-home-orange-800">{formatoPrecio(precio)}</span>
        <span className="text-gray-600"> al mes</span>
      </p>

      {/* Lista de definiciones: cada dato con su etiqueta, sin ambigüedad */}
      <dl className="mt-4 space-y-3 border-t border-home-orange-100 pt-4 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-gray-700">Depósito</dt>
          <dd className="text-right font-medium text-gray-900">
            {formatoPrecio(deposito)}
            {deposito === precio && (
              <span className="block text-xs font-normal text-gray-600">Equivale a un mes de renta</span>
            )}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-gray-700">Contrato</dt>
          <dd className="font-medium text-gray-900">{contratoMeses} meses</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-gray-700">Servicios</dt>
          <dd className="font-medium text-gray-900">
            {serviciosIncluidos ? 'Incluidos en la renta' : 'Se pagan aparte'}
          </dd>
        </div>
      </dl>

      <AccionContacto propiedadId={id} arrendador={arrendador} />
    </section>
  )
}

/* ==========================================================
   Tarjeta del 2nd HOST
   ========================================================== */
function TarjetaAnfitrion({ arrendador }) {
  // Por ahora solo los usuarios de ejemplo tienen perfil completo en mockData
  const perfil = usuarios.find((u) => u.id === arrendador.id)

  return (
    <section aria-labelledby="titulo-anfitrion" className="flex items-center gap-4 rounded-3xl bg-home-orange-100 p-5">
      <Avatar src={arrendador.avatar} nombre={arrendador.nombre} tamano="lg" />
      <div className="min-w-0">
        <h2 id="titulo-anfitrion" className="text-xs font-semibold text-home-orange-900">
          Tu 2nd HOST
        </h2>
        <p className="text-lg font-semibold text-gray-900">{arrendador.nombre}</p>
        {perfil?.anfitrionDesde && (
          <p className="text-sm text-gray-700">2nd HOST desde {perfil.anfitrionDesde.slice(0, 4)}</p>
        )}
        <Link
          to={`/perfil-arrendador/${arrendador.id}`}
          className={`mt-1 inline-block rounded text-sm font-semibold text-home-orange-800 underline underline-offset-4 hover:text-home-orange-900 ${ENFOQUE}`}
        >
          Conoce a {primerNombre(arrendador.nombre)}
        </Link>
      </div>
    </section>
  )
}

/* ==========================================================
   Mapa con la ubicación exacta y dirección escrita
   ========================================================== */
function Mapa({ propiedad }) {
  const { titulo, distanciaKm } = propiedad
  const { lat, lng } = propiedad.coordenadas

  // Encuadre centrado en la propiedad, con margen pequeño para distinguir la calle
  const margen = 0.004
  const urlMapa = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - margen},${lat - margen},${lng + margen},${lat + margen}&layer=mapnik&marker=${lat},${lng}`
  const urlGoogleMaps = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
  const urlRuta = `https://www.google.com/maps/dir/?api=1&origin=${lat},${lng}&destination=${CUCEI.lat},${CUCEI.lng}&travelmode=walking`

  const claseEnlace = `flex items-center gap-2 rounded text-sm font-semibold text-home-orange-800 underline underline-offset-4 hover:text-home-orange-900 ${ENFOQUE}`

  return (
    <section aria-labelledby="titulo-ubicacion" className="overflow-hidden rounded-3xl border border-home-orange-200 bg-white">
      <iframe
        title={`Mapa con la ubicación de ${titulo}`}
        src={urlMapa}
        loading="lazy"
        className="h-64 w-full border-0 md:h-72"
      />
      <div className="space-y-3 p-5">
        <h2 id="titulo-ubicacion" className="font-semibold text-gray-900">
          Ubicación
        </h2>
        <p className="flex items-start gap-2 text-sm text-gray-800">
          <LuMapPin className="mt-0.5 h-4 w-4 shrink-0 text-home-orange-600" aria-hidden="true" />
          {direccionCompleta(propiedad)}
        </p>

        <div className="flex flex-col gap-2 border-t border-home-orange-100 pt-3">
          <a href={urlRuta} target="_blank" rel="noopener noreferrer" className={claseEnlace}>
            <LuRoute className="h-4 w-4 shrink-0" aria-hidden="true" />
            Ver ruta caminando a CUCEI ({minutosAPie(distanciaKm)} min aprox.)
            <span className="sr-only">(se abre en otra pestaña)</span>
          </a>
          <a href={urlGoogleMaps} target="_blank" rel="noopener noreferrer" className={claseEnlace}>
            <LuExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
            Abrir en Google Maps
            <span className="sr-only">(se abre en otra pestaña)</span>
          </a>
        </div>
      </div>
    </section>
  )
}

/* ==========================================================
   Secciones de detalles (plegables en móvil, abiertas en escritorio)
   ========================================================== */
function SeccionPlegable({ titulo, abiertaInicial = false, children }) {
  const [abierta, setAbierta] = useState(abiertaInicial)
  const idContenido = useId()

  return (
    <section className="border-b border-home-orange-200 md:rounded-3xl md:border md:bg-white md:p-5">
      <h2 className="text-base font-semibold text-gray-900">
        {/* Móvil: botón que abre y cierra la sección */}
        <button
          type="button"
          onClick={() => setAbierta((valor) => !valor)}
          aria-expanded={abierta}
          aria-controls={idContenido}
          className={`flex w-full items-center justify-between gap-3 py-4 text-left md:hidden ${ENFOQUE}`}
        >
          {titulo}
          <LuChevronDown
            className={`h-5 w-5 shrink-0 text-home-orange-600 transition-transform ${abierta ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
        {/* Escritorio: título fijo, la sección siempre está abierta */}
        <span className="hidden md:block">{titulo}</span>
      </h2>

      <div id={idContenido} className={`${abierta ? 'block' : 'hidden'} pb-5 md:mt-4 md:block md:pb-0`}>
        {children}
      </div>
    </section>
  )
}

// Elemento de lista con ícono; si no hay ícono para una clave, usa la casita
function ItemConIcono({ Icono = LuHouse, children }) {
  return (
    <li className="flex items-center gap-3 text-sm text-gray-800">
      <Icono className="h-5 w-5 shrink-0 text-home-orange-600" aria-hidden="true" />
      {children}
    </li>
  )
}

function Detalles({ propiedad }) {
  const {
    tipo,
    habitacionesTotales,
    banos,
    roomies,
    caracteristicas,
    servicios,
    serviciosIncluidos,
    amenidades,
    reglas,
    genero,
    contratoMeses,
  } = propiedad

  const esHabitacion = tipo === 'habitacion' || tipo === 'compartida'

  return (
    <div className="mt-8 border-t border-home-orange-200 md:grid md:grid-cols-2 md:gap-4 md:border-t-0">
      <SeccionPlegable titulo="La casa" abiertaInicial>
        <ul className="space-y-3">
          <ItemConIcono Icono={LuDoorClosed}>{plural(habitacionesTotales, 'habitación', 'habitaciones')}</ItemConIcono>
          <ItemConIcono Icono={LuBath}>{plural(banos, 'baño', 'baños')}</ItemConIcono>
          <ItemConIcono Icono={LuUsers}>
            {roomies === 0 ? 'Sin roomies' : plural(roomies, 'roomie', 'roomies')}
          </ItemConIcono>
          {caracteristicas.map((clave) => (
            <ItemConIcono key={clave} Icono={ICONOS[clave]}>
              {CARACTERISTICAS[clave]}
            </ItemConIcono>
          ))}
        </ul>
      </SeccionPlegable>

      <SeccionPlegable titulo={serviciosIncluidos ? 'Servicios incluidos' : 'Servicios'}>
        {servicios.length > 0 ? (
          <ul className="space-y-3">
            {servicios.map((clave) => (
              <ItemConIcono key={clave} Icono={ICONOS[clave]}>
                {SERVICIOS[clave]}
              </ItemConIcono>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-700">
            La renta no incluye servicios. Pregunta al 2nd HOST cuánto se paga en promedio al mes.
          </p>
        )}
      </SeccionPlegable>

      <SeccionPlegable titulo={esHabitacion ? 'Tu habitación' : 'Tu espacio'}>
        <ul className="space-y-3">
          {amenidades.map((clave) => (
            <ItemConIcono key={clave} Icono={ICONOS[clave]}>
              {AMENIDADES[clave]}
            </ItemConIcono>
          ))}
        </ul>
      </SeccionPlegable>

      <SeccionPlegable titulo="Reglas de la casa">
        <ul className="space-y-3">
          {reglas.map((clave) => (
            <ItemConIcono key={clave} Icono={ICONOS[clave]}>
              {REGLAS[clave]}
            </ItemConIcono>
          ))}
          <ItemConIcono Icono={LuUserRound}>{GENEROS[genero]}</ItemConIcono>
          <ItemConIcono Icono={LuFileText}>Contrato de {contratoMeses} meses</ItemConIcono>
        </ul>
      </SeccionPlegable>
    </div>
  )
}

/* ==========================================================
   Reseñas
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

function Resenas({ propiedad }) {
  const { id, calificacion, numResenas } = propiedad
  const lista = resenasDePropiedad(id)

  return (
    // scroll-mt-24: al saltar a #resenas, el título no queda oculto bajo el Navbar fijo
    <section id="resenas" aria-labelledby="titulo-resenas" className="mt-10 scroll-mt-24">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="titulo-resenas" className="text-xl font-bold text-gray-900">
          Lo que se dice en los pasillos
        </h2>
        {calificacion && (
          <p className="flex items-center gap-1 text-sm">
            <FaStar className="h-4 w-4 text-home-orange-400" aria-hidden="true" />
            <span className="font-semibold text-gray-900">{calificacion.toFixed(1)}</span>
            <span className="text-gray-700">de 5, {plural(numResenas, 'reseña', 'reseñas')}</span>
          </p>
        )}
      </div>

      {lista.length === 0 ? (
        <p className="mt-4 rounded-3xl border border-home-orange-100 bg-white p-6 text-sm text-gray-700">
          Este lugar todavía no tiene reseñas. Quienes vivan aquí podrán dejar la suya desde su perfil.
        </p>
      ) : (
        <ul className="mt-4 space-y-4">
          {lista.map((resena) => (
            <li key={resena.id} className="rounded-3xl border border-home-orange-100 bg-white p-5">
              <div className="flex items-center gap-3">
                <Avatar src={resena.avatar} nombre={resena.autorNombre} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900">{resena.autorNombre}</p>
                  <p className="text-xs text-gray-600">{resena.autorCarrera}</p>
                </div>
                <time dateTime={resena.fecha} className="shrink-0 text-xs text-gray-600">
                  {formatoMesAnio(resena.fecha)}
                </time>
              </div>
              <div className="mt-3">
                <Estrellas valor={resena.calificacion} />
                <span className="sr-only">{resena.calificacion} de 5 estrellas</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-gray-800">{resena.comentario}</p>
            </li>
          ))}
        </ul>
      )}

      {/* En mockData no todas las reseñas tienen texto escrito */}
      {lista.length > 0 && lista.length < numResenas && (
        <p className="mt-3 text-xs text-gray-600">
          Mostrando {lista.length} de {numResenas} reseñas.
        </p>
      )}
    </section>
  )
}

/* ==========================================================
   Propiedad no encontrada
   ========================================================== */
function PropiedadNoEncontrada() {
  return (
    <main className="mx-auto max-w-xl px-4 py-16 text-center">
      <LuHouse className="mx-auto h-12 w-12 text-home-orange-400" aria-hidden="true" />
      <h1 className="mt-4 text-2xl font-bold text-gray-900">No encontramos esta propiedad</h1>
      <p className="mt-2 text-gray-700">Puede que ya no esté publicada o que el enlace tenga un error.</p>
      <Link
        to="/"
        className={`mt-6 inline-block rounded-full bg-home-orange-700 px-6 py-3 font-semibold text-white transition-colors hover:bg-home-orange-800 ${ENFOQUE}`}
      >
        Ver lugares disponibles
      </Link>
    </main>
  )
}

/* ==========================================================
   Página principal
   ========================================================== */
export default function DetallePropiedad() {
  const { id } = useParams()
  const propiedad = obtenerPropiedad(id)

  const esAdmin = usuarioActual?.rol === 'admin'
  const esDueno = usuarioActual?.id === propiedad?.arrendador.id

  // Solo las propiedades aprobadas son públicas.
  // El administrador y el dueño pueden ver las demás como vista previa.
  if (!propiedad || (propiedad.estado !== 'approved' && !esAdmin && !esDueno)) {
    return <PropiedadNoEncontrada />
  }

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-6 md:px-8">
      {propiedad.estado !== 'approved' && (
        <p role="status" className="mb-4 rounded-2xl border border-home-orange-300 bg-home-orange-100 p-4 text-sm text-home-orange-900">
          <strong>Vista previa.</strong> Esta propiedad está en estado "{ESTADOS_REVISION[propiedad.estado]}" y
          no aparece en el catálogo público.
        </p>
      )}

      <Link
        to="/"
        className={`inline-flex items-center gap-2 rounded text-sm font-semibold text-home-orange-800 hover:text-home-orange-900 ${ENFOQUE}`}
      >
        <LuArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver a Alojamiento
      </Link>

      {/* Móvil: todo en una columna, en el orden del código.
          Escritorio: la columna derecha (aside) ocupa dos filas junto al contenido principal. */}
      <div className="mt-4 grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          {/* key: reinicia la galería al cambiar de propiedad */}
          <Galeria key={propiedad.id} imagenes={propiedad.imagenes} titulo={propiedad.titulo} />
          <Encabezado propiedad={propiedad} />
        </div>

        <aside className="space-y-4 lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1">
          <TarjetaRenta propiedad={propiedad} />
          <TarjetaAnfitrion arrendador={propiedad.arrendador} />
          <Mapa propiedad={propiedad} />
        </aside>

        <div className="lg:col-span-7">
          <Detalles propiedad={propiedad} />
          <Resenas propiedad={propiedad} />
        </div>
      </div>
    </main>
  )
}