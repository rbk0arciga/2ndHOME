import { useEffect, useState } from 'react'
import { collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore'
import { LuLoader, LuInbox, LuX, LuCheck, LuExternalLink, LuFileText, LuEye } from 'react-icons/lu'
import Avatar from '../Avatar'
import EtiquetaAspirante from '../EtiquetaAspirante'
import FormularioMotivo from './FormularioMotivo'
import { ENFOQUE, CLASE_BOTON_PRINCIPAL, CLASE_BOTON_SECUNDARIO, CLASE_BOTON_PELIGRO } from './estilos'
import { db } from '../../firebase/config'
import { leerDocumento, eliminarDocumento, abrirDocumento } from '../../utils/documentos'
import { formatoFechaLarga } from '../../firebase/admision'

/* ---------- Muestra la ficha (se descarga solo al pedirla) ---------- */
function VisorFicha({ uid, nombre }) {
  const [estado, setEstado] = useState('cargando') // 'cargando' | 'listo' | 'sin-archivo' | 'error'
  const [documento, setDocumento] = useState(null)

  useEffect(() => {
    let activo = true
    leerDocumento(uid, 'fichaAdmision')
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
  }, [uid])

  if (estado === 'cargando') {
    return (
      <p className="flex items-center gap-2 text-sm text-gray-700" aria-busy="true">
        <LuLoader className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
        Cargando ficha…
      </p>
    )
  }
  if (estado === 'sin-archivo') {
    return (
      <p className="rounded-xl bg-home-orange-50 p-3 text-sm text-home-orange-900">
        No encontramos el archivo. Recházala indicando que la vuelva a subir.
      </p>
    )
  }
  if (estado === 'error') {
    return <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800">No pudimos cargar la ficha.</p>
  }

  const esPdf = documento.tipoMime === 'application/pdf'

  return (
    <div className="space-y-2">
      {esPdf ? (
        <div className="flex items-center gap-3 rounded-2xl bg-home-orange-50 p-3">
          <LuFileText className="h-8 w-8 shrink-0 text-home-orange-700" aria-hidden="true" />
          <p className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">{documento.nombre}</p>
        </div>
      ) : (
        <img
          src={documento.contenido}
          alt={`Ficha de admisión de ${nombre}`}
          className="max-h-[32rem] w-full rounded-2xl bg-gray-50 object-contain"
        />
      )}
      <button
        type="button"
        onClick={() => abrirDocumento(documento.contenido)}
        className={`inline-flex items-center gap-1.5 rounded text-sm font-semibold text-home-orange-800 underline underline-offset-4 hover:text-home-orange-900 ${ENFOQUE}`}
      >
        <LuExternalLink className="h-4 w-4" aria-hidden="true" />
        {esPdf ? 'Abrir PDF en otra pestaña' : 'Ver en tamaño completo'}
      </button>
    </div>
  )
}

/* ---------- Tarjeta de un aspirante ---------- */
function TarjetaFicha({ cuenta, onAprobar, onRechazar }) {
  const [verFicha, setVerFicha] = useState(false)
  const [rechazando, setRechazando] = useState(false)
  const { id, nombre, correo, carrera, avatar, vigenteHasta } = cuenta

  return (
    <li className="rounded-3xl border border-home-orange-200 bg-white p-5">
      <div className="flex gap-4">
        <Avatar src={avatar} nombre={nombre} tamano="lg" />
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900">{nombre}</h3>
          <div className="mt-1">
            <EtiquetaAspirante />
          </div>
          <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-gray-600">Correo personal</dt>
              <dd className="font-medium text-gray-900 wrap-anywhere">{correo}</dd>
            </div>
            <div>
              <dt className="text-gray-600">Carrera a la que fue admitido</dt>
              <dd className="font-medium text-gray-900">{carrera}</dd>
            </div>
            {vigenteHasta && (
              <div>
                <dt className="text-gray-600">Cuenta de aspirante válida hasta</dt>
                <dd className="font-medium text-gray-900">{formatoFechaLarga(vigenteHasta.toDate())}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <div className="mt-4">
        {verFicha ? (
          <VisorFicha uid={id} nombre={nombre} />
        ) : (
          <button type="button" onClick={() => setVerFicha(true)} className={CLASE_BOTON_SECUNDARIO}>
            <LuEye className="h-4 w-4" aria-hidden="true" />
            Ver ficha de admisión
          </button>
        )}
      </div>

      {rechazando ? (
        <div className="mt-4">
          <FormularioMotivo
            etiqueta="Motivo del rechazo"
            ayuda="El aspirante lo verá y podrá subir su ficha de nuevo. La ficha actual se borrará."
            placeholder="Ej. La foto está borrosa y no se lee el nombre."
            textoConfirmar="Rechazar ficha"
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
export default function RevisionFichas() {
  const [pendientes, setPendientes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')
  const [aviso, setAviso] = useState('')

  // Aspirantes con ficha en revisión, en tiempo real
  useEffect(() => {
    const consulta = query(collection(db, 'usuarios'), where('fichaEstado', '==', 'en_revision'))
    return onSnapshot(
      consulta,
      (resultado) => {
        setPendientes(resultado.docs.map((d) => ({ id: d.id, ...d.data() })))
        setCargando(false)
      },
      (error) => {
        setErrorCarga(`No se pudieron cargar las fichas (${error.code}).`)
        setCargando(false)
      }
    )
  }, [])

  // Al terminar la revisión, la ficha se borra (lo promete el aviso de privacidad)
  const borrarFicha = (uid) =>
    eliminarDocumento(uid, 'fichaAdmision').catch((error) => console.error('No se pudo borrar la ficha:', error.code))

  const aprobar = async (cuenta) => {
    try {
      await updateDoc(doc(db, 'usuarios', cuenta.id), { fichaEstado: 'aprobada', motivoFicha: '' })
      await borrarFicha(cuenta.id)
      setAviso(`Aprobaste la ficha de ${cuenta.nombre}. Ya puede usar 2nd HOME.`)
    } catch {
      setAviso('No pudimos aprobar la ficha. Revisa tu conexión e inténtalo de nuevo.')
    }
  }

  const rechazar = async (cuenta, motivo) => {
    try {
      await updateDoc(doc(db, 'usuarios', cuenta.id), { fichaEstado: 'rechazada', motivoFicha: motivo })
      await borrarFicha(cuenta.id)
      setAviso(`Rechazaste la ficha de ${cuenta.nombre}. Verá el motivo y podrá subirla de nuevo.`)
    } catch {
      setAviso('No pudimos rechazar la ficha. Revisa tu conexión e inténtalo de nuevo.')
    }
  }

  if (cargando) {
    return (
      <p className="flex items-center gap-2 text-gray-700" aria-busy="true">
        <LuLoader className="h-5 w-5 animate-spin text-home-orange-600 motion-reduce:animate-none" aria-hidden="true" />
        Cargando fichas…
      </p>
    )
  }

  if (errorCarga) {
    return <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{errorCarga}</p>
  }

  return (
    <section aria-labelledby="titulo-fichas">
      <h2 id="titulo-fichas" className="text-lg font-bold text-gray-900">
        Fichas de admisión
      </h2>
      <p className="mt-1 max-w-prose text-sm text-gray-700">
        Aspirantes de primer ingreso que se registraron con correo personal. Al aprobar o rechazar, la ficha se borra
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
            <TarjetaFicha key={cuenta.id} cuenta={cuenta} onAprobar={aprobar} onRechazar={rechazar} />
          ))}
        </ul>
      ) : (
        <div className="mt-6 rounded-3xl border-2 border-dashed border-home-orange-200 bg-white px-6 py-12 text-center">
          <LuInbox className="mx-auto h-10 w-10 text-home-orange-300" aria-hidden="true" />
          <p className="mt-3 text-sm text-gray-700">No hay fichas por revisar.</p>
        </div>
      )}
    </section>
  )
}