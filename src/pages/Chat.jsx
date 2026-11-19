import { useEffect, useId, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { LuArrowLeft, LuSend, LuMessageCircle, LuInfo, LuFlag, LuLoader } from 'react-icons/lu'
import Avatar from '../components/Avatar'
import ChatBubble from '../components/ChatBubble'
import EtiquetaAspirante from '../components/EtiquetaAspirante'
import { useSesion } from '../context/sesion'
import { usePropiedades } from '../context/propiedades'
import { db } from '../firebase/config'
import { escucharConversaciones, escucharMensajes, enviarMensaje, marcarLeida, idConversacion } from '../firebase/chat'
import { MOTIVOS_REPORTE } from '../data/mockData'

const ENFOQUE =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-home-orange-500'

// Mensajes sugeridos para iniciar una conversación nueva (solo 2nd GUESTS)
const SUGERENCIAS = [
  'Hola, ¿el lugar sigue disponible?',
  '¿Podría agendar una visita?',
  '¿Qué servicios incluye la renta?',
]

/* ==========================================================
   Utilidades de fecha (las fechas llegan como texto ISO)
   ========================================================== */
const formatoHora = (iso) => new Date(iso).toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' })

const mismoDia = (a, b) => a.toDateString() === b.toDateString()

// "Hoy", "Ayer" o "28 de septiembre"
function etiquetaDia(iso) {
  const dia = new Date(iso)
  const hoy = new Date()
  const ayer = new Date()
  ayer.setDate(hoy.getDate() - 1)
  if (mismoDia(dia, hoy)) return 'Hoy'
  if (mismoDia(dia, ayer)) return 'Ayer'
  return dia.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })
}

// En la lista: la hora si es de hoy; si no, la fecha corta
function fechaCorta(iso) {
  const dia = new Date(iso)
  return mismoDia(dia, new Date()) ? formatoHora(iso) : dia.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}

function agruparPorDia(mensajes) {
  const grupos = []
  mensajes.forEach((mensaje) => {
    const etiqueta = etiquetaDia(mensaje.fecha)
    const ultimoGrupo = grupos.at(-1)
    if (ultimoGrupo?.etiqueta === etiqueta) ultimoGrupo.mensajes.push(mensaje)
    else grupos.push({ etiqueta, mensajes: [mensaje] })
  })
  return grupos
}

// La otra persona de la conversación
const contactoDe = (conversacion, usuario) =>
  usuario.rol === 'arrendador' ? conversacion.estudiante : conversacion.arrendador

/* ==========================================================
   Lista de conversaciones
   ========================================================== */
function ListaConversaciones({ conversaciones, usuario, seleccionadaId, onSeleccionar }) {
  return (
    <ul className="divide-y divide-home-orange-100">
      {conversaciones.map((conversacion) => {
        const contacto = contactoDe(conversacion, usuario)
        const ultimo = conversacion.ultimoMensaje
        const activa = conversacion.id === seleccionadaId
        const noLeidos = conversacion.noLeidos?.[usuario.id] ?? 0

        return (
          <li key={conversacion.id}>
            <button
              type="button"
              onClick={() => onSeleccionar(conversacion.id)}
              aria-current={activa ? 'true' : undefined}
              className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-home-orange-500 ${
                activa ? 'bg-home-orange-100' : 'hover:bg-home-orange-50'
              }`}
            >
              <Avatar src={contacto.avatar} nombre={contacto.nombre} />
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="truncate font-semibold text-gray-900">{contacto.nombre}</span>
                  {ultimo && conversacion.actualizadoEn && (
                    <span className="shrink-0 text-xs text-gray-600">{fechaCorta(conversacion.actualizadoEn)}</span>
                  )}
                </span>
                <span className="block truncate text-xs text-home-orange-800">{conversacion.propiedadTitulo}</span>
                {contacto.aspirante && (
                  <span className="mt-1 block">
                    <EtiquetaAspirante />
                  </span>
                )}
                <span className="mt-0.5 flex items-center gap-2">
                  <span className={`truncate text-sm ${noLeidos > 0 ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                    {ultimo ? `${ultimo.autorId === usuario.id ? 'Tú: ' : ''}${ultimo.texto}` : 'Nueva conversación'}
                  </span>
                  {noLeidos > 0 && (
                    <span className="ml-auto grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-home-orange-700 px-1.5 text-xs font-semibold text-white">
                      <span className="sr-only">Mensajes sin leer: </span>
                      {noLeidos}
                    </span>
                  )}
                </span>
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

/* ==========================================================
   Reporte de conversación (con motivo)
   ========================================================== */
function BarraReporte({ estado, error, onConfirmar, onCancelar }) {
  const [motivo, setMotivo] = useState('')
  const [detalle, setDetalle] = useState('')
  const [errorMotivo, setErrorMotivo] = useState('')
  const nombreGrupo = useId()
  const idDetalle = useId()

  if (estado === 'confirmando') {
    const alEnviar = (e) => {
      e.preventDefault()
      if (!motivo) {
        setErrorMotivo('Elige un motivo.')
        return
      }
      onConfirmar({ motivo, descripcion: detalle.trim() })
    }

    return (
      <form onSubmit={alEnviar} noValidate className="space-y-3 border-b border-home-orange-100 bg-home-orange-50 px-4 py-3 sm:px-5">
        <fieldset>
          <legend className="text-sm font-semibold text-gray-900">¿Por qué reportas esta conversación?</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(MOTIVOS_REPORTE).map(([clave, etiqueta]) => (
              <label key={clave} className="cursor-pointer">
                <input
                  type="radio"
                  name={nombreGrupo}
                  checked={motivo === clave}
                  onChange={() => {
                    setMotivo(clave)
                    setErrorMotivo('')
                  }}
                  className="peer sr-only"
                />
                <span className="block rounded-full border border-home-orange-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 transition-colors hover:border-home-orange-400 peer-checked:border-home-orange-700 peer-checked:bg-home-orange-700 peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-home-orange-500">
                  {etiqueta}
                </span>
              </label>
            ))}
          </div>
          {errorMotivo && <p className="mt-1.5 text-sm font-medium text-red-700">{errorMotivo}</p>}
        </fieldset>

        <div>
          <label htmlFor={idDetalle} className="text-sm font-semibold text-gray-900">
            Detalles <span className="font-normal text-gray-600">(opcional)</span>
          </label>
          <textarea
            id={idDetalle}
            rows={2}
            value={detalle}
            onChange={(e) => setDetalle(e.target.value)}
            className="mt-1 w-full resize-y rounded-xl border-2 border-home-orange-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-home-orange-500 focus:outline-none"
          />
        </div>

        <p className="text-xs text-gray-700">El equipo de 2nd HOME revisará los mensajes de esta conversación.</p>
        {error && <p className="text-sm font-medium text-red-700">{error}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            className={`rounded-full bg-home-orange-700 px-4 py-1.5 text-sm font-semibold text-white hover:bg-home-orange-800 ${ENFOQUE}`}
          >
            Enviar reporte
          </button>
          <button
            type="button"
            onClick={onCancelar}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold text-home-orange-800 hover:bg-home-orange-100 ${ENFOQUE}`}
          >
            Cancelar
          </button>
        </div>
      </form>
    )
  }

  if (estado === 'enviado') {
    return (
      <p role="status" className="border-b border-home-orange-100 bg-home-orange-50 px-4 py-3 text-sm text-home-orange-900 sm:px-5">
        Reporte enviado. El equipo de 2nd HOME revisará esta conversación.
      </p>
    )
  }

  return null
}

/* ==========================================================
   Ventana de una conversación
   ========================================================== */
function VentanaConversacion({ conversacion, usuario, onVolver }) {
  const [mensajes, setMensajes] = useState([])
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState('')
  const [estadoReporte, setEstadoReporte] = useState('ninguno') // 'ninguno' | 'confirmando' | 'enviado'
  const [errorReporte, setErrorReporte] = useState('')
  const zonaMensajesRef = useRef(null)
  const campoRef = useRef(null)

  const contacto = contactoDe(conversacion, usuario)
  const esNueva = Boolean(conversacion.nueva)
  const misNoLeidos = conversacion.noLeidos?.[usuario.id] ?? 0

  // Mensajes en tiempo real (una conversación nueva todavía no tiene)
  useEffect(() => {
    if (esNueva) return
    return escucharMensajes(conversacion.id, setMensajes)
  }, [conversacion.id, esNueva])

  // Al abrirla o al llegar mensajes nuevos con la conversación abierta, se marcan como leídos
  useEffect(() => {
    if (esNueva || misNoLeidos === 0) return
    marcarLeida(conversacion.id, usuario.id).catch((error) => console.error('No se pudo marcar como leída:', error.code))
  }, [conversacion.id, esNueva, misNoLeidos, usuario.id])

  // Baja hasta el último mensaje
  useEffect(() => {
    const zona = zonaMensajesRef.current
    if (zona) zona.scrollTop = zona.scrollHeight
  }, [mensajes.length])

  const grupos = agruparPorDia(mensajes)

  const enviar = async () => {
    const limpio = texto.trim()
    if (!limpio || enviando) return
    setEnviando(true)
    setErrorEnvio('')
    try {
      await enviarMensaje({ conversacion, autorId: usuario.id, texto: limpio, esNueva })
      setTexto('')
      campoRef.current?.focus()
    } catch (error) {
      console.error('No se pudo enviar el mensaje:', error.code)
      setErrorEnvio('No pudimos enviar el mensaje. Inténtalo de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  // Enter envía; Shift + Enter hace un salto de línea
  const alPresionarTecla = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviar()
    }
  }

  const usarSugerencia = (sugerencia) => {
    setTexto(sugerencia)
    campoRef.current?.focus()
  }

  const enviarReporte = async ({ motivo, descripcion }) => {
    setErrorReporte('')
    try {
      await addDoc(collection(db, 'reportes'), {
        tipo: 'conversacion',
        motivo,
        descripcion: descripcion || MOTIVOS_REPORTE[motivo],
        reportadoPor: { id: usuario.id, nombre: usuario.nombre },
        reportado: { id: contacto.id, nombre: contacto.nombre },
        propiedadId: conversacion.propiedadId ?? null,
        estado: 'abierto',
        resolucion: '',
        fecha: serverTimestamp(),
      })
      setEstadoReporte('enviado')
    } catch {
      setErrorReporte('No pudimos enviar el reporte. Revisa tu conexión e inténtalo de nuevo.')
    }
  }

  return (
    <section aria-label={`Conversación con ${contacto.nombre}`} className="flex min-h-0 flex-1 flex-col">
      {/* Encabezado */}
      <header className="flex items-center gap-3 border-b border-home-orange-100 px-3 py-3 sm:px-5">
        <button
          type="button"
          onClick={onVolver}
          aria-label="Volver a las conversaciones"
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-home-orange-800 hover:bg-home-orange-50 md:hidden ${ENFOQUE}`}
        >
          <LuArrowLeft className="h-5 w-5" aria-hidden="true" />
        </button>

        <Avatar src={contacto.avatar} nombre={contacto.nombre} />

        <div className="min-w-0 flex-1">
          <h2 className="truncate font-semibold text-gray-900">{contacto.nombre}</h2>
          <Link
            to={`/propiedad/${conversacion.propiedadId}`}
            className={`block truncate rounded text-xs font-medium text-home-orange-800 underline underline-offset-2 hover:text-home-orange-900 ${ENFOQUE}`}
          >
            {conversacion.propiedadTitulo}
          </Link>
        </div>

        {!esNueva && (
          <button
            type="button"
            onClick={() => setEstadoReporte('confirmando')}
            disabled={estadoReporte !== 'ninguno'}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-home-orange-50 disabled:cursor-default disabled:opacity-60 ${ENFOQUE}`}
          >
            <LuFlag className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">{estadoReporte === 'enviado' ? 'Reportada' : 'Reportar'}</span>
          </button>
        )}
      </header>

      <BarraReporte
        estado={estadoReporte}
        error={errorReporte}
        onConfirmar={enviarReporte}
        onCancelar={() => {
          setEstadoReporte('ninguno')
          setErrorReporte('')
        }}
      />

      {/* Leyenda para el 2nd HOST cuando le escribe un aspirante */}
      {contacto.aspirante && usuario.rol === 'arrendador' && (
        <div className="border-b border-home-orange-100 bg-white px-4 py-3 sm:px-5">
          <EtiquetaAspirante detalle />
        </div>
      )}

      {/* Mensajes */}
      <div ref={zonaMensajesRef} className="min-h-0 flex-1 overflow-y-auto bg-home-orange-50 px-3 py-4 sm:px-5">
        <p className="mx-auto mb-4 flex max-w-md items-start gap-2 rounded-2xl bg-white p-3 text-xs text-gray-700">
          <LuInfo className="mt-0.5 h-4 w-4 shrink-0 text-home-orange-600" aria-hidden="true" />
          Mantén la conversación dentro de 2nd HOME y no transfieras dinero antes de visitar el lugar.
        </p>

        {grupos.length === 0 ? (
          <div className="mx-auto mt-8 max-w-sm text-center">
            <p className="text-sm text-gray-700">Escríbele a {contacto.nombre.split(' ')[0]} para preguntar por el lugar.</p>
            {usuario.rol === 'estudiante' && (
              <div className="mt-4 flex flex-col items-center gap-2">
                {SUGERENCIAS.map((sugerencia) => (
                  <button
                    key={sugerencia}
                    type="button"
                    onClick={() => usarSugerencia(sugerencia)}
                    className={`rounded-full border border-home-orange-200 bg-white px-4 py-2 text-sm text-home-orange-900 transition-colors hover:border-home-orange-400 ${ENFOQUE}`}
                  >
                    {sugerencia}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          grupos.map((grupo) => (
            <div key={grupo.etiqueta}>
              <p className="my-3 text-center text-xs font-medium text-gray-600">
                <span className="rounded-full bg-white px-3 py-1">{grupo.etiqueta}</span>
              </p>
              <ul className="space-y-2">
                {grupo.mensajes.map((mensaje) => (
                  <ChatBubble
                    key={mensaje.id}
                    texto={mensaje.texto}
                    fecha={mensaje.fecha}
                    hora={formatoHora(mensaje.fecha)}
                    esPropio={mensaje.autorId === usuario.id}
                    autor={contacto.nombre}
                  />
                ))}
              </ul>
            </div>
          ))
        )}
      </div>

      {/* Campo para escribir */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          enviar()
        }}
        className="border-t border-home-orange-100 bg-white p-3 sm:px-5"
      >
        {errorEnvio && (
          <p role="alert" className="mb-2 text-sm font-medium text-red-700">
            {errorEnvio}
          </p>
        )}
        <div className="flex items-end gap-2">
          <label htmlFor="campo-mensaje" className="sr-only">
            Escribe un mensaje
          </label>
          <textarea
            id="campo-mensaje"
            ref={campoRef}
            rows={1}
            maxLength={2000}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={alPresionarTecla}
            placeholder="Escribe un mensaje…"
            className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border-2 border-home-orange-200 bg-white px-4 py-2.5 text-sm text-gray-900 field-sizing-content placeholder:text-gray-500 focus:border-home-orange-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!texto.trim() || enviando}
            aria-label="Enviar mensaje"
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-full bg-home-orange-700 text-white transition-colors hover:bg-home-orange-800 disabled:cursor-not-allowed disabled:bg-home-orange-200 disabled:text-home-orange-700 ${ENFOQUE}`}
          >
            {enviando ? (
              <LuLoader className="h-5 w-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
            ) : (
              <LuSend className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </form>
    </section>
  )
}

/* ==========================================================
   Estados vacíos
   ========================================================== */
function SinConversaciones({ rol }) {
  return (
    <div className="px-6 py-10 text-center">
      <LuMessageCircle className="mx-auto h-10 w-10 text-home-orange-300" aria-hidden="true" />
      {rol === 'estudiante' ? (
        <>
          <p className="mt-3 text-sm text-gray-700">Aún no tienes conversaciones.</p>
          <Link
            to="/"
            className={`mt-3 inline-block rounded text-sm font-semibold text-home-orange-800 underline underline-offset-4 hover:text-home-orange-900 ${ENFOQUE}`}
          >
            Buscar un lugar en Alojamiento
          </Link>
        </>
      ) : (
        <p className="mt-3 text-sm text-gray-700">Cuando un 2nd GUEST te escriba, verás la conversación aquí.</p>
      )}
    </div>
  )
}

function SinSeleccion() {
  return (
    <div className="grid flex-1 place-items-center bg-home-orange-50 p-6 text-center">
      <div>
        <LuMessageCircle className="mx-auto h-12 w-12 text-home-orange-300" aria-hidden="true" />
        <p className="mt-3 text-gray-700">Elige una conversación para leer tus mensajes.</p>
      </div>
    </div>
  )
}

/* ==========================================================
   Página
   ========================================================== */
export default function Chat() {
  const { usuario } = useSesion()
  const { propiedades } = usePropiedades()
  const [parametros] = useSearchParams()
  const propiedadId = parametros.get('propiedad')
  const esEstudiante = usuario.rol === 'estudiante'

  const [conversaciones, setConversaciones] = useState([])
  const [cargando, setCargando] = useState(true)
  // Si llegó desde una propiedad, esa conversación empieza abierta
  const [seleccionadaId, setSeleccionadaId] = useState(() =>
    propiedadId && esEstudiante ? idConversacion(propiedadId, usuario.id) : null
  )

  useEffect(() => {
    if (usuario.rol === 'admin') return
    return escucharConversaciones(
      usuario.id,
      (lista) => {
        setConversaciones(lista)
        setCargando(false)
      },
      () => setCargando(false)
    )
  }, [usuario.id, usuario.rol])

  if (usuario.rol === 'admin') {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Mensajes</h1>
        <p className="mt-2 text-gray-700">
          La cuenta de administración no tiene chat. Los reportes de conversaciones se revisan desde el panel.
        </p>
      </main>
    )
  }

  // Conversación nueva (todavía sin guardar) si el 2nd GUEST llegó desde una propiedad sin conversación
  const idNueva = propiedadId && esEstudiante ? idConversacion(propiedadId, usuario.id) : null
  const propiedadNueva =
    idNueva && !conversaciones.some((c) => c.id === idNueva)
      ? propiedades.find((p) => p.id === propiedadId && p.estado === 'approved')
      : null
  const conversacionNueva = propiedadNueva
    ? {
        id: idNueva,
        nueva: true,
        propiedadId,
        propiedadTitulo: propiedadNueva.titulo,
        estudiante: {
          id: usuario.id,
          nombre: usuario.nombre,
          avatar: usuario.avatar ?? null,
          aspirante: usuario.aspirante ?? false,
        },
        arrendador: { ...propiedadNueva.arrendador, avatar: propiedadNueva.arrendador.avatar ?? null },
        participantes: [usuario.id, propiedadNueva.arrendador.id],
        noLeidos: {},
        ultimoMensaje: null,
        actualizadoEn: '',
      }
    : null

  const lista = conversacionNueva ? [conversacionNueva, ...conversaciones] : conversaciones
  const seleccionada = lista.find((c) => c.id === seleccionadaId)

  let contenidoLista
  if (cargando && lista.length === 0) {
    contenidoLista = (
      <p className="flex items-center gap-2 px-4 py-6 text-sm text-gray-700" aria-busy="true">
        <LuLoader className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
        Cargando conversaciones…
      </p>
    )
  } else if (lista.length > 0) {
    contenidoLista = (
      <ListaConversaciones
        conversaciones={lista}
        usuario={usuario}
        seleccionadaId={seleccionadaId}
        onSeleccionar={setSeleccionadaId}
      />
    )
  } else {
    contenidoLista = <SinConversaciones rol={usuario.rol} />
  }

  return (
    <main className="mx-auto max-w-7xl px-4 pb-6 pt-4 md:px-8 md:pt-6">
      <h1 className="sr-only">Mensajes</h1>

      <div className="flex h-[calc(100dvh-10rem)] min-h-[26rem] overflow-hidden rounded-3xl border border-home-orange-200 bg-white md:h-[calc(100dvh-12rem)]">
        {/* Lista: en móvil se oculta cuando hay una conversación abierta */}
        <div
          className={`${seleccionada ? 'hidden' : 'flex'} w-full flex-col border-home-orange-100 md:flex md:w-80 md:shrink-0 md:border-r lg:w-96`}
        >
          <h2 className="border-b border-home-orange-100 px-4 py-4 text-lg font-bold text-gray-900">Mensajes</h2>
          <div className="flex-1 overflow-y-auto">{contenidoLista}</div>
        </div>

        {/* Conversación: en móvil solo se ve cuando hay una abierta */}
        <div className={`${seleccionada ? 'flex' : 'hidden'} min-w-0 flex-1 flex-col md:flex`}>
          {seleccionada ? (
            <VentanaConversacion
              key={seleccionada.id}
              conversacion={seleccionada}
              usuario={usuario}
              onVolver={() => setSeleccionadaId(null)}
            />
          ) : (
            <SinSeleccion />
          )}
        </div>
      </div>
    </main>
  )
}