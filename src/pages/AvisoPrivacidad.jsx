import { Link } from 'react-router-dom'
import { LuShieldCheck } from 'react-icons/lu'
import ContenidoAviso from '../components/ContenidoAviso'

const ENFOQUE =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-home-orange-500'

export default function AvisoPrivacidad() {
  return (
    <main className="px-4 pb-16 pt-8 md:pt-12">
      <article className="mx-auto max-w-3xl rounded-3xl border border-home-orange-200 bg-white p-6 sm:p-10">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-home-orange-100 text-home-orange-700">
          <LuShieldCheck className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="mb-2 mt-4 text-2xl font-bold text-gray-900 md:text-3xl">Aviso de privacidad</h1>

        <ContenidoAviso nivel={2} />

        <footer className="mt-6 border-t border-home-orange-100 pt-6 text-sm">
          <Link
            to="/login"
            className={`rounded font-semibold text-home-orange-800 underline underline-offset-4 hover:text-home-orange-900 ${ENFOQUE}`}
          >
            Volver a 2nd HOME
          </Link>
        </footer>
      </article>
    </main>
  )
}