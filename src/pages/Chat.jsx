import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { LuArrowLeft, LuSend, LuMessageCircle, LuInfo, LuFlag } from 'react-icons/lu'
import Avatar from '../components/Avatar'
import ChatBubble from '../components/ChatBubble'
import { useSesion } from '../context/sesion'
import { conversaciones as conversacionesMock, usuarios, obtenerPropiedad } from '../data/mockData'

const ENFOQUE =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-home-orange-500'

// Mensajes sugeridos para iniciar una conversación nueva (solo 2nd GUESTS)
const SUGERENCIAS = [
  'Hola, ¿el lugar sigue disponible?',
  '¿Podría agendar una visita?',
  '¿Qué servicios incluye la renta?',
]

/* ==========================================================
   Utilidades de fecha
   ========================================================== */
const formatoHora = (fecha) =>
  new Date(fecha).toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' })

const mismoDia = (a, b) => a.toDateString() === b.toDateString()

// "Hoy", "Ayer" o "28 de septiembre"
function etiquetaDia(fecha) {
  const dia = new Date(fecha)
  const hoy = new Date()
  const ayer = new Date()
  ayer.setDate(hoy.getDate() - 1)

  if (mismoDia(dia, hoy)) return 'Hoy'
  if (mismoDia(dia, ayer)) return 'Ayer'
  return dia.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })
}

// En la lista: la hora si el mensaje es de hoy; si no, la fecha corta ("28 sept")
function fechaCorta(fecha) {
  const dia = new Date(fecha)
  return mismoDia(dia, new Date())
    ? formatoHora(fecha)
    : dia.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}

// Agrupa los mensajes por día para mostrar separadores ("Hoy", "Ayer"...)
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

/* ==========================================================
   Utilidades de conversaciones
   ========================================================== */
// La otra persona de la conversación, según quién está viendo el chat
function contactoDe(conversacion, usuario) {
  if (usuario.rol === 'arrendador') {
    const estudiante = usuarios.find((u) => u.id === conversacion.estudianteId)
    return {
      id: conversacion.estudianteId,
      nombre: estudiante?.nombre ?? '2nd GUEST',
      avatar: estudiante?.avatar,
    }
  }
  return conversacion.arrendador
}

// Conversaciones del usuario. Si llega desde una propiedad (?propiedad=p1) y aún
// no existe conversación sobre ella, se crea una vacía al principio de la lista.
function cargarConversaciones(usuario, propiedadId) {
  const propias = conversacionesMock
    .filter((c) => (usuario.rol === 'arrendador' ? c.arrendador.id === usuario.id : c.estudianteId === usuario.id))
    .map((c) => ({ ...c, mensajes: [...c.mensajes] })) // Copia: los cambios no alteran mockData

  if (usuario.rol !== 'estudiante' || !propiedadId) return propias
  if (propias.some((c) => c.propiedadId === propiedadId)) return propias

  const propiedad = obtenerPropiedad(propiedadId)
  if (!propiedad || propiedad.estado !== 'approved') return propias

  const nueva = {
    id: `nueva-${propiedadId}`,
    estudianteId: usuario.id,
    arrendador: propiedad.arrendador,
    propiedadId,
    noLeidos: 0,
    mensajes: [],
  }
  return [nueva, ...propias]
}

/* ==========================================================
   Lista de conversaciones
   ========================================================== */
function ListaConversaciones({ conversaciones, usuario, seleccionadaId, onSeleccionar }) {
  return (
    <ul className="divide-y divide-home-orange-100">
      {conversaciones.map((conversacion) => {
        const contacto = contactoDe(conversacion, usuario)
        const propiedad = obtenerPropiedad(conversacion.propiedadId)
        const ultimo = conversacion.mensajes.at(-1)
        const activa = conversacion.id === seleccionadaId
        const tieneNoLeidos = conversacion.noLeidos > 0

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
                  {ultimo && <span className="shrink-0 text-xs text-gray-600">{fechaCorta(ultimo.fecha)}</span>}
                </span>
                <span className="block truncate text-xs text-home-orange-800">{propiedad?.titulo}</span>
                <span className="mt-0.5 flex items-center gap-2">
                  <span className={`truncate text-sm ${tieneNoLeidos ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                    {ultimo
                      ? `${ultimo.autorId === usuario.id ? 'Tú: ' : ''}${ultimo.texto}`
                      : 'Nueva conversación'}
                  </span>
                  {tieneNoLeidos && (
                    <span className="ml-auto grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-home-orange-700 px-1.5 text-xs font-semibold text-white">
                      <span className="sr-only">Mensajes sin leer: </span>
                      {conversacion.noLeidos}
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
   Reporte de conversación (con confirmación)
   ========================================================== */
function BarraReporte({ estado, onConfirmar, onCancelar }) {
  if (estado === 'confirmando') {
    return (
      <div role="alertdialog" aria-labelledby="texto-reporte" className="border-b border-home-orange-100 bg-home-orange-50 px-4 py-3 sm:px-5">
        <p id="texto-reporte" className="text-sm text-gray-800">
          ¿Reportar esta conversación? El equipo de 2nd HOME revisará los mensajes.
        </p>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={onConfirmar}
            className={`rounded-full bg-home-orange-700 px-4 py-1.5 text-sm font-semibold text-white hover:bg-home-orange-800 ${ENFOQUE}`}
          >
            Reportar
          </button>
          <button
            type="button"
            onClick={onCancelar}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold text-home-orange-800 hover:bg-home-orange-100 ${ENFOQUE}`}
          >
            Cancelar
          </button>
        </div>
      </div>
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
function VentanaConversacion({ conversacion, usuario, onEnviar, onVolver }) {
  const [texto, setTexto] = useState('')
  const [estadoReporte, setEstadoReporte] = useState('ninguno') // 'ninguno' | 'confirmando' | 'enviado'
  const zonaMensajesRef = useRef(null)
  const campoRef = useRef(null)

  const contacto = contactoDe(conversacion, usuario)
  const propiedad = obtenerPropiedad(conversacion.propiedadId)
  const grupos = agruparPorDia(conversacion.mensajes)

  // Baja hasta el último mensaje al abrir la conversación y cada vez que llega uno nuevo
  useEffect(() => {
    const zona = zonaMensajesRef.current
    if (zona) zona.scrollTop = zona.scrollHeight
  }, [conversacion.mensajes.length])

  const enviar = () => {
    const limpio = texto.trim()
    if (!limpio) return
    onEnviar(conversacion.id, limpio)
    setTexto('')
    campoRef.current?.focus()
  }

  // Enter envía; Shift + Enter hace un salto de línea
  const alPresionarTecla = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviar()
    }
  }

  // Las sugerencias llenan el campo para que el usuario pueda editarlas antes de enviar
  const usarSugerencia = (sugerencia) => {
    setTexto(sugerencia)
    campoRef.current?.focus()
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
          {propiedad && (
            <Link
              to={`/propiedad/${propiedad.id}`}
              className={`block truncate rounded text-xs font-medium text-home-orange-800 underline underline-offset-2 hover:text-home-orange-900 ${ENFOQUE}`}
            >
              {propiedad.titulo}
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={() => setEstadoReporte('confirmando')}
          disabled={estadoReporte !== 'ninguno'}
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-home-orange-50 disabled:cursor-default disabled:opacity-60 ${ENFOQUE}`}
        >
          <LuFlag className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">{estadoReporte === 'enviado' ? 'Reportada' : 'Reportar'}</span>
        </button>
      </header>

      <BarraReporte
        estado={estadoReporte}
        onConfirmar={() => setEstadoReporte('enviado')}
        onCancelar={() => setEstadoReporte('ninguno')}
      />

      {/* Mensajes */}
      <div ref={zonaMensajesRef} className="min-h-0 flex-1 overflow-y-auto bg-home-orange-50 px-3 py-4 sm:px-5">
        <p className="mx-auto mb-4 flex max-w-md items-start gap-2 rounded-2xl bg-white p-3 text-xs text-gray-700">
          <LuInfo className="mt-0.5 h-4 w-4 shrink-0 text-home-orange-600" aria-hidden="true" />
          Mantén la conversación dentro de 2nd HOME y no transfieras dinero antes de visitar el lugar.
        </p>

        {grupos.length === 0 ? (
          // Conversación nueva: sugerencias para empezar
          <div className="mx-auto mt-8 max-w-sm text-center">
            <p className="text-sm text-gray-700">
              Escríbele a {contacto.nombre.split(' ')[0]} para preguntar por el lugar.
            </p>
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
        className="flex items-end gap-2 border-t border-home-orange-100 bg-white p-3 sm:px-5"
      >
        <label htmlFor="campo-mensaje" className="sr-only">
          Escribe un mensaje
        </label>
        {/* field-sizing-content: el campo crece con el texto (hasta max-h-32) */}
        <textarea
          id="campo-mensaje"
          ref={campoRef}
          rows={1}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={alPresionarTecla}
          placeholder="Escribe un mensaje…"
          className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border-2 border-home-orange-200 bg-white px-4 py-2.5 text-sm text-gray-900 field-sizing-content placeholder:text-gray-500 focus:border-home-orange-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!texto.trim()}
          aria-label="Enviar mensaje"
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-full bg-home-orange-700 text-white transition-colors hover:bg-home-orange-800 disabled:cursor-not-allowed disabled:bg-home-orange-200 disabled:text-home-orange-700 ${ENFOQUE}`}
        >
          <LuSend className="h-5 w-5" aria-hidden="true" />
        </button>
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
  const [parametros] = useSearchParams()
  const propiedadId = parametros.get('propiedad')

  // MAQUETA: las conversaciones viven en el estado de esta página.
  // Con Firebase se leerán y escribirán en Firestore en tiempo real (onSnapshot).
  const [conversaciones, setConversaciones] = useState(() => cargarConversaciones(usuario, propiedadId))

  // Si llegó desde una propiedad, esa conversación empieza abierta
  const [seleccionadaId, setSeleccionadaId] = useState(
    () => conversaciones.find((c) => c.propiedadId === propiedadId)?.id ?? null
  )

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

  // Abre una conversación y la marca como leída
  const seleccionar = (id) => {
    setSeleccionadaId(id)
    setConversaciones((prev) => prev.map((c) => (c.id === id ? { ...c, noLeidos: 0 } : c)))
  }

  const enviarMensaje = (conversacionId, texto) => {
    const nuevoMensaje = {
      id: `m-${Date.now()}`,
      autorId: usuario.id,
      texto,
      fecha: new Date().toISOString(),
    }
    setConversaciones((prev) =>
      prev.map((c) => (c.id === conversacionId ? { ...c, mensajes: [...c.mensajes, nuevoMensaje] } : c))
    )
  }

  const seleccionada = conversaciones.find((c) => c.id === seleccionadaId)

  return (
    <main className="mx-auto max-w-7xl px-4 pb-6 pt-4 md:px-8 md:pt-6">
      <h1 className="sr-only">Mensajes</h1>

      {/* Altura fija según la pantalla, para que solo los mensajes hagan scroll */}
      <div className="flex h-[calc(100dvh-10rem)] min-h-[26rem] overflow-hidden rounded-3xl border border-home-orange-200 bg-white md:h-[calc(100dvh-12rem)]">
        {/* Lista: en móvil se oculta cuando hay una conversación abierta */}
        <div
          className={`${
            seleccionada ? 'hidden' : 'flex'
          } w-full flex-col border-home-orange-100 md:flex md:w-80 md:shrink-0 md:border-r lg:w-96`}
        >
          <h2 className="border-b border-home-orange-100 px-4 py-4 text-lg font-bold text-gray-900">Mensajes</h2>
          <div className="flex-1 overflow-y-auto">
            {conversaciones.length > 0 ? (
              <ListaConversaciones
                conversaciones={conversaciones}
                usuario={usuario}
                seleccionadaId={seleccionadaId}
                onSeleccionar={seleccionar}
              />
            ) : (
              <SinConversaciones rol={usuario.rol} />
            )}
          </div>
        </div>

        {/* Conversación: en móvil solo se ve cuando hay una abierta */}
        <div className={`${seleccionada ? 'flex' : 'hidden'} min-w-0 flex-1 flex-col md:flex`}>
          {seleccionada ? (
            // key: al cambiar de conversación se reinician el campo de texto y el reporte
            <VentanaConversacion
              key={seleccionada.id}
              conversacion={seleccionada}
              usuario={usuario}
              onEnviar={enviarMensaje}
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