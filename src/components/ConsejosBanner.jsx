import { useEffect, useRef, useState } from 'react'
import { LuChevronLeft, LuChevronRight, LuPause, LuPlay, LuLightbulb } from 'react-icons/lu'
import { consejos } from '../data/mockData'

const INTERVALO_MS = 6000 // Tiempo que permanece cada consejo
const DISTANCIA_DESLIZAR = 50 // Píxeles mínimos para considerar un deslizamiento en móvil

const ENFOQUE =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-home-orange-500'

// true si el usuario configuró su sistema para reducir animaciones
const prefiereMenosMovimiento = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function ConsejosBanner() {
  const [actual, setActual] = useState(0)
  // Si el sistema pide menos movimiento, el carrusel inicia pausado
  const [pausado, setPausado] = useState(prefiereMenosMovimiento)
  // Pausa temporal mientras el mouse o el foco del teclado están sobre el banner
  const [interactuando, setInteractuando] = useState(false)
  const [imagenesFallidas, setImagenesFallidas] = useState({})
  const inicioToque = useRef(null)
  const total = consejos.length

  const irA = (indice) => setActual((indice + total) % total)

  // Avance automático. Se reinicia cada vez que cambia el consejo,
  // así una navegación manual siempre da 6 segundos completos de lectura.
  useEffect(() => {
    if (pausado || interactuando || total < 2) return
    const temporizador = setTimeout(() => setActual((a) => (a + 1) % total), INTERVALO_MS)
    return () => clearTimeout(temporizador)
  }, [actual, pausado, interactuando, total])

  // Deslizar con el dedo en móvil
  const alIniciarToque = (e) => {
    inicioToque.current = e.touches[0].clientX
  }
  const alTerminarToque = (e) => {
    if (inicioToque.current === null) return
    const diferencia = e.changedTouches[0].clientX - inicioToque.current
    if (Math.abs(diferencia) > DISTANCIA_DESLIZAR) irA(actual + (diferencia < 0 ? 1 : -1))
    inicioToque.current = null
  }

  const claseFlecha = `absolute top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-home-orange-800 transition-colors hover:bg-white sm:grid ${ENFOQUE}`

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Consejos para estudiantes foráneos"
      className="mx-auto max-w-7xl px-4 pt-4 md:px-8 md:pt-6"
    >
      <div
        className="relative h-52 overflow-hidden rounded-3xl bg-home-orange-100 sm:h-56 md:h-64"
        onMouseEnter={() => setInteractuando(true)}
        onMouseLeave={() => setInteractuando(false)}
        onFocus={() => setInteractuando(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setInteractuando(false)
        }}
        onTouchStart={alIniciarToque}
        onTouchEnd={alTerminarToque}
      >
        {/* Diapositivas apiladas: solo la activa es visible (transición de opacidad) */}
        {consejos.map((consejo, indice) => {
          const activo = indice === actual
          const sinImagen = !consejo.imagen || imagenesFallidas[consejo.id]

          return (
            <article
              key={consejo.id}
              aria-roledescription="diapositiva"
              aria-label={`${indice + 1} de ${total}`}
              aria-hidden={!activo}
              inert={!activo}
              className={`absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none ${
                activo ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {sinImagen ? (
                // Respaldo cuando la imagen no existe o no carga
                <div className="absolute inset-0 bg-home-orange-200">
                  <LuLightbulb
                    className="absolute -bottom-10 -right-6 h-56 w-56 text-home-orange-300"
                    aria-hidden="true"
                  />
                </div>
              ) : (
                <>
                  <img
                    src={consejo.imagen}
                    alt=""
                    onError={() => setImagenesFallidas((prev) => ({ ...prev, [consejo.id]: true }))}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  {/* Degradado cálido para que el texto se lea sobre cualquier foto */}
                  <div className="absolute inset-0 bg-linear-to-r from-home-orange-900/90 via-home-orange-900/60 to-transparent" />
                </>
              )}

              <div className="relative flex h-full max-w-xl flex-col justify-center gap-2 px-6 pb-8 sm:px-16">
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-home-orange-800">
                  <LuLightbulb className="h-3.5 w-3.5" aria-hidden="true" />
                  Consejo
                </span>
                <h2
                  className={`text-xl font-bold leading-tight sm:text-2xl md:text-3xl ${
                    sinImagen ? 'text-home-orange-900' : 'text-white'
                  }`}
                >
                  {consejo.titulo}
                </h2>
                <p
                  className={`line-clamp-3 text-sm sm:text-base ${
                    sinImagen ? 'text-home-orange-900' : 'text-white/90'
                  }`}
                >
                  {consejo.texto}
                </p>
              </div>
            </article>
          )
        })}

        {/* Flechas (solo en tablet y escritorio; en móvil se desliza) */}
        <button type="button" onClick={() => irA(actual - 1)} aria-label="Consejo anterior" className={`${claseFlecha} left-3`}>
          <LuChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <button type="button" onClick={() => irA(actual + 1)} aria-label="Consejo siguiente" className={`${claseFlecha} right-3`}>
          <LuChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* Pausar o reanudar el avance automático */}
        <button
          type="button"
          onClick={() => setPausado((valor) => !valor)}
          aria-label={pausado ? 'Reanudar consejos' : 'Pausar consejos'}
          className={`absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-home-orange-800 transition-colors hover:bg-white ${ENFOQUE}`}
        >
          {pausado ? <LuPlay className="h-4 w-4" aria-hidden="true" /> : <LuPause className="h-4 w-4" aria-hidden="true" />}
        </button>

        {/* Indicadores de posición */}
        <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1">
          {consejos.map((consejo, indice) => (
            <button
              key={consejo.id}
              type="button"
              onClick={() => irA(indice)}
              aria-label={`Ir al consejo ${indice + 1}`}
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
      </div>
    </section>
  )
}