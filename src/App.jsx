import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SesionProvider from './context/SesionProvider'
import PropiedadesProvider from './context/PropiedadesProvider'
import RutaProtegida from './components/RutaProtegida'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import DetallePropiedad from './pages/DetallePropiedad'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Chat from './pages/Chat'
import PerfilEstudiante from './pages/PerfilEstudiante'
import PerfilArrendador from './pages/PerfilArrendador'

// App temporal: se irá completando conforme construyamos las páginas
function App() {
  return (
    <BrowserRouter>
      <SesionProvider>
        <PropiedadesProvider>
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
              <Route path="/perfil-estudiante" element={<PerfilEstudiante />} />
              <Route path="/perfil-arrendador" element={<PerfilArrendador />} />
              <Route path="/perfil-arrendador/:id" element={<PerfilArrendador />} />
            </Route>
          </Routes>
        </PropiedadesProvider>
      </SesionProvider>
    </BrowserRouter>
  )
}

export default App