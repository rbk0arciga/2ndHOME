import { Link } from 'react-router-dom'
import { LuGraduationCap } from 'react-icons/lu'
import { formatoFechaLarga } from '../firebase/admision'
import { diasRestantes } from '../utils/aspirantes'

export default function AvisoVigenciaAspirante({ usuario }) {
  const dias = diasRestantes(usuario.vigenteHasta)
  let cuando = `en ${dias} días`
  if (dias === 0) cuando = 'hoy'
  else if (dias === 1) cuando = 'mañana'

  return (
    <div className="border-b border-sky-200 bg-sky-50">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 text-sm text-sky-950 md:px-8">
        <LuGraduationCap className="h-5 w-5 shrink-0" aria-hidden="true" />
        <p className="min-w-0 flex-1">
          Tu cuenta de aspirante vence <strong>{cuando}</strong> ({formatoFechaLarga(usuario.vigenteHasta.toDate())}).
          Cambia a tu correo institucional antes para no perder el acceso.
        </p>
        <Link
          to="/actualizar-correo"
          className="rounded font-semibold underline underline-offset-4 hover:text-sky-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
        >
          Cambiar mi correo
        </Link>
      </div>
    </div>
  )
}