import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SesionProvider from './context/SesionProvider'
import RutaProtegida from './components/RutaProtegida'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import DetallePropiedad from './pages/DetallePropiedad'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Chat from './pages/Chat'

// App temporal: se irá completando conforme construyamos las páginas
function App() {
  return (
    <BrowserRouter>
      <SesionProvider>
        <Navbar />
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/registro/:tipo" element={<Registro />} />

          {/* Rutas que requieren sesión */}
          <Route element={<RutaProtegida />}>
            <Route path="/" element={<Home />} />
            <Route path="/propiedad/:id" element={<DetallePropiedad />} />
            <Route path="/chat" element={<Chat />} />
          </Route>
        </Routes>
      </SesionProvider>
    </BrowserRouter>
  )
}

export default App