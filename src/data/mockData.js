// Datos falsos (mock) para construir la interfaz antes de conectar Firebase.
// Cada arreglo exportado representa una futura colección de Firestore:
// usuarios, propiedades, reseñas, conversaciones y publicaciones.
// ==========================================================

// ---------- Punto de referencia ----------
// Coordenadas aproximadas de CUCEI 
export const CUCEI = { nombre: 'CUCEI', lat: 20.6566, lng: -103.3255 }

// ---------- Catálogos ----------
// Cada catálogo relaciona una clave interna con el texto que ve el usuario.
// Las propiedades guardan solo las claves; así los filtros, el formulario del
// arrendador y las tarjetas comparten exactamente las mismas opciones.
// Los íconos se asignan en cada componente, no aquí.
export const TIPOS_PROPIEDAD = {
  habitacion: 'Habitación individual',
  compartida: 'Habitación compartida',
  departamento: 'Departamento',
  loft: 'Loft',
}

export const GENEROS = {
  mujeres: 'Solo mujeres',
  hombres: 'Solo hombres',
  mixto: 'Mixto',
}

export const SERVICIOS = {
  wifi: 'Wifi',
  agua: 'Agua',
  luz: 'Electricidad',
  gas: 'Gas',
  limpieza: 'Limpieza de áreas comunes',
  tv: 'TV con cable',
}

export const CARACTERISTICAS = {
  lavado: 'Área de lavado',
  cocina: 'Cocina equipada',
  estudio: 'Área de estudio',
  baño: 'Baño compartido',
  patio: 'Patio',
  terraza: 'Terraza',
  accesoUnico: 'Entrada de acceso único',
  comedor: 'Comedor',
  estacionamiento: 'Estacionamiento',
}

export const AMENIDADES = {
  camaIndividual: 'Cama individual',
  camaMatrimonial: 'Cama matrimonial',
  ventilador: 'Ventilador',
  escritorio: 'Escritorio',
  banoPrivado: 'Baño completo privado',
  armario: 'Armario',
  entrada: 'Entrada independiente',
}

export const REGLAS = {
  noMascotas: 'No se permiten mascotas',
  noFiestas: 'No se permiten fiestas',
  noFumar: 'No fumar',
  noVisitas: 'No se permiten visitas',
  visitasConHorario: 'Visitas con horario',
  visitasLibres: 'Se permiten visitas',
}

// Reglas de visitas: se elige solo una (las demás reglas se pueden combinar)
export const REGLAS_VISITAS = ['noVisitas', 'visitasConHorario', 'visitasLibres']

export const COLONIAS = [
  'Olímpica',
  'Blanco y Cuéllar',
  'La Aurora',
  'San Carlos',
  'Atlas',
  'Las Conchas',
  'Del Fresno',
]

export const ESTADOS_REVISION = {
  pending: 'Pendiente',
  approved: 'Aprobada',
  rejected: 'Rechazada',
}

export const CATEGORIAS_COMUNIDAD = {
  aviso: 'Aviso',
  venta: 'Compra-venta',
  recomendacion: 'Recomendación',
  pregunta: 'Pregunta',
}

// ---------- Consejos (banner rotativo del catálogo) ----------
export const consejos = [
  {
    id: 'consejo-1',
    titulo: 'Visita antes de pagar el depósito',
    texto: 'Agenda una visita desde el chat y revisa la habitación en persona. No transfieras dinero por un lugar que no has visto.',
    imagen: '/img/consejos/visita.jpg',
  },
  {
    id: 'consejo-2',
    titulo: 'Lee el contrato con calma',
    texto: 'Confirma la duración, qué servicios incluye la renta y en qué casos te devuelven el depósito.',
    imagen: '/img/consejos/contrato.jpg',
  },
  {
    id: 'consejo-3',
    titulo: 'Calcula tu presupuesto mensual',
    texto: 'Además de la renta, suma comida, transporte, copias y lavandería. Te evitará sorpresas a mitad del semestre.',
    imagen: '/img/consejos/presupuesto.jpg',
  },
  {
    id: 'consejo-4',
    titulo: 'Prueba el trayecto a CUCEI',
    texto: 'Haz el recorrido a la hora en que tendrías clase para conocer el tráfico real y las rutas de transporte.',
    imagen: '/img/consejos/trayecto.jpg',
  },
  {
    id: 'consejo-5',
    titulo: 'Conoce a tus roomies',
    texto: 'Pregunta por sus horarios y hábitos de estudio. Una buena convivencia vale tanto como una buena ubicación.',
    imagen: '/img/consejos/roomies.jpg',
  },
  {
    id: 'consejo-6',
    titulo: 'Seguridad ante todo',
    texto: 'Todas las propiedades de 2ndHome fueron verificadas por nuestro equipo. Aun así, revisa cerraduras, iluminación y accesos antes de mudarte.',
    imagen: '/img/consejos/seguridad.jpg',
  },
]

// ---------- Reportes ----------
export const TIPOS_REPORTE = {
  conversacion: 'Conversación',
  propiedad: 'Propiedad',
  publicacion: 'Comunidad',
}

export const MOTIVOS_REPORTE = {
  pideDinero: 'Pide dinero antes de visitar',
  acoso: 'Lenguaje ofensivo o acoso',
  informacionFalsa: 'Información falsa',
  otro: 'Otro motivo',
}

// ---------- Funciones de ayuda 
// Minutos aproximados caminando (velocidad promedio de 5 km/h)
export const minutosAPie = (km) => Math.round((km / 5) * 60)

// Formatea 3700 como "$3,700"
export const formatoPrecio = (cantidad) =>
  cantidad.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })

export const direccionCompleta = (propiedad) =>
  `${propiedad.direccion}, Col. ${propiedad.colonia}, Guadalajara, Jal.`