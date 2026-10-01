import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { LuHouse, LuMapPin, LuWifi } from 'react-icons/lu'
import { FaStar, FaStarHalfAlt } from 'react-icons/fa'

// PRUEBA TEMPORAL DE LA FASE 1
// Este archivo se reemplazará por completo al final de la Fase 2.

// Importante: Tailwind solo genera las clases que encuentra escritas completas
// en el código. Algo como `bg-home-orange-${tono}` NO funcionaría, por eso
// cada clase está escrita entera.
const paleta = [
  { tono: 50, clase: 'bg-home-orange-50' },
  { tono: 100, clase: 'bg-home-orange-100' },
  { tono: 200, clase: 'bg-home-orange-200' },
  { tono: 300, clase: 'bg-home-orange-300' },
  { tono: 400, clase: 'bg-home-orange-400' },
  { tono: 500, clase: 'bg-home-orange-500' },
  { tono: 600, clase: 'bg-home-orange-600' },
  { tono: 700, clase: 'bg-home-orange-700' },
  { tono: 800, clase: 'bg-home-orange-800' },
  { tono: 900, clase: 'bg-home-orange-900' },
]

function PaginaPrueba() {
  return (
    <section className="mx-auto max-w-4xl space-y-8 p-6">
      <h1 className="text-3xl font-bold text-home-orange-800">Prueba del entorno 2nd HOME</h1>

      {/* Paleta: 2 columnas en móvil, 5 en pantallas medianas en adelante */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {paleta.map(({ tono, clase }) => (
          <div key={tono} className="overflow-hidden rounded-lg border border-home-orange-200 bg-white">
            <div className={`h-16 ${clase}`} />
            <p className="px-2 py-1 text-sm font-medium">{tono}</p>
          </div>
        ))}
      </div>

      {/* React Icons: Lucide para la interfaz, Font Awesome para las estrellas */}
      <div className="flex flex-wrap items-center gap-4 text-home-orange-500">
        <LuHouse className="h-7 w-7" />
        <LuMapPin className="h-7 w-7" />
        <LuWifi className="h-7 w-7" />
        <span className="flex text-home-orange-400">
          <FaStar /><FaStar /><FaStar /><FaStar /><FaStarHalfAlt />
        </span>
        <span className="text-sm text-home-orange-700">A 2.8 km de CUCEI</span>
      </div>

      {/* Botón principal con estado hover */}
      <button className="rounded-full bg-home-orange-500 px-6 py-3 font-semibold text-white hover:bg-home-orange-600">
        Botón de prueba
      </button>

      {/* React Router: navega sin recargar la página */}
      <p>
        <Link to="/prueba-ruta" className="font-medium text-home-orange-700 underline">
          Probar navegación
        </Link>
      </p>
    </section>
  )
}

function OtraRuta() {
  return (
    <section className="mx-auto max-w-4xl space-y-4 p-6">
      <h1 className="text-3xl font-bold text-home-orange-800">React Router funciona</h1>
      <Link to="/" className="font-medium text-home-orange-700 underline">
        Volver a la prueba
      </Link>
    </section>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PaginaPrueba />} />
        <Route path="/prueba-ruta" element={<OtraRuta />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App