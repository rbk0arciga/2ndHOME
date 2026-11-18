import { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { LuShieldCheck, LuClock, LuInfo, LuLoader, LuUpload } from 'react-icons/lu'
import SubirDocumento from './SubirDocumento'
import DialogoAviso from './DialogoAviso'
import { db } from '../firebase/config'
import { guardarDocumento } from '../utils/documentos'

const ENFOQUE =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-home-orange-500'

const ESTADOS = {
  sin_enviar: {
    Icono: LuUpload,
    titulo: 'Verifica tu identidad para publicar',
    texto:
      'Antes de publicar, sube una identificación oficial (INE o pasaporte) y un comprobante de domicilio del inmueble que rentas (luz, agua o predial). El equipo los revisará junto con tu propiedad.',
    clase: 'border-home-orange-300 bg-white',
  },
  en_revision: {
    Icono: LuClock,
    titulo: 'Tus documentos están en revisión',
    texto: 'Ya puedes publicar. El equipo revisará tus documentos junto con tu propiedad y después los borrará.',
    clase: 'border-home-orange-200 bg-home-orange-50',
  },
  aprobados: {
    Icono: LuShieldCheck,
    titulo: 'Identidad verificada',
    texto: 'El equipo revisó tus documentos y ya los borró.',
    clase: 'border-green-200 bg-green-50',
  },
  rechazados: {
    Icono: LuInfo,
    titulo: 'Tus documentos necesitan correcciones',
    texto: 'Revisa el motivo y súbelos de nuevo para poder publicar.',
    clase: 'border-red-200 bg-red-50',
  },
}

// Sección del perfil propio del 2nd HOST para subir sus documentos de verificación
export default function VerificacionAnfitrion({ usuario }) {
  const estado = usuario.documentosEstado ?? 'sin_enviar'
  const { Icono, titulo, texto, clase } = ESTADOS[estado] ?? ESTADOS.sin_enviar
  const puedeSubir = estado === 'sin_enviar' || estado === 'rechazados'

  const [identificacion, setIdentificacion] = useState(null)
  const [comprobante, setComprobante] = useState(null)
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [avisoAbierto, setAvisoAbierto] = useState(false)

  const enviar = async (e) => {
    e.preventDefault()
    const nuevosErrores = {}
    if (!identificacion) nuevosErrores.identificacion = 'Sube tu identificación oficial.'
    if (!comprobante) nuevosErrores.comprobante = 'Sube tu comprobante de domicilio.'
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    setEnviando(true)
    setErrorGeneral('')
    try {
      await guardarDocumento(usuario.id, 'identificacion', identificacion)
      await guardarDocumento(usuario.id, 'comprobanteDomicilio', comprobante)
      await updateDoc(doc(db, 'usuarios', usuario.id), { documentosEstado: 'en_revision' })
      setIdentificacion(null)
      setComprobante(null)
    } catch {
      setErrorGeneral('No pudimos enviar tus documentos. Revisa tu conexión e inténtalo de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section
      id="verificacion"
      aria-labelledby="titulo-verificacion"
      className={`mt-12 scroll-mt-24 rounded-3xl border-2 p-6 md:p-8 ${clase}`}
    >
      <div className="flex items-start gap-3">
        <Icono className="mt-0.5 h-6 w-6 shrink-0 text-home-orange-700" aria-hidden="true" />
        <div>
          <h2 id="titulo-verificacion" className="text-xl font-bold text-gray-900">
            {titulo}
          </h2>
          <p className="mt-1 max-w-prose text-sm text-gray-700">{texto}</p>
        </div>
      </div>

      {estado === 'rechazados' && usuario.motivoDocumentos && (
        <p className="mt-4 rounded-xl bg-white p-3 text-sm text-red-800">
          <span className="font-semibold">Motivo:</span> {usuario.motivoDocumentos}
        </p>
      )}

      {puedeSubir && (
        <form onSubmit={enviar} noValidate className="mt-6 space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <SubirDocumento
              etiqueta="Identificación oficial"
              ayuda="INE o pasaporte vigente, por el frente."
              valor={identificacion}
              onCambiar={(documento) => {
                setIdentificacion(documento)
                setErrores((prev) => ({ ...prev, identificacion: undefined }))
              }}
              error={errores.identificacion}
            />
            <SubirDocumento
              etiqueta="Comprobante de domicilio"
              ayuda="Recibo de luz, agua o predial del inmueble que rentas."
              valor={comprobante}
              onCambiar={(documento) => {
                setComprobante(documento)
                setErrores((prev) => ({ ...prev, comprobante: undefined }))
              }}
              error={errores.comprobante}
            />
          </div>

          <p className="text-xs text-gray-600">
            Solo los verá el equipo de 2nd HOME y los borraremos al terminar la revisión, como explica el{' '}
            <button
              type="button"
              onClick={() => setAvisoAbierto(true)}
              className={`rounded font-semibold text-home-orange-800 underline underline-offset-4 hover:text-home-orange-900 ${ENFOQUE}`}
            >
              aviso de privacidad
            </button>
            .
          </p>

          {errorGeneral && (
            <p role="alert" className="text-sm font-medium text-red-700">
              {errorGeneral}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className={`inline-flex h-12 items-center justify-center gap-2 rounded-full bg-home-orange-700 px-8 font-semibold text-white transition-colors hover:bg-home-orange-800 disabled:cursor-wait disabled:opacity-80 ${ENFOQUE}`}
          >
            {enviando && <LuLoader className="h-5 w-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
            {enviando ? 'Enviando…' : 'Enviar documentos'}
          </button>
        </form>
      )}

      <DialogoAviso abierto={avisoAbierto} onCerrar={() => setAvisoAbierto(false)} />
    </section>
  )
}