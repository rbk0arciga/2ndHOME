import { VERSION_AVISO, CORREO_PRIVACIDAD } from '../utils/avisoPrivacidad'

export default function ContenidoAviso({ nivel = 2 }) {
  const Titulo = `h${nivel}`

  const Seccion = ({ titulo, children }) => (
    <section className="border-t border-home-orange-100 pt-6">
      <Titulo className="text-lg font-bold text-gray-900">{titulo}</Titulo>
      <div className="mt-3 space-y-3 leading-relaxed text-gray-800">{children}</div>
    </section>
  )

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-600">Versión {VERSION_AVISO} · Última actualización: noviembre de 2026</p>
        <p className="mt-4 rounded-2xl bg-home-orange-50 p-4 text-sm text-home-orange-900">
          2nd HOME es un prototipo desarrollado como proyecto modular en el Centro Universitario de Ciencias Exactas e
          Ingenierías (CUCEI) de la Universidad de Guadalajara. Este aviso explica qué datos pedimos, para qué los
          usamos y cómo los protegemos, conforme a la Ley Federal de Protección de Datos Personales en Posesión de los
          Particulares.
        </p>
      </div>

      <Seccion titulo="Quién es responsable de tus datos">
        <p>
          El equipo de desarrollo de 2nd HOME es responsable del tratamiento de tus datos personales. Para cualquier
          duda o solicitud, escríbenos a <span className="font-semibold">{CORREO_PRIVACIDAD}</span>.
        </p>
      </Seccion>

      <Seccion titulo="Qué datos pedimos">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Para crear tu cuenta:</strong> nombre, correo electrónico y contraseña. Si eres 2nd GUEST, tu
            carrera; si eres 2nd HOST, tu teléfono.
          </li>
          <li>
            <strong>Si eres aspirante de primer ingreso:</strong> tu ficha de admisión, para comprobar que fuiste
            aceptado en CUCEI mientras recibes tu correo institucional.
          </li>
          <li>
            <strong>Si eres 2nd HOST:</strong> una identificación oficial y un comprobante de domicilio del inmueble
            que rentas, para comprobar que el lugar existe y que eres responsable de él.
          </li>
          <li>
            <strong>Lo que publicas:</strong> propiedades, mensajes, reseñas, publicaciones y comentarios en
            Comunidad, y los reportes que envías.
          </li>
        </ul>
        <p>
          Tu identificación oficial, tu comprobante de domicilio y tu ficha de admisión contienen datos personales que
          tratamos con especial cuidado, como se explica más abajo.
        </p>
      </Seccion>

      <Seccion titulo="Para qué usamos tus datos">
        <ul className="list-disc space-y-2 pl-5">
          <li>Crear y administrar tu cuenta.</li>
          <li>Verificar que eres estudiante o aspirante de CUCEI, o que eres responsable del inmueble que publicas.</li>
          <li>Mostrar tus publicaciones y permitir el contacto entre 2nd GUESTS y 2nd HOSTS dentro de la plataforma.</li>
          <li>Atender reportes y mantener la seguridad de la comunidad, incluida la suspensión de cuentas.</li>
        </ul>
        <p>No usamos tus datos para publicidad ni los vendemos.</p>
      </Seccion>

      <Seccion titulo="Cómo tratamos tus documentos">
        <ul className="list-disc space-y-2 pl-5">
          <li>Solo el equipo de administración de 2nd HOME puede ver los documentos que subes.</li>
          <li>
            Los usamos únicamente para la verificación y los eliminamos en cuanto termina la revisión, se apruebe o se
            rechace.
          </li>
          <li>Los demás usuarios nunca ven tus documentos.</li>
        </ul>
      </Seccion>

      <Seccion titulo="Qué ven los demás usuarios">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Los 2nd HOSTS</strong> ven tu nombre y tu carrera. Si eres aspirante de primer ingreso, también ven
            esa leyenda, para que sepan que todavía no tienes correo institucional y decidan si te aceptan.
          </li>
          <li>
            <strong>Los 2nd GUESTS</strong> ven el nombre de los 2nd HOSTS, sus propiedades y la información que cada
            uno decide mostrar en su perfil.
          </li>
          <li>Tu correo y tu teléfono no se muestran a otros usuarios.</li>
        </ul>
      </Seccion>

      <Seccion titulo="Con quién compartimos tus datos">
        <p>
          No compartimos tus datos con terceros, salvo que una autoridad competente lo requiera conforme a la ley. La
          información se guarda en los servicios de Google Firebase, que usamos para operar la plataforma.
        </p>
      </Seccion>

      <Seccion titulo="Tus derechos">
        <p>
          Puedes pedir acceso a tus datos, corregirlos, cancelarlos u oponerte a su uso (derechos ARCO), así como
          revocar tu consentimiento. Para hacerlo, escríbenos a{' '}
          <span className="font-semibold">{CORREO_PRIVACIDAD}</span> desde el correo de tu cuenta e indica qué
          solicitas. Te responderemos por el mismo medio.
        </p>
      </Seccion>

      <Seccion titulo="Cambios a este aviso">
        <p>
          Si cambiamos este aviso, publicaremos la nueva versión en esta página y te pediremos aceptarla de nuevo
          cuando el cambio afecte el uso de tus datos.
        </p>
      </Seccion>
    </div>
  )
}