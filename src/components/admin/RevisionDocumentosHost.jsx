import { useEffect, useState } from 'react'
import { collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore'
import { LuLoader, LuInbox, LuX, LuCheck, LuExternalLink, LuFileText, LuEye } from 'react-icons/lu'
import Avatar from '../Avatar'
import FormularioMotivo from './FormularioMotivo'
import {
  ENFOQUE,
  CLASE_BOTON_PRINCIPAL,
  CLASE_BOTON_SECUNDARIO,
  CLASE_BOTON_PELIGRO,
  formatoMesAnio,
} from './estilos'
import { db } from '../../firebase/config'
import { leerDocumento, eliminarDocumento, abrirDocumento, TIPOS_DOCUMENTO } from '../../utils/documentos'

const DOCUMENTOS_HOST = ['identificacion', 'comprobanteDomicilio']

/* ---------- Muestra un documento (se descarga solo al pedirlo) ---------- */
function VisorDocumento({ uid, tipo, nombre }) {
  const [estado, setEstado] = useState('cargando')
  const [documento, setDocumento] = useState(null)

  useEffect(() => {
    let activo = true
    leerDocumento(uid, tipo)
      .then((resultado) => {
        if (!activo) return
        setDocumento(resultado)
        setEstado(resultado ? 'listo' : 'sin-archivo')
      })
      .catch(() => {
        if (activo) setEstado('error')
      })
    return () => {
      activo = false
    }
  }, [uid, tipo])

  const titulo = TIPOS_DOCUMENTO[tipo]

  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold text-gray-900">{titulo}</h4>
      {estado === 'cargando' && (
        <p className="flex items-center gap-2 text-sm text-gray-700" aria-busy="true">
          <LuLoader className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
          Cargando…
        </p>
      )}
      {estado === 'sin-archivo' && (
        <p className="rounded-xl bg-home-orange-50 p-3 text-sm text-home-orange-900">No encontramos el archivo.</p>
      )}
      {estado === 'error' && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800">No pudimos cargarlo.</p>}
      {estado === 'listo' && (
        <div className="space-y-2">
          {documento.tipoMime === 'application/pdf' ? (
            <div className="flex items-center gap-3 rounded-2xl bg-home-orange-50 p-3">
              <LuFileText className="h-8 w-8 shrink-0 text-home-orange-700" aria-hidden="true" />
              <p className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">{documento.nombre}</p>
            </div>
          ) : (
            <img
              src={documento.contenido}
              alt={`${titulo} de ${nombre}`}
              className="max-h-80 w-full rounded-2xl bg-gray-50 object-contain"
            />
          )}
          <button
            type="button"
            onClick={() => abrirDocumento(documento.contenido)}
            className={`inline-flex items-center gap-1.5 rounded text-sm font-semibold text-home-orange-800 underline underline-offset-4 hover:text-home-orange-900 ${ENFOQUE}`}
          >
            <LuExternalLink className="h-4 w-4" aria-hidden="true" />
            Abrir en otra pestaña
          </button>
        </div>
      )}
    </div>
  )
}

/* ---------- Tarjeta de un 2nd HOST ---------- */
function TarjetaHost({ cuenta, onAprobar, onRechazar }) {
  const [verDocumentos, setVerDocumentos] = useState(false)
  const [rechazando, setRechazando] = useState(false)
  const { id, nombre, correo, telefono, avatar, anfitrionDesde } = cuenta

  return (
    <li className="rounded-3xl border border-home-orange-200 bg-white p-5">
      <div className="flex gap-4">
        <Avatar src={avatar} nombre={nombre} tamano="lg" />
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900">{nombre}</h3>
          <dl className="mt-2 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-gray-600">Correo</dt>
              <dd className="font-medium text-gray-900 wrap-anywhere">{correo}</dd>
            </div>
            <div>
              <dt className="text-gray-600">Teléfono</dt>
              <dd className="font-medium text-gray-900">{telefono}</dd>
            </div>
            {anfitrionDesde && (
              <div>
                <dt className="text-gray-600">2nd HOST desde</dt>
                <dd className="font-medium text-gray-900">{formatoMesAnio(anfitrionDesde)}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <div className="mt-4">
        {verDocumentos ? (
          <div className="grid gap-6 md:grid-cols-2">
            {DOCUMENTOS_HOST.map((tipo) => (
              <VisorDocumento key={tipo} uid={id} tipo={tipo} nombre={nombre} />
            ))}
          </div>
        ) : (
          <button type="button" onClick={() => setVerDocumentos(true)} className={CLASE_BOTON_SECUNDARIO}>
            <LuEye className="h-4 w-4" aria-hidden="true" />
            Ver documentos
          </button>
        )}
      </div>

      {rechazando ? (
        <div className="mt-4">
          <FormularioMotivo
            etiqueta="Motivo del rechazo"
            ayuda="El 2nd HOST lo verá en su perfil y podrá subirlos de nuevo. Los documentos actuales se borrarán."
            placeholder="Ej. El comprobante no corresponde a la dirección de la propiedad."
            textoConfirmar="Rechazar documentos"
            onConfirmar={(motivo) => onRechazar(cuenta, motivo)}
            onCancelar={() => setRechazando(false)}
          />
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-3 border-t border-home-orange-100 pt-4">
          <button type="button" onClick={() => onAprobar(cuenta)} className={CLASE_BOTON_PRINCIPAL}>
            <LuCheck className="h-4 w-4" aria-hidden="true" />
            Aprobar
          </button>
          <button type="button" onClick={() => setRechazando(true)} className={CLASE_BOTON_PELIGRO}>
            <LuX className="h-4 w-4" aria-hidden="true" />
            Rechazar
          </button>
        </div>
      )}
    </li>
  )
}

/* ---------- Sección completa ---------- */
export default function RevisionDocumentosHost() {
  const [pendientes, setPendientes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')
  const [aviso, setAviso] = useState('')

  useEffect(() => {
    const consulta = query(collection(db, 'usuarios'), where('documentosEstado', '==', 'en_revision'))
    return onSnapshot(
      consulta,
      (resultado) => {
        setPendientes(resultado.docs.map((d) => ({ id: d.id, ...d.data() })))
        setCargando(false)
      },
      (error) => {
        setErrorCarga(`No se pudieron cargar los documentos (${error.code}).`)
        setCargando(false)
      }
    )
  }, [])

  // Al terminar la revisión, los documentos se borran (lo promete el aviso de privacidad)
  const borrarDocumentos = (uid) =>
    Promise.all(
      DOCUMENTOS_HOST.map((tipo) =>
        eliminarDocumento(uid, tipo).catch((error) => console.error('No se pudo borrar el documento:', error.code))
      )
    )

  const aprobar = async (cuenta) => {
    try {
      await updateDoc(doc(db, 'usuarios', cuenta.id), { documentosEstado: 'aprobados', motivoDocumentos: '' })
      await borrarDocumentos(cuenta.id)
      setAviso(`Aprobaste los documentos de ${cuenta.nombre}.`)
    } catch {
      setAviso('No pudimos aprobar los documentos. Revisa tu conexión e inténtalo de nuevo.')
    }
  }

  const rechazar = async (cuenta, motivo) => {
    try {
      await updateDoc(doc(db, 'usuarios', cuenta.id), { documentosEstado: 'rechazados', motivoDocumentos: motivo })
      await borrarDocumentos(cuenta.id)
      setAviso(`Rechazaste los documentos de ${cuenta.nombre}. Verá el motivo en su perfil.`)
    } catch {
      setAviso('No pudimos rechazar los documentos. Revisa tu conexión e inténtalo de nuevo.')
    }
  }

  if (cargando) {
    return (
      <p className="flex items-center gap-2 text-gray-700" aria-busy="true">
        <LuLoader className="h-5 w-5 animate-spin text-home-orange-600 motion-reduce:animate-none" aria-hidden="true" />
        Cargando documentos…
      </p>
    )
  }

  if (errorCarga) {
    return <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{errorCarga}</p>
  }

  return (
    <section aria-labelledby="titulo-documentos-host">
      <h2 id="titulo-documentos-host" className="text-lg font-bold text-gray-900">
        Documentos de 2nd HOSTS
      </h2>
      <p className="mt-1 max-w-prose text-sm text-gray-700">
        Identificación oficial y comprobante de domicilio. Al aprobar o rechazar, los documentos se borran
        automáticamente.
      </p>

      <div aria-live="polite">
        {aviso && (
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-home-orange-200 bg-home-orange-50 p-4 text-sm text-home-orange-900">
            <p className="flex-1">{aviso}</p>
            <button
              type="button"
              onClick={() => setAviso('')}
              aria-label="Cerrar aviso"
              className={`grid h-8 w-8 place-items-center rounded-full hover:bg-home-orange-100 ${ENFOQUE}`}
            >
              <LuX className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {pendientes.length > 0 ? (
        <ul className="mt-6 space-y-4">
          {pendientes.map((cuenta) => (
            <TarjetaHost key={cuenta.id} cuenta={cuenta} onAprobar={aprobar} onRechazar={rechazar} />
          ))}
        </ul>
      ) : (
        <div className="mt-6 rounded-3xl border-2 border-dashed border-home-orange-200 bg-white px-6 py-12 text-center">
          <LuInbox className="mx-auto h-10 w-10 text-home-orange-300" aria-hidden="true" />
          <p className="mt-3 text-sm text-gray-700">No hay documentos por revisar.</p>
        </div>
      )}
    </section>
  )
}