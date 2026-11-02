import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, doc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore'
import { LuX, LuInbox, LuLoader } from 'react-icons/lu'
import Pestanas from './Pestanas'
import FormularioMotivo from './FormularioMotivo'
import { ENFOQUE, CLASE_BOTON_PRINCIPAL, CLASE_BOTON_SECUNDARIO, ETIQUETA_ROL, formatoFechaFirestore } from './estilos'
import { usePropiedades } from '../../context/propiedades'
import { TIPOS_REPORTE, MOTIVOS_REPORTE } from '../../data/mockData'
import { db } from '../../firebase/config'

const ID_PANEL = 'panel-reportes'

const ESTILO_CIERRE = {
  resuelto: 'border-green-200 bg-green-50 text-green-800',
  descartado: 'border-gray-200 bg-gray-50 text-gray-700',
}

// Milisegundos de la fecha del reporte (los recién creados aún no tienen fecha del servidor)
const milisegundos = (reporte) => reporte.fecha?.toMillis?.() ?? Date.now()

function TarjetaReporte({ reporte, cuentaReportada, tituloPropiedad, onResolver, onDescartar }) {
  const [resolviendo, setResolviendo] = useState(false)
  const [suspender, setSuspender] = useState(false)
  const { tipo, motivo, descripcion, reportadoPor, reportado, propiedadId, fecha, estado, resolucion } = reporte
  const yaSuspendida = cuentaReportada?.estado === 'suspendida'

  return (
    <li className="rounded-3xl border border-home-orange-200 bg-white p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-home-orange-100 px-2.5 py-0.5 text-xs font-semibold text-home-orange-900">
          {TIPOS_REPORTE[tipo]}
        </span>
        {estado !== 'abierto' && (
          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${ESTILO_CIERRE[estado]}`}>
            {estado === 'resuelto' ? 'Resuelto' : 'Descartado'}
          </span>
        )}
        <span className="ml-auto text-xs text-gray-600">{formatoFechaFirestore(fecha)}</span>
      </div>

      <h3 className="mt-3 font-semibold text-gray-900">{MOTIVOS_REPORTE[motivo]}</h3>
      <blockquote className="mt-2 border-l-4 border-home-orange-200 pl-3 text-sm leading-relaxed text-gray-800">
        {descripcion}
      </blockquote>

      <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-gray-600">Reportado por</dt>
          <dd className="mt-0.5 font-medium text-gray-900">{reportadoPor.nombre}</dd>
        </div>
        <div>
          <dt className="text-gray-600">Cuenta reportada</dt>
          <dd className="mt-0.5 font-medium text-gray-900">
            {reportado.nombre}
            {cuentaReportada && <span className="font-normal text-gray-600"> ({ETIQUETA_ROL[cuentaReportada.rol]})</span>}
            {yaSuspendida && (
              <span className="ml-2 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-800">
                Suspendida
              </span>
            )}
          </dd>
        </div>
        {propiedadId && tituloPropiedad && (
          <div>
            <dt className="text-gray-600">Propiedad</dt>
            <dd className="mt-0.5">
              <Link
                to={`/propiedad/${propiedadId}`}
                className={`rounded font-semibold text-home-orange-800 underline underline-offset-2 hover:text-home-orange-900 ${ENFOQUE}`}
              >
                {tituloPropiedad}
              </Link>
            </dd>
          </div>
        )}
      </dl>

      {/* Reporte cerrado: cómo se resolvió */}
      {estado !== 'abierto' && resolucion && (
        <p className="mt-4 rounded-xl bg-home-orange-50 p-3 text-sm text-home-orange-900">
          <span className="font-semibold">Resolución:</span> {resolucion}
        </p>
      )}

      {/* Reporte abierto: acciones */}
      {estado === 'abierto' &&
        (resolviendo ? (
          <div className="mt-4">
            <FormularioMotivo
              tono="neutral"
              etiqueta="¿Cómo se resolvió?"
              ayuda="Queda registrado en el historial de reportes."
              placeholder="Ej. Se habló con el 2nd HOST y se corrigió la publicación."
              textoConfirmar="Marcar como resuelto"
              onConfirmar={(texto) => onResolver(reporte, texto, suspender)}
              onCancelar={() => {
                setResolviendo(false)
                setSuspender(false)
              }}
            >
              {/* Solo las cuentas reales de Firestore se pueden suspender */}
              {cuentaReportada && !yaSuspendida ? (
                <label className="flex cursor-pointer items-start gap-2 text-sm text-gray-800">
                  <input
                    type="checkbox"
                    checked={suspender}
                    onChange={(e) => setSuspender(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-red-700"
                  />
                  También suspender la cuenta de {reportado.nombre}
                </label>
              ) : (
                !cuentaReportada && (
                  <p className="text-xs text-gray-600">
                    La cuenta reportada pertenece a los datos de prueba, así que no se puede suspender.
                  </p>
                )
              )}
            </FormularioMotivo>
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap gap-3 border-t border-home-orange-100 pt-4">
            <button type="button" onClick={() => setResolviendo(true)} className={CLASE_BOTON_PRINCIPAL}>
              Resolver
            </button>
            <button type="button" onClick={() => onDescartar(reporte)} className={CLASE_BOTON_SECUNDARIO}>
              Descartar
            </button>
          </div>
        ))}
    </li>
  )
}

export default function GestionReportes() {
  const { propiedades } = usePropiedades()
  const [reportes, setReportes] = useState([])
  const [cuentas, setCuentas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')
  const [pestana, setPestana] = useState('abierto') // 'abierto' | 'cerrado'
  const [aviso, setAviso] = useState('')

  // Reportes en tiempo real (solo el administrador puede leerlos)
  useEffect(() => {
    return onSnapshot(
      collection(db, 'reportes'),
      (resultado) => {
        setReportes(resultado.docs.map((documento) => ({ id: documento.id, ...documento.data() })))
        setCargando(false)
      },
      (error) => {
        setErrorCarga(`No se pudieron cargar los reportes (${error.code}).`)
        setCargando(false)
      }
    )
  }, [])

  // Cuentas, para saber si la cuenta reportada existe y si ya está suspendida
  useEffect(() => {
    return onSnapshot(
      collection(db, 'usuarios'),
      (resultado) => setCuentas(resultado.docs.map((documento) => ({ id: documento.id, ...documento.data() }))),
      () => setCuentas([])
    )
  }, [])

  // Abiertos: el más antiguo primero (orden de llegada). Cerrados: el más reciente primero.
  const abiertos = reportes.filter((r) => r.estado === 'abierto').sort((a, b) => milisegundos(a) - milisegundos(b))
  const cerrados = reportes.filter((r) => r.estado !== 'abierto').sort((a, b) => milisegundos(b) - milisegundos(a))
  const lista = pestana === 'abierto' ? abiertos : cerrados

  const resolver = async (reporte, resolucion, suspenderCuenta) => {
    try {
      await updateDoc(doc(db, 'reportes', reporte.id), {
        estado: 'resuelto',
        resolucion,
        resueltoEn: serverTimestamp(),
      })
      if (suspenderCuenta) {
        await updateDoc(doc(db, 'usuarios', reporte.reportado.id), {
          estado: 'suspendida',
          motivoSuspension: resolucion,
        })
      }
      setAviso(
        suspenderCuenta
          ? `Resolviste el reporte y suspendiste la cuenta de ${reporte.reportado.nombre}.`
          : 'Resolviste el reporte.'
      )
    } catch {
      setAviso('No pudimos guardar los cambios. Revisa tu conexión e inténtalo de nuevo.')
    }
  }

  const descartar = async (reporte) => {
    try {
      await updateDoc(doc(db, 'reportes', reporte.id), {
        estado: 'descartado',
        resolucion: 'Se revisó y no se encontró una falta.',
        resueltoEn: serverTimestamp(),
      })
      setAviso('Descartaste el reporte.')
    } catch {
      setAviso('No pudimos descartar el reporte. Revisa tu conexión e inténtalo de nuevo.')
    }
  }

  if (cargando) {
    return (
      <p className="flex items-center gap-2 text-gray-700" aria-busy="true">
        <LuLoader className="h-5 w-5 animate-spin text-home-orange-600 motion-reduce:animate-none" aria-hidden="true" />
        Cargando reportes…
      </p>
    )
  }

  if (errorCarga) {
    return <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{errorCarga}</p>
  }

  return (
    <section aria-label="Reportes">
      <Pestanas
        etiqueta="Estado de los reportes"
        idPanel={ID_PANEL}
        activa={pestana}
        onCambiar={setPestana}
        opciones={[
          { valor: 'abierto', etiqueta: 'Abiertos', conteo: abiertos.length },
          { valor: 'cerrado', etiqueta: 'Atendidos', conteo: cerrados.length },
        ]}
      />

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

      <div id={ID_PANEL} role="tabpanel" aria-labelledby={`${ID_PANEL}-${pestana}`} className="mt-6">
        {lista.length > 0 ? (
          <ul className="space-y-4">
            {lista.map((reporte) => (
              <TarjetaReporte
                key={reporte.id}
                reporte={reporte}
                cuentaReportada={cuentas.find((c) => c.id === reporte.reportado?.id)}
                tituloPropiedad={propiedades.find((p) => p.id === reporte.propiedadId)?.titulo}
                onResolver={resolver}
                onDescartar={descartar}
              />
            ))}
          </ul>
        ) : (
          <div className="rounded-3xl border-2 border-dashed border-home-orange-200 bg-white px-6 py-12 text-center">
            <LuInbox className="mx-auto h-10 w-10 text-home-orange-300" aria-hidden="true" />
            <p className="mt-3 text-sm text-gray-700">
              {pestana === 'abierto' ? 'No hay reportes por atender.' : 'Todavía no hay reportes atendidos.'}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}