import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import DetallePropiedad from './pages/DetallePropiedad'

// App temporal: se irá completando conforme construyamos las páginas
function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/propiedad/:id" element={<DetallePropiedad />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App