import { useId, useState } from 'react'
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { LuThumbsUp, LuFlag, LuTrash2 } from 'react-icons/lu'
import Avatar from '../Avatar'
import Comentarios from './Comentarios'
import { db } from '../../firebase/config'
import { CATEGORIAS_COMUNIDAD, MOTIVOS_REPORTE } from '../../data/mockData'
import { ENFOQUE, CLASE_CHIP, fechaRelativa } from './utilidades'

const CLASE_BOTON_SECUNDARIO = `rounded-full px-4 py-1.5 text-sm font-semibold text-home-orange-800 hover:bg-home-orange-100 ${ENFOQUE}`

/* ---------- Fotos de la publicación ---------- */
function GaleriaPublicacion({ imagenes }) {
  if (!imagenes?.length) return null
  const una = imagenes.length === 1

  return (
    <ul className={`mt-4 grid gap-2 ${una ? 'grid-cols-1' : 'grid-cols-2'}`}>
      {imagenes.map((src, indice) => {
        // Con 3 fotos, la primera ocupa todo el ancho
        const anchoCompleto = imagenes.length === 3 && indice === 0
        let proporcion = 'aspect-square'
        if (una) proporcion = 'max-h-96'
        else if (anchoCompleto) proporcion = 'aspect-2/1'

        return (
          <li
            key={indice}
            className={`overflow-hidden rounded-2xl bg-home-orange-100 ${anchoCompleto ? 'col-span-2' : ''}`}
          >
            <img
              src={src}
              alt={`Foto ${indice + 1} de la publicación`}
              loading="lazy"
              className={`h-full w-full object-cover ${proporcion}`}
            />
          </li>
        )
      })}
    </ul>
  )
}

/* ---------- Reporte con motivo ---------- */
function FormularioReporte({ onEnviar, onCancelar }) {
  const [motivo, setMotivo] = useState('')
  const [error, setError] = useState('')
  const nombreGrupo = useId()

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!motivo) {
          setError('Elige un motivo.')
          return
        }
        onEnviar(motivo)
      }}
      noValidate
      className="mt-4 space-y-3 rounded-2xl bg-home-orange-50 p-4"
    >
      <fieldset>
        <legend className="text-sm font-semibold text-gray-900">¿Por qué reportas esta publicación?</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {Object.entries(MOTIVOS_REPORTE).map(([clave, etiqueta]) => (
            <label key={clave} className="cursor-pointer">
              <input
                type="radio"
                name={nombreGrupo}
                checked={motivo === clave}
                onChange={() => {
                  setMotivo(clave)
                  setError('')
                }}
                className="peer sr-only"
              />
              <span className={CLASE_CHIP}>{etiqueta}</span>
            </label>
          ))}
        </div>
        {error && <p className="mt-1.5 text-sm font-medium text-red-700">{error}</p>}
      </fieldset>
      <div className="flex gap-2">
        <button
          type="submit"
          className={`rounded-full bg-home-orange-700 px-4 py-1.5 text-sm font-semibold text-white hover:bg-home-orange-800 ${ENFOQUE}`}
        >
          Enviar reporte
        </button>
        <button type="button" onClick={onCancelar} className={CLASE_BOTON_SECUNDARIO}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

/* ---------- Tarjeta completa ---------- */
export default function TarjetaPublicacion({ publicacion, usuario }) {
  const [modo, setModo] = useState(null) // null | 'reportar' | 'eliminar'
  const [aviso, setAviso] = useState('')
  const { id, autor, categoria, texto, imagenes, meGusta = [], fecha } = publicacion

  const esEstudiante = usuario.rol === 'estudiante'
  const esAutor = autor.id === usuario.id
  const puedeEliminar = esAutor || usuario.rol === 'admin'
  const leGusta = meGusta.includes(usuario.id)

  const alternarMeGusta = async () => {
    try {
      await updateDoc(doc(db, 'publicaciones', id), {
        meGusta: leGusta ? arrayRemove(usuario.id) : arrayUnion(usuario.id),
      })
    } catch {
      setAviso('No pudimos registrar tu "me gusta". Inténtalo de nuevo.')
    }
  }

  const eliminar = async () => {
    try {
      await deleteDoc(doc(db, 'publicaciones', id))
    } catch {
      setModo(null)
      setAviso('No pudimos eliminar la publicación. Inténtalo de nuevo.')
    }
  }

  const reportar = async (motivo) => {
    const extracto = texto.length > 140 ? `${texto.slice(0, 140)}…` : texto
    try {
      await addDoc(collection(db, 'reportes'), {
        tipo: 'publicacion',
        motivo,
        descripcion: `${MOTIVOS_REPORTE[motivo]}. Publicación: "${extracto}"`,
        reportadoPor: { id: usuario.id, nombre: usuario.nombre },
        reportado: { id: autor.id, nombre: autor.nombre },
        publicacionId: id,
        propiedadId: null,
        estado: 'abierto',
        resolucion: '',
        fecha: serverTimestamp(),
      })
      setModo(null)
      setAviso('Reporte enviado. El equipo de 2nd HOME revisará esta publicación.')
    } catch {
      setAviso('No pudimos enviar el reporte. Inténtalo de nuevo.')
    }
  }

  const claseAccion = `inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-home-orange-50 ${ENFOQUE}`

  return (
    // En escritorio: publicación a la izquierda y comentarios a la derecha (como en la maqueta)
    <article className="overflow-hidden rounded-3xl border border-home-orange-200 bg-white lg:grid lg:grid-cols-5">
      <div className="p-5 lg:col-span-3">
        <header className="flex items-start gap-3">
          <Avatar src={autor.avatar} nombre={autor.nombre} />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900">{autor.nombre}</p>
            <p className="text-xs text-gray-600">
              {autor.carrera && `${autor.carrera} · `}
              {fechaRelativa(fecha)}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-home-orange-100 px-2.5 py-0.5 text-xs font-semibold text-home-orange-900">
            {CATEGORIAS_COMUNIDAD[categoria]}
          </span>
        </header>

        <p className="mt-4 whitespace-pre-wrap leading-relaxed text-gray-900 wrap-anywhere">{texto}</p>
        <GaleriaPublicacion imagenes={imagenes} />

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-home-orange-100 pt-3">
          <button
            type="button"
            onClick={alternarMeGusta}
            disabled={!esEstudiante}
            aria-pressed={leGusta}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors disabled:cursor-default ${ENFOQUE} ${
              leGusta ? 'bg-home-orange-100 text-home-orange-900' : 'text-gray-700 hover:bg-home-orange-50'
            }`}
          >
            <LuThumbsUp className={`h-4 w-4 ${leGusta ? 'fill-current' : ''}`} aria-hidden="true" />
            {meGusta.length} me gusta
          </button>

          <div className="ml-auto flex gap-1">
            {esEstudiante && !esAutor && (
              <button type="button" onClick={() => setModo('reportar')} className={claseAccion}>
                <LuFlag className="h-4 w-4" aria-hidden="true" />
                Reportar
              </button>
            )}
            {puedeEliminar && (
              <button type="button" onClick={() => setModo('eliminar')} className={claseAccion}>
                <LuTrash2 className="h-4 w-4" aria-hidden="true" />
                Eliminar
              </button>
            )}
          </div>
        </div>

        {modo === 'reportar' && <FormularioReporte onEnviar={reportar} onCancelar={() => setModo(null)} />}

        {modo === 'eliminar' && (
          <div className="mt-4 rounded-2xl bg-red-50 p-4">
            <p className="text-sm text-red-900">
              {esAutor
                ? '¿Eliminar tu publicación? Esta acción no se puede deshacer.'
                : '¿Eliminar esta publicación de la comunidad? Esta acción no se puede deshacer.'}
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={eliminar}
                className={`rounded-full bg-red-700 px-4 py-1.5 text-sm font-semibold text-white hover:bg-red-800 ${ENFOQUE}`}
              >
                Eliminar
              </button>
              <button type="button" onClick={() => setModo(null)} className={CLASE_BOTON_SECUNDARIO}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        {aviso && (
          <p role="status" className="mt-3 text-sm text-home-orange-900">
            {aviso}
          </p>
        )}
      </div>

      <aside
        aria-label={`Comentarios de la publicación de ${autor.nombre}`}
        className="border-t border-home-orange-100 bg-home-orange-50/50 p-5 lg:col-span-2 lg:border-l lg:border-t-0"
      >
        <Comentarios publicacionId={id} usuario={usuario} />
      </aside>
    </article>
  )
}