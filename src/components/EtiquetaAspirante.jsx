import { LuGraduationCap } from 'react-icons/lu'

// Leyenda para identificar a un aspirante de primer ingreso (todavía sin correo institucional).
export default function EtiquetaAspirante({ detalle = false }) {
  const etiqueta = (
    <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-900">
      <LuGraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
      Aspirante de primer ingreso
    </span>
  )

  if (!detalle) return etiqueta

  return (
    <div className="rounded-2xl border border-sky-200 bg-sky-50 p-3 text-sm text-sky-950">
      {etiqueta}
      <p className="mt-2 leading-relaxed">
        Todavía no tiene correo institucional. El equipo de 2nd HOME revisó su ficha de admisión a CUCEI, pero aún no
        puede confirmar su inscripción. Tú decides si lo aceptas como inquilino.
      </p>
    </div>
  )
}