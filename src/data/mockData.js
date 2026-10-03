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
  roomies: 'Número de roomies',
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
  noascotas: 'No se permiten mascotas',
  visitas: 'Visitas con horario',
  fiestas: 'No se permiten fiestas',
  fumar: 'No fumar',
  drogas: 'No se permiten drogas',
}

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

// ---------- Usuarios de ejemplo (uno por rol) ----------
export const usuarios = [
  {
    id: 'u1',
    rol: 'estudiante',
    nombre: 'Daniela Ortiz',
    correo: 'daniela.ortiz@alumnos.udg.mx',
    avatar: '/img/avatares/daniela.png',
    carrera: 'Ingeniería en Computación',
    semestre: 4,
    origen: 'Colima, Colima',
    miembroDesde: '2025-08',
    bio: 'Vengo de Colima. Busco un lugar tranquilo para estudiar y cerca del campus.',
    favoritos: ['p1', 'p4'],
    // Lugares donde ha vivido a través de 2ndHome
    historial: [{ propiedadId: 'p3', desde: '2025-08', hasta: '2026-06' }],
  },
  {
    id: 'u2',
    rol: 'arrendador',
    nombre: 'Silvia Martínez',
    correo: 'silvia.martinez@correo.com',
    avatar: '/img/avatares/silvia.png',
    profesion: 'Docente de secundaria',
    edad: 56,
    pasatiempo: 'La jardinería',
    anfitrionDesde: '2024-09',
    bio: 'Soy docente con más de 25 años de experiencia. Sé lo importante que es un entorno ordenado y tranquilo para estudiar. Mi casa tiene mucha vegetación y me aseguro de que cada estudiante tenga la privacidad y el respeto que necesita.',
  },
  {
    id: 'u3',
    rol: 'admin',
    nombre: 'Equipo 2ndHome',
    correo: 'admin@2ndhome.mx',
    avatar: null,
  },
]

// Simula la sesión iniciada mientras no exista Firebase Authentication.
export const usuarioActual = usuarios.find((u) => u.id === 'u1')

// ---------- Propiedades ----------
// estado: 'approved' aparece en el catálogo; 'pending' y 'rejected' solo en el panel de administración.
// Los datos del arrendador van copiados dentro de cada propiedad (práctica común en
// Firestore para no hacer una consulta extra por cada tarjeta).
// Las coordenadas son aproximadas e ilustrativas.
export const propiedades = [
  {
    id: 'p1',
    tipo: 'habitacion',
    titulo: 'Habitación en La Aurora',
    colonia: 'La Aurora',
    direccion: 'Calle Los Pinos 145',
    coordenadas: { lat: 20.6448, lng: -103.3121 },
    distanciaKm: 2.8,
    precio: 3700,
    deposito: 3700,
    calificacion: 4.7,
    numResenas: 15,
    genero: 'mujeres',
    serviciosIncluidos: true,
    disponible: true,
    estado: 'approved',
    fechaPublicacion: '2026-07-15',
    arrendador: { id: 'u2', nombre: 'Silvia Martínez', avatar: '/img/avatares/silvia.png' },
    imagenes: ['/img/propiedades/p1-1.jpg', '/img/propiedades/p1-2.jpg', '/img/propiedades/p1-3.jpg'],
    descripcion: 'Habitación cálida y bien iluminada en una casa tranquila con jardín. Ideal para quien busca un ambiente ordenado para estudiar.',
    habitacionesTotales: 7,
    banos: 8,
    roomies: 8,
    caracteristicas: ['lavado', 'cocina', 'estudio', 'patio', 'accesoUnico', 'comedor', 'estacionamiento'],
    servicios: ['wifi', 'agua', 'luz', 'limpieza', 'tv'],
    amenidades: ['camaIndividual', 'ventilador', 'escritorio', 'banoPrivado', 'armario'],
    reglas: ['noMascotas', 'visitasConHorario', 'noFiestas', 'noFumar'],
    contratoMeses: 6,
  },
  {
    id: 'p2',
    tipo: 'habitacion',
    titulo: 'Habitación con terraza en La Aurora',
    colonia: 'La Aurora',
    direccion: 'Calle Los Pinos 145',
    coordenadas: { lat: 20.6448, lng: -103.3121 },
    distanciaKm: 2.8,
    precio: 3700,
    deposito: 3700,
    calificacion: 4.7,
    numResenas: 4,
    genero: 'mujeres',
    serviciosIncluidos: true,
    disponible: true,
    estado: 'approved',
    fechaPublicacion: '2026-08-01',
    arrendador: { id: 'u2', nombre: 'Silvia Martínez', avatar: '/img/avatares/silvia.png' },
    imagenes: ['/img/propiedades/p2-1.jpg', '/img/propiedades/p2-2.jpg'],
    descripcion: 'Habitación en la misma casa, con acceso directo a la terraza con plantas. Muy silenciosa por las tardes.',
    habitacionesTotales: 7,
    banos: 8,
    roomies: 8,
    caracteristicas: ['lavado', 'cocina', 'estudio', 'terraza', 'comedor'],
    servicios: ['wifi', 'agua', 'luz', 'limpieza'],
    amenidades: ['camaIndividual', 'escritorio', 'armario'],
    reglas: ['noMascotas', 'visitasConHorario', 'noFiestas', 'noFumar'],
    contratoMeses: 6,
  },
  {
    id: 'p3',
    tipo: 'habitacion',
    titulo: 'Habitación Casa Rose en Las Conchas',
    colonia: 'Las Conchas',
    direccion: 'Av. de las Rosas 2310',
    coordenadas: { lat: 20.6612, lng: -103.3712 },
    distanciaKm: 5,
    precio: 3500,
    deposito: 3500,
    calificacion: 4.1,
    numResenas: 19,
    genero: 'mujeres',
    serviciosIncluidos: true,
    disponible: true,
    estado: 'approved',
    fechaPublicacion: '2026-05-20',
    arrendador: { id: 'a1', nombre: 'Vanessa Ramos', avatar: '/img/avatares/vanessa.png' },
    imagenes: ['/img/propiedades/p3-1.jpg', '/img/propiedades/p3-2.jpg'],
    descripcion: 'Habitación con mucha luz natural y decoración alegre. La casa está cerca de rutas de camión hacia CUCEI.',
    habitacionesTotales: 4,
    banos: 2,
    roomies: 4,
    caracteristicas: ['lavado', 'cocina', 'comedor'],
    servicios: ['wifi', 'agua', 'luz', 'gas'],
    amenidades: ['camaIndividual', 'escritorio', 'armario'],
    reglas: ['noMascotas', 'noFiestas', 'noFumar'],
    contratoMeses: 6,
  },
  {
    id: 'p4',
    tipo: 'loft',
    titulo: 'Loft para una persona en la Olímpica',
    colonia: 'Olímpica',
    direccion: 'Calle Juegos olímpicos 812',
    coordenadas: { lat: 20.6581, lng: -103.3402 },
    distanciaKm: 1.6,
    precio: 5300,
    deposito: 5300,
    calificacion: 4.5,
    numResenas: 9,
    genero: 'mixto',
    serviciosIncluidos: true,
    disponible: true,
    estado: 'approved',
    fechaPublicacion: '2026-06-10',
    arrendador: { id: 'a2', nombre: 'Sara Gómez', avatar: '/img/avatares/sara.png' },
    imagenes: ['/img/propiedades/p4-1.jpg', '/img/propiedades/p4-2.jpg'],
    descripcion: 'Loft independiente con sala, cocineta y baño propio. Perfecto si buscas privacidad total a pocos minutos del campus.',
    habitacionesTotales: 1,
    banos: 1,
    roomies: 0,
    caracteristicas: ['cocina', 'accesoUnico', 'estudio'],
    servicios: ['wifi', 'agua', 'luz', 'gas', 'tv'],
    amenidades: ['camaMatrimonial', 'escritorio', 'banoPrivado', 'armario'],
    reglas: ['noFiestas', 'noFumar'],
    contratoMeses: 12,
  },
  {
    id: 'p5',
    tipo: 'habitacion',
    titulo: 'Habitación en Blanco y Cuéllar',
    colonia: 'Blanco y Cuéllar',
    direccion: 'Calle Fresnillo 437',
    coordenadas: { lat: 20.6702, lng: -103.3051 },
    distanciaKm: 3.8,
    precio: 2900,
    deposito: 2900,
    calificacion: 4.8,
    numResenas: 6,
    genero: 'hombres',
    serviciosIncluidos: true,
    disponible: true,
    estado: 'approved',
    fechaPublicacion: '2026-07-02',
    arrendador: { id: 'a3', nombre: 'Eduardo López', avatar: '/img/avatares/eduardo.png' },
    imagenes: ['/img/propiedades/p5-1.jpg'],
    descripcion: 'Habitación sencilla y cómoda con escritorio amplio. Una de las opciones más económicas de la zona.',
    habitacionesTotales: 5,
    banos: 3,
    roomies: 5,
    caracteristicas: ['lavado', 'cocina', 'patio'],
    servicios: ['wifi', 'agua', 'luz'],
    amenidades: ['camaIndividual', 'escritorio', 'armario'],
    reglas: ['noMascotas', 'visitasConHorario', 'noFumar'],
    contratoMeses: 6,
  },
  {
    id: 'p6',
    tipo: 'compartida',
    titulo: 'Habitación compartida en San Carlos',
    colonia: 'San Carlos',
    direccion: 'Calle Mezquite 1290',
    coordenadas: { lat: 20.6489, lng: -103.3348 },
    distanciaKm: 1.7,
    precio: 3400,
    deposito: 3400,
    calificacion: 4.0,
    numResenas: 12,
    genero: 'mixto',
    serviciosIncluidos: true,
    disponible: true,
    estado: 'approved',
    fechaPublicacion: '2026-04-18',
    arrendador: { id: 'a4', nombre: 'Josué Acevedo', avatar: '/img/avatares/josue.png' },
    imagenes: ['/img/propiedades/p6-1.jpg'],
    descripcion: 'Habitación amplia para dos personas con aire acondicionado. Buena opción si vienes con alguien conocido.',
    habitacionesTotales: 3,
    banos: 2,
    roomies: 6,
    caracteristicas: ['lavado', 'cocina', 'comedor'],
    servicios: ['wifi', 'agua', 'luz', 'limpieza'],
    amenidades: ['camaIndividual', 'armario'],
    reglas: ['noMascotas', 'noFiestas'],
    contratoMeses: 6,
  },
  {
    id: 'p7',
    tipo: 'departamento',
    titulo: 'Departamento en Del Fresno',
    colonia: 'Del Fresno',
    direccion: 'Calle Ébano 210',
    coordenadas: { lat: 20.6402, lng: -103.3561 },
    distanciaKm: 4.2,
    precio: 6800,
    deposito: 6800,
    calificacion: null, // Sin reseñas: aún no se publica
    numResenas: 0,
    genero: 'mixto',
    serviciosIncluidos: false,
    disponible: true,
    estado: 'pending',
    fechaPublicacion: '2026-09-27',
    arrendador: { id: 'a5', nombre: 'Laura Del Río', avatar: '/img/avatares/laura.png' },
    imagenes: ['/img/propiedades/p7-1.jpg'],
    descripcion: 'Departamento de dos recámaras, ideal para compartir entre dos estudiantes. Servicios no incluidos.',
    habitacionesTotales: 2,
    banos: 1,
    roomies: 2,
    caracteristicas: ['lavado', 'cocina', 'comedor', 'estacionamiento'],
    servicios: [],
    amenidades: ['camaMatrimonial', 'armario'],
    reglas: ['noFiestas'],
    contratoMeses: 12,
  },
  {
    id: 'p8',
    tipo: 'habitacion',
    titulo: 'Habitación Casa Pía en Atlas',
    colonia: 'Atlas',
    direccion: 'Calle Laurel 618',
    coordenadas: { lat: 20.6421, lng: -103.3219 },
    distanciaKm: 2.8,
    precio: 4500,
    deposito: 4500,
    calificacion: null,
    numResenas: 0,
    genero: 'mujeres',
    serviciosIncluidos: true,
    disponible: true,
    estado: 'pending',
    fechaPublicacion: '2026-09-29',
    arrendador: { id: 'a6', nombre: 'Edgar Fernández', avatar: '/img/avatares/edgar.png' },
    imagenes: ['/img/propiedades/p8-1.jpg'],
    descripcion: 'Habitación con librero empotrado y ventana grande. Casa recién remodelada.',
    habitacionesTotales: 4,
    banos: 3,
    roomies: 4,
    caracteristicas: ['lavado', 'cocina', 'estudio'],
    servicios: ['wifi', 'agua', 'luz', 'limpieza'],
    amenidades: ['camaIndividual', 'escritorio', 'armario'],
    reglas: ['noMascotas', 'visitasConHorario', 'noFumar'],
    contratoMeses: 6,
  },
]

// ---------- Reseñas ----------
export const resenas = [
  {
    id: 'r1',
    propiedadId: 'p1',
    autorId: null,
    autorNombre: 'Flor García',
    autorCarrera: 'Ingeniería Biomédica',
    avatar: '/img/avatares/flor.png',
    calificacion: 5,
    fecha: '2026-06-20',
    comentario: 'Como estudiante de ingeniería, el silencio es sagrado para mí. Silvia respeta muchísimo la privacidad y los horarios de estudio. Mi estancia de un año fue impecable.',
  },
  {
    id: 'r2',
    propiedadId: 'p1',
    autorId: null,
    autorNombre: 'Melissa Vega',
    autorCarrera: 'Licenciatura en Química',
    avatar: '/img/avatares/melissa.png',
    calificacion: 5,
    fecha: '2026-05-11',
    comentario: 'Llegué a la ciudad sin conocer a nadie y Silvia fue de gran ayuda. Su jardín en la terraza es el mejor lugar para desconectarse un rato.',
  },
  {
    id: 'r3',
    propiedadId: 'p1',
    autorId: null,
    autorNombre: 'Mariana Rojas',
    autorCarrera: 'Ingeniería Química',
    avatar: '/img/avatares/mariana.png',
    calificacion: 4,
    fecha: '2026-02-03',
    comentario: 'La casa es tranquila y limpia. El único detalle es que el wifi se satura en temporada de exámenes.',
  },
  {
    id: 'r4',
    propiedadId: 'p3',
    autorId: 'u1',
    autorNombre: 'Daniela Ortiz',
    autorCarrera: 'Ingeniería en Computación',
    avatar: '/img/avatares/daniela.png',
    calificacion: 4,
    fecha: '2026-06-28',
    comentario: 'Viví aquí dos semestres. La habitación tiene muy buena luz y Vanessa responde rápido. Está algo lejos, conviene tomar el camión.',
  },
  {
    id: 'r5',
    propiedadId: 'p5',
    autorId: null,
    autorNombre: 'Luis Hernández',
    autorCarrera: 'Ingeniería Civil',
    avatar: '/img/avatares/luis.png',
    calificacion: 5,
    fecha: '2026-07-30',
    comentario: 'Excelente relación calidad-precio. Eduardo está al pendiente de cualquier reparación.',
  },
]

// ---------- Conversaciones de chat ----------
export const conversaciones = [
  {
    id: 'c1',
    estudianteId: 'u1',
    arrendador: { id: 'u2', nombre: 'Silvia Martínez', avatar: '/img/avatares/silvia.png' },
    propiedadId: 'p1',
    noLeidos: 1,
    mensajes: [
      { id: 'm1', autorId: 'u1', texto: 'Hola, Silvia. ¿La habitación sigue disponible para el próximo semestre?', fecha: '2026-09-28T18:05' },
      { id: 'm2', autorId: 'u2', texto: '¡Hola, Daniela! Sí, está disponible a partir de enero. ¿Te gustaría agendar una visita?', fecha: '2026-09-28T18:20' },
      { id: 'm3', autorId: 'u1', texto: 'Sí, me encantaría. ¿Podría ser el sábado por la mañana?', fecha: '2026-09-28T18:31' },
      { id: 'm4', autorId: 'u2', texto: 'Claro, te espero el sábado a las 10:00. Un día antes te comparto la ubicación exacta.', fecha: '2026-09-28T19:02' },
    ],
  },
  {
    id: 'c2',
    estudianteId: 'u1',
    arrendador: { id: 'a2', nombre: 'Sara Gómez', avatar: '/img/avatares/sara.png' },
    propiedadId: 'p4',
    noLeidos: 0,
    mensajes: [
      { id: 'm5', autorId: 'u1', texto: 'Hola, ¿el loft incluye estacionamiento?', fecha: '2026-09-25T12:10' },
      { id: 'm6', autorId: 'a2', texto: 'Hola, no incluye, pero hay lugar en la calle sin problema. La renta sí incluye todos los servicios.', fecha: '2026-09-25T13:45' },
    ],
  },
]

// ---------- Publicaciones de la comunidad ----------
export const publicaciones = [
  {
    id: 'pub1',
    categoria: 'venta',
    autor: { id: 'e1', nombre: 'Alejandro Gutiérrez', carrera: 'Ingeniería Mecatrónica', avatar: '/img/avatares/alejandro.png' },
    texto: 'Gente, después de 5 años logré salir de aquí y mi maleta ya no cierra. Vendo mi Arduino Starter Kit (está casi completo), una TI-Nspire CX II CAS (la joya de la corona, me salvó en Termodinámica) y un monitor vertical ideal para programar sin scrollear tanto. Precios de remate porque vuelo el sábado. ¡Pregunten sin miedo!',
    imagenes: ['/img/comunidad/pub1-1.jpg', '/img/comunidad/pub1-2.jpg'],
    likes: 13,
    fecha: '2026-09-27T20:15',
    comentarios: [
      {
        id: 'k1',
        autor: { nombre: 'Galilea Corona', carrera: 'Ingeniería Biomédica', avatar: '/img/avatares/galilea.png' },
        texto: '¿La calculadora todavía tiene la licencia del software activa?',
        respuestas: [
          {
            id: 'k1r1',
            autor: { nombre: 'Alejandro Gutiérrez', carrera: 'Ingeniería Mecatrónica', avatar: '/img/avatares/alejandro.png' },
            texto: '@galicoro te paso el código de activación en el momento.',
          },
        ],
      },
      {
        id: 'k2',
        autor: { nombre: 'Gloria Díaz', carrera: 'Ingeniería en Computación', avatar: '/img/avatares/gloria.png' },
        texto: 'Si nadie quiere el kit de Arduino, yo paso por él mañana a la uni.',
        respuestas: [],
      },
      {
        id: 'k3',
        autor: { nombre: 'Sofía Mendoza', carrera: 'Ingeniería en Comunicaciones', avatar: '/img/avatares/sofia.png' },
        texto: 'Felicidades por graduarte. Yo apenas voy en tercer semestre y ya quiero vender todo también, jaja.',
        respuestas: [],
      },
    ],
  },
  {
    id: 'pub2',
    categoria: 'recomendacion',
    autor: { id: 'e2', nombre: 'Esteban Briseño', carrera: 'Licenciatura en Matemáticas', avatar: '/img/avatares/esteban.png' },
    texto: 'Para los que viven en los 2ndHOMEs del sector norte: mañana se pone el tianguis a tres cuadras. Es el mejor lugar para surtir fruta y verdura sin que les salga en un ojo de la cara como en el súper. Tip extra: la señora de los abarrotes del final les hace descuento si llevan su propia bolsa y son de la uni.',
    imagenes: [],
    likes: 9,
    fecha: '2026-09-28T09:40',
    comentarios: [],
  },
  {
    id: 'pub3',
    categoria: 'pregunta',
    autor: { id: 'e3', nombre: 'Samanta Torres', carrera: 'Licenciatura en Física', avatar: '/img/avatares/samanta.png' },
    texto: '¿A alguien más se le fue el agua en la colonia Santa Fe? En mi casa no sale ni una gota desde la mañana y tengo que bañarme para la presentación de mañana. Si alguien sabe si es corte general o solo mi edificio, avise para ver si pido asilo con un amigo.',
    imagenes: [],
    likes: 4,
    fecha: '2026-09-29T21:05',
    comentarios: [],
  },
]

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

// ---------- Funciones de ayuda 
export const propiedadesAprobadas = propiedades.filter((p) => p.estado === 'approved')

export const obtenerPropiedad = (id) => propiedades.find((p) => p.id === id)

export const resenasDePropiedad = (propiedadId) =>
  resenas.filter((r) => r.propiedadId === propiedadId)

// Minutos aproximados caminando (velocidad promedio de 5 km/h)
export const minutosAPie = (km) => Math.round((km / 5) * 60)

// Formatea 3700 como "$3,700"
export const formatoPrecio = (cantidad) =>
  cantidad.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })

export const direccionCompleta = (propiedad) =>
  `${propiedad.direccion}, Col. ${propiedad.colonia}, Guadalajara, Jal.`