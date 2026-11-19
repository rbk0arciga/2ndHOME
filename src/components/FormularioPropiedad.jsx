import { useId, useRef, useState } from 'react'
import { LuImagePlus, LuX, LuCheck, LuLoader, LuMapPin } from 'react-icons/lu'
import CampoFormulario from './CampoFormulario'
import {
  COLONIAS,
  TIPOS_PROPIEDAD,
  GENEROS,
  SERVICIOS,
  REGLAS,
  REGLAS_VISITAS,
  CARACTERISTICAS,
  AMENIDADES,
  formatoPrecio,
  minutosAPie,
} from '../data/mockData'
import { comprimirImagen } from '../utils/imagenes'
import { distanciaACucei, leerCoordenadas } from '../utils/distancia'

const ENFOQUE =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-home-orange-500'

const MAXIMO_FOTOS = 5
// Las fotos van dentro del documento de la propiedad (máximo 1 MB en Firestore)
const PESO_MAXIMO_FOTOS = 800_000
const DISTANCIA_MAXIMA_KM = 40
const OPCIONES_CONTRATO = [3, 6, 12]

const DATOS_INICIALES = {
  direccion: '',
  colonia: '',
  ubicacion: '',
  tipo: '',
  genero: '',
  habitacionesTotales: '',
  banos: '',
  roomies: '',
  caracteristicas: [],
  amenidades: [],
  precio: '',
  deposito: '',
  contratoMeses: 6,
  servicios: [],
  reglas: [],
  visitas: '',
  descripcion: '',
}

// Orden en que se revisan los campos (para llevar el foco al primer error)
const ORDEN_CAMPOS = [
  'direccion',
  'colonia',
  'ubicacion',
  'tipo',
  'genero',
  'habitacionesTotales',
  'banos',
  'roomies',
  'precio',
  'deposito',
  'visitas',
  'fotos',
]

function enteroEnRango(valor, minimo, maximo) {
  const numero = Number(valor)
  return valor !== '' && Number.isInteger(numero) && numero >= minimo && numero <= maximo
}

function validar(datos, fotos) {
  const errores = {}
  const precio = Number(datos.precio)

  if (datos.direccion.trim().length < 5) errores.direccion = 'Escribe la calle y el número.'
  if (datos.colonia.trim().length < 3) errores.colonia = 'Escribe la colonia.'

  const coordenadas = leerCoordenadas(datos.ubicacion)
  if (!coordenadas) {
    errores.ubicacion = 'Pega las coordenadas de tu casa, por ejemplo 20.6566, -103.3255.'
  } else if (distanciaACucei(coordenadas) > DISTANCIA_MAXIMA_KM) {
    errores.ubicacion = `Esa ubicación está a más de ${DISTANCIA_MAXIMA_KM} km de CUCEI. Revisa las coordenadas.`
  }

  if (!datos.tipo) errores.tipo = 'Elige el tipo de espacio.'
  if (!datos.genero) errores.genero = 'Elige quién puede vivir ahí.'

  if (!enteroEnRango(datos.habitacionesTotales, 1, 30)) errores.habitacionesTotales = 'Escribe un número entre 1 y 30.'
  if (!enteroEnRango(datos.banos, 1, 30)) errores.banos = 'Escribe un número entre 1 y 30.'
  if (!enteroEnRango(datos.roomies, 0, 30)) errores.roomies = 'Escribe un número entre 0 y 30.'

  if (!datos.precio || !Number.isFinite(precio) || precio < 500 || precio > 30000) {
    errores.precio = 'Escribe una renta mensual entre $500 y $30,000.'
  }
  if (datos.deposito !== '' && (!Number.isFinite(Number(datos.deposito)) || Number(datos.deposito) < 0)) {
    errores.deposito = 'Escribe un depósito válido o déjalo vacío.'
  }
  if (!datos.visitas) errores.visitas = 'Elige si se permiten visitas.'
  if (fotos.length === 0) {
    errores.fotos = 'Agrega al menos una foto del espacio.'
  } else if (fotos.reduce((total, foto) => total + foto.url.length, 0) > PESO_MAXIMO_FOTOS) {
    errores.fotos = 'Las fotos pesan demasiado juntas. Quita alguna e inténtalo de nuevo.'
  }

  return errores
}

// Fecha de hoy como "2026-11-18", en hora local
function hoyComoTexto() {
  const hoy = new Date()
  const mes = String(hoy.getMonth() + 1).padStart(2, '0')
  const dia = String(hoy.getDate()).padStart(2, '0')
  return `${hoy.getFullYear()}-${mes}-${dia}`
}

/* ---------- Vista previa de la ubicación ---------- */
function VistaPreviaUbicacion({ coordenadas }) {
  const { lat, lng } = coordenadas
  const margen = 0.004
  const url = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - margen},${lat - margen},${lng + margen},${lat + margen}&layer=mapnik&marker=${lat},${lng}`
  const km = distanciaACucei(coordenadas)

  return (
    <div className="overflow-hidden rounded-2xl border border-home-orange-200">
      <iframe title="Vista previa de la ubicación" src={url} loading="lazy" className="h-48 w-full border-0" />
      <p className="flex items-center gap-1.5 bg-home-orange-50 px-3 py-2 text-sm text-home-orange-900">
        <LuMapPin className="h-4 w-4 shrink-0" aria-hidden="true" />A {km} km de CUCEI, unos {minutosAPie(km)} min a
        pie (aproximado)
      </p>
    </div>
  )
}

/* ---------- Bloque del formulario con subtítulo ---------- */
function BloqueFormulario({ titulo, descripcion, children }) {
  return (
    <div className="space-y-5 border-t border-home-orange-100 pt-6 first:border-t-0 first:pt-0">
      <div>
        <h3 className="font-semibold text-gray-900">{titulo}</h3>
        {descripcion && <p className="mt-0.5 text-sm text-gray-600">{descripcion}</p>}
      </div>
      {children}
    </div>
  )
}

/* ---------- Grupo de opciones (radios o casillas) con forma de chip ---------- */
function GrupoOpciones({ refGrupo, titulo, ayuda, error, children }) {
  return (
    <fieldset ref={refGrupo} tabIndex={-1} className="focus:outline-none">
      <legend className="text-sm font-semibold text-gray-900">{titulo}</legend>
      {ayuda && <p className="mt-0.5 text-xs text-gray-600">{ayuda}</p>}
      <div className="mt-2 flex flex-wrap gap-2">{children}</div>
      {error && <p className="mt-1.5 text-sm font-medium text-red-700">{error}</p>}
    </fieldset>
  )
}

function Chip({ type, name, checked, onChange, children }) {
  return (
    <label className="cursor-pointer">
      <input type={type} name={name} checked={checked} onChange={onChange} className="peer sr-only" />
      <span className="block rounded-full border border-home-orange-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 transition-colors hover:border-home-orange-400 peer-checked:border-home-orange-700 peer-checked:bg-home-orange-700 peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-home-orange-500">
        {children}
      </span>
    </label>
  )
}

function CampoSelect({ etiqueta, children, ...propsSelect }) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-gray-900">
        {etiqueta}
      </label>
      <select
        id={id}
        className="mt-1.5 h-12 w-full rounded-xl border-2 border-home-orange-200 bg-white px-3 text-sm text-gray-900 focus:border-home-orange-500 focus:outline-none"
        {...propsSelect}
      >
        {children}
      </select>
    </div>
  )
}

/* ---------- Formulario ---------- */
export default function FormularioPropiedad({ arrendador, onPublicar }) {
  const [datos, setDatos] = useState(DATOS_INICIALES)
  // Cada foto: { id, nombre, url } (url = imagen comprimida en base64)
  const [fotos, setFotos] = useState([])
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [procesandoFotos, setProcesandoFotos] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [tituloPublicado, setTituloPublicado] = useState('')

  const idDescripcion = useId()
  const idGrupoTipo = useId()
  const idGrupoGenero = useId()
  const idGrupoVisitas = useId()
  const idSugerenciasColonia = useId()
  const mensajeExitoRef = useRef(null)

  // Referencias para llevar el foco al primer campo con error
  const refDireccion = useRef(null)
  const refColonia = useRef(null)
  const refUbicacion = useRef(null)
  const refTipo = useRef(null)
  const refGenero = useRef(null)
  const refHabitacionesTotales = useRef(null)
  const refBanos = useRef(null)
  const refRoomies = useRef(null)
  const refPrecio = useRef(null)
  const refDeposito = useRef(null)
  const refVisitas = useRef(null)
  const refFotos = useRef(null)

  const actualizar = (campo, valor) => {
    setDatos((prev) => ({ ...prev, [campo]: valor }))
    if (errores[campo]) setErrores((prev) => ({ ...prev, [campo]: undefined }))
    setTituloPublicado('')
  }

  const alternarEnLista = (campo, clave) => {
    const lista = datos[campo]
    actualizar(campo, lista.includes(clave) ? lista.filter((c) => c !== clave) : [...lista, clave])
  }

  /* ----- Fotos (se comprimen en el navegador) ----- */
  const agregarFotos = async (e) => {
    const archivos = Array.from(e.target.files ?? [])
      .filter((archivo) => archivo.type.startsWith('image/'))
      .slice(0, MAXIMO_FOTOS - fotos.length)
    e.target.value = ''
    if (archivos.length === 0) return

    setProcesandoFotos(true)
    try {
      const nuevas = await Promise.all(
        archivos.map(async (archivo) => ({
          id: `${archivo.name}-${archivo.lastModified}-${Math.random()}`,
          nombre: archivo.name,
          url: await comprimirImagen(archivo, { ladoMaximo: 900, calidad: 0.6 }),
        }))
      )
      setFotos((prev) => [...prev, ...nuevas])
      if (errores.fotos) setErrores((prev) => ({ ...prev, fotos: undefined }))
    } catch {
      setErrores((prev) => ({ ...prev, fotos: 'No pudimos procesar una de las fotos. Usa imágenes JPG o PNG.' }))
    } finally {
      setProcesandoFotos(false)
    }
  }

  const quitarFoto = (id) => setFotos((prev) => prev.filter((f) => f.id !== id))

  /* ----- Envío ----- */
  const coloniaEscrita = datos.colonia.trim()
  const tituloGenerado = datos.tipo && coloniaEscrita ? `${TIPOS_PROPIEDAD[datos.tipo]} en ${coloniaEscrita}` : ''
  const esHabitacion = datos.tipo === 'habitacion' || datos.tipo === 'compartida'
  const coordenadas = leerCoordenadas(datos.ubicacion)

  const alPublicar = async (e) => {
    e.preventDefault()
    setErrorGeneral('')
    const nuevosErrores = validar(datos, fotos)
    setErrores(nuevosErrores)

    // El objeto se arma aquí (en el evento), no durante el render
    const refsPorCampo = {
      direccion: refDireccion,
      colonia: refColonia,
      ubicacion: refUbicacion,
      tipo: refTipo,
      genero: refGenero,
      habitacionesTotales: refHabitacionesTotales,
      banos: refBanos,
      roomies: refRoomies,
      precio: refPrecio,
      deposito: refDeposito,
      visitas: refVisitas,
      fotos: refFotos,
    }
    const primerError = ORDEN_CAMPOS.find((campo) => nuevosErrores[campo])
    if (primerError) {
      refsPorCampo[primerError].current?.focus()
      return
    }

    const precio = Number(datos.precio)
    const nuevaPropiedad = {
      tipo: datos.tipo,
      titulo: tituloGenerado,
      colonia: coloniaEscrita,
      direccion: datos.direccion.trim(),
      coordenadas,
      distanciaKm: distanciaACucei(coordenadas),
      precio,
      deposito: datos.deposito === '' ? precio : Number(datos.deposito),
      calificacion: null,
      numResenas: 0,
      genero: datos.genero,
      serviciosIncluidos: datos.servicios.length > 0,
      disponible: true,
      estado: 'pending', // Toda propiedad nueva pasa por revisión
      motivoRechazo: '',
      fechaPublicacion: hoyComoTexto(),
      // Firestore no acepta valores "undefined": sin foto de perfil se guarda null
      arrendador: { id: arrendador.id, nombre: arrendador.nombre, avatar: arrendador.avatar ?? null },
      imagenes: fotos.map((f) => f.url),
      descripcion: datos.descripcion.trim(),
      habitacionesTotales: Number(datos.habitacionesTotales),
      banos: Number(datos.banos),
      roomies: Number(datos.roomies),
      caracteristicas: datos.caracteristicas,
      servicios: datos.servicios,
      amenidades: datos.amenidades,
      reglas: [...datos.reglas, datos.visitas],
      contratoMeses: Number(datos.contratoMeses),
    }

    setEnviando(true)
    try {
      await onPublicar(nuevaPropiedad)
      setDatos(DATOS_INICIALES)
      setFotos([])
      setTituloPublicado(tituloGenerado)
      setTimeout(() => mensajeExitoRef.current?.focus(), 0)
    } catch (error) {
      console.error('No se pudo publicar la propiedad:', error.code)
      setErrorGeneral(
        error.code === 'permission-denied'
          ? 'No pudimos enviarla. Revisa que ya hayas enviado tus documentos de verificación.'
          : 'No pudimos enviar la propiedad. Revisa tu conexión e inténtalo de nuevo.'
      )
    } finally {
      setEnviando(false)
    }
  }

  const textoDeposito =
    datos.precio && datos.deposito === ''
      ? `Si lo dejas vacío, será igual a un mes de renta (${formatoPrecio(Number(datos.precio) || 0)}).`
      : 'Si lo dejas vacío, será igual a un mes de renta.'

  return (
    <section
      id="publicar"
      aria-labelledby="titulo-publicar"
      className="mt-12 scroll-mt-24 rounded-3xl border border-home-orange-200 bg-white p-6 md:p-8"
    >
      <h2 id="titulo-publicar" className="text-xl font-bold text-gray-900">
        Publicar nueva propiedad
      </h2>
      <p className="mt-1 text-sm text-gray-700">
        El equipo de 2nd HOME revisará la información antes de que aparezca en el catálogo.
      </p>

      {tituloPublicado && (
        <p
          ref={mensajeExitoRef}
          tabIndex={-1}
          role="status"
          className="mt-5 flex items-start gap-2 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-900 focus:outline-none"
        >
          <LuCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            Enviaste <strong>{tituloPublicado}</strong> a revisión. La verás en "Mis propiedades" con el estado
            "Pendiente".
          </span>
        </p>
      )}

      <form onSubmit={alPublicar} noValidate className="mt-6 space-y-6">
        {/* ---------- Ubicación ---------- */}
        <BloqueFormulario titulo="Ubicación">
          <div className="grid gap-5 sm:grid-cols-2">
            <CampoFormulario
              ref={refDireccion}
              etiqueta="Dirección"
              placeholder="Calle y número, ej. Calle Los Pinos 145"
              autoComplete="street-address"
              value={datos.direccion}
              onChange={(e) => actualizar('direccion', e.target.value)}
              error={errores.direccion}
            />
            <CampoFormulario
              ref={refColonia}
              etiqueta="Colonia"
              placeholder="Ej. La Aurora"
              list={idSugerenciasColonia}
              autoComplete="off"
              value={datos.colonia}
              onChange={(e) => actualizar('colonia', e.target.value)}
              ayuda="Escríbela o elige una de las sugerencias."
              error={errores.colonia}
            />
            <datalist id={idSugerenciasColonia}>
              {COLONIAS.map((colonia) => (
                <option key={colonia} value={colonia} />
              ))}
            </datalist>
          </div>

          <CampoFormulario
            ref={refUbicacion}
            etiqueta="Ubicación en el mapa (coordenadas)"
            placeholder="20.6566, -103.3255"
            Icono={LuMapPin}
            value={datos.ubicacion}
            onChange={(e) => actualizar('ubicacion', e.target.value)}
            ayuda="En Google Maps, haz clic derecho sobre tu casa y luego clic en los números que aparecen hasta arriba (se copian solos). Pégalos aquí."
            error={errores.ubicacion}
          />
          {coordenadas && !errores.ubicacion && <VistaPreviaUbicacion coordenadas={coordenadas} />}
        </BloqueFormulario>

        {/* ---------- El espacio ---------- */}
        <BloqueFormulario titulo="El espacio">
          <GrupoOpciones refGrupo={refTipo} titulo="Tipo de espacio" error={errores.tipo}>
            {Object.entries(TIPOS_PROPIEDAD).map(([clave, etiqueta]) => (
              <Chip
                key={clave}
                type="radio"
                name={idGrupoTipo}
                checked={datos.tipo === clave}
                onChange={() => actualizar('tipo', clave)}
              >
                {etiqueta}
              </Chip>
            ))}
          </GrupoOpciones>

          {tituloGenerado && (
            <p className="rounded-2xl bg-home-orange-50 p-3 text-sm text-home-orange-900">
              Título de la publicación: <strong>{tituloGenerado}</strong>
            </p>
          )}

          <GrupoOpciones refGrupo={refGenero} titulo="¿Quién puede vivir ahí?" error={errores.genero}>
            {Object.entries(GENEROS).map(([clave, etiqueta]) => (
              <Chip
                key={clave}
                type="radio"
                name={idGrupoGenero}
                checked={datos.genero === clave}
                onChange={() => actualizar('genero', clave)}
              >
                {etiqueta}
              </Chip>
            ))}
          </GrupoOpciones>

          <GrupoOpciones
            titulo={esHabitacion ? 'Amenidades de la habitación' : 'Amenidades del espacio'}
            ayuda="Lo que tendrá a su disposición quien rente."
          >
            {Object.entries(AMENIDADES).map(([clave, etiqueta]) => (
              <Chip
                key={clave}
                type="checkbox"
                checked={datos.amenidades.includes(clave)}
                onChange={() => alternarEnLista('amenidades', clave)}
              >
                {etiqueta}
              </Chip>
            ))}
          </GrupoOpciones>
        </BloqueFormulario>

        {/* ---------- La casa ---------- */}
        <BloqueFormulario titulo="La casa" descripcion="Datos de toda la casa o el edificio, no solo del espacio en renta.">
          <div className="grid gap-5 sm:grid-cols-3">
            <CampoFormulario
              ref={refHabitacionesTotales}
              etiqueta="Habitaciones"
              type="number"
              inputMode="numeric"
              min={1}
              value={datos.habitacionesTotales}
              onChange={(e) => actualizar('habitacionesTotales', e.target.value)}
              error={errores.habitacionesTotales}
            />
            <CampoFormulario
              ref={refBanos}
              etiqueta="Baños"
              type="number"
              inputMode="numeric"
              min={1}
              value={datos.banos}
              onChange={(e) => actualizar('banos', e.target.value)}
              error={errores.banos}
            />
            <CampoFormulario
              ref={refRoomies}
              etiqueta="Roomies"
              type="number"
              inputMode="numeric"
              min={0}
              value={datos.roomies}
              onChange={(e) => actualizar('roomies', e.target.value)}
              ayuda="Escribe 0 si nadie más vive ahí."
              error={errores.roomies}
            />
          </div>

          <GrupoOpciones titulo="Características de la casa">
            {Object.entries(CARACTERISTICAS).map(([clave, etiqueta]) => (
              <Chip
                key={clave}
                type="checkbox"
                checked={datos.caracteristicas.includes(clave)}
                onChange={() => alternarEnLista('caracteristicas', clave)}
              >
                {etiqueta}
              </Chip>
            ))}
          </GrupoOpciones>
        </BloqueFormulario>

        {/* ---------- Renta y contrato ---------- */}
        <BloqueFormulario titulo="Renta y contrato">
          <div className="grid gap-5 sm:grid-cols-3">
            <CampoFormulario
              ref={refPrecio}
              etiqueta="Renta mensual (MXN)"
              type="number"
              inputMode="numeric"
              min={500}
              step={100}
              placeholder="3700"
              value={datos.precio}
              onChange={(e) => actualizar('precio', e.target.value)}
              error={errores.precio}
            />
            <CampoFormulario
              ref={refDeposito}
              etiqueta="Depósito (MXN)"
              type="number"
              inputMode="numeric"
              min={0}
              step={100}
              value={datos.deposito}
              onChange={(e) => actualizar('deposito', e.target.value)}
              ayuda={textoDeposito}
              error={errores.deposito}
            />
            <CampoSelect
              etiqueta="Duración del contrato"
              value={datos.contratoMeses}
              onChange={(e) => actualizar('contratoMeses', e.target.value)}
            >
              {OPCIONES_CONTRATO.map((meses) => (
                <option key={meses} value={meses}>
                  {meses} meses
                </option>
              ))}
            </CampoSelect>
          </div>
        </BloqueFormulario>

        {/* ---------- Servicios y reglas ---------- */}
        <BloqueFormulario titulo="Servicios y reglas">
          <GrupoOpciones titulo="Servicios incluidos en la renta" ayuda="Marca solo los que no se pagan aparte.">
            {Object.entries(SERVICIOS).map(([clave, etiqueta]) => (
              <Chip
                key={clave}
                type="checkbox"
                checked={datos.servicios.includes(clave)}
                onChange={() => alternarEnLista('servicios', clave)}
              >
                {etiqueta}
              </Chip>
            ))}
          </GrupoOpciones>

          {/* Visitas: solo una opción */}
          <GrupoOpciones refGrupo={refVisitas} titulo="Visitas" error={errores.visitas}>
            {REGLAS_VISITAS.map((clave) => (
              <Chip
                key={clave}
                type="radio"
                name={idGrupoVisitas}
                checked={datos.visitas === clave}
                onChange={() => actualizar('visitas', clave)}
              >
                {REGLAS[clave]}
              </Chip>
            ))}
          </GrupoOpciones>

          {/* El resto de las reglas se pueden combinar */}
          <GrupoOpciones titulo="Otras reglas de la casa">
            {Object.entries(REGLAS)
              .filter(([clave]) => !REGLAS_VISITAS.includes(clave))
              .map(([clave, etiqueta]) => (
                <Chip
                  key={clave}
                  type="checkbox"
                  checked={datos.reglas.includes(clave)}
                  onChange={() => alternarEnLista('reglas', clave)}
                >
                  {etiqueta}
                </Chip>
              ))}
          </GrupoOpciones>
        </BloqueFormulario>

        {/* ---------- Descripción y fotos ---------- */}
        <BloqueFormulario titulo="Descripción y fotos">
          <div>
            <label htmlFor={idDescripcion} className="text-sm font-semibold text-gray-900">
              Descripción <span className="font-normal text-gray-600">(opcional)</span>
            </label>
            <textarea
              id={idDescripcion}
              rows={4}
              value={datos.descripcion}
              onChange={(e) => actualizar('descripcion', e.target.value)}
              placeholder="¿Qué hace especial a tu espacio? Luz, ambiente, cercanía con rutas de camión…"
              className="mt-1.5 w-full resize-y rounded-xl border-2 border-home-orange-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:border-home-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900">Fotos</p>
            <p className="mt-0.5 text-xs text-gray-600">
              Hasta {MAXIMO_FOTOS} fotos. La primera será la portada en el catálogo.
            </p>

            <ul className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-5">
              {fotos.map((foto, indice) => (
                <li key={foto.id} className="relative aspect-square overflow-hidden rounded-2xl bg-home-orange-100">
                  <img src={foto.url} alt={`Foto ${indice + 1}: ${foto.nombre}`} className="h-full w-full object-cover" />
                  {indice === 0 && (
                    <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-home-orange-900">
                      Portada
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => quitarFoto(foto.id)}
                    aria-label={`Quitar foto ${indice + 1}`}
                    className={`absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-gray-800 hover:bg-white ${ENFOQUE}`}
                  >
                    <LuX className="h-4 w-4" aria-hidden="true" />
                  </button>
                </li>
              ))}

              {fotos.length < MAXIMO_FOTOS && (
                <li>
                  <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-home-orange-300 text-center text-xs font-semibold text-home-orange-800 transition-colors hover:bg-home-orange-50 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-home-orange-500">
                    {procesandoFotos ? (
                      <LuLoader className="h-6 w-6 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                    ) : (
                      <LuImagePlus className="h-6 w-6" aria-hidden="true" />
                    )}
                    {procesandoFotos ? 'Procesando…' : 'Agregar fotos'}
                    <input
                      ref={refFotos}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={agregarFotos}
                      disabled={procesandoFotos}
                      className="sr-only"
                    />
                  </label>
                </li>
              )}
            </ul>
            {errores.fotos && <p className="mt-1.5 text-sm font-medium text-red-700">{errores.fotos}</p>}
          </div>
        </BloqueFormulario>

        {errorGeneral && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {errorGeneral}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando || procesandoFotos}
          className={`flex h-12 w-full items-center justify-center gap-2 rounded-full bg-home-orange-700 px-8 font-semibold text-white transition-colors hover:bg-home-orange-800 disabled:cursor-wait disabled:opacity-80 sm:w-auto ${ENFOQUE}`}
        >
          {enviando && <LuLoader className="h-5 w-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
          {enviando ? 'Enviando…' : 'Enviar a revisión'}
        </button>
      </form>
    </section>
  )
}