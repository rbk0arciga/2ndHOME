import { useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase/config'
import { SesionContext } from './sesion'
import { VERSION_AVISO } from '../utils/avisoPrivacidad'

// Mes actual como "2026-10" (mismo formato que usan los perfiles)
function anioMesActual() {
  const hoy = new Date()
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`
}

export default function SesionProvider({ children }) {
  const [usuarioAuth, setUsuarioAuth] = useState(null) // Cuenta de Firebase Authentication
  const [perfil, setPerfil] = useState(null) // Documento usuarios/{uid} de Firestore
  const [correoVerificado, setCorreoVerificado] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [avisoSesion, setAvisoSesion] = useState('') // Ej. aviso de cuenta suspendida

  // 1. Escucha cuando alguien inicia o cierra sesión (también al recargar la página)
  useEffect(() => {
    return onAuthStateChanged(auth, (usuarioFirebase) => {
      setUsuarioAuth(usuarioFirebase)
      setCorreoVerificado(usuarioFirebase?.emailVerified ?? false)
      setPerfil(null)
      // Con sesión, sigue "cargando" hasta leer el perfil en el paso 2
      setCargando(Boolean(usuarioFirebase))
    })
  }, [])

  // 2. Con sesión, escucha en tiempo real su perfil en Firestore
  useEffect(() => {
    if (!usuarioAuth) return

    return onSnapshot(
      doc(db, 'usuarios', usuarioAuth.uid),
      (instantanea) => {
        // Justo después de registrarse, el perfil tarda unos milisegundos en existir
        if (!instantanea.exists()) return

        const datos = instantanea.data()
        if (datos.estado === 'suspendida') {
          setAvisoSesion('Tu cuenta está suspendida. Si crees que es un error, contacta al equipo de 2nd HOME.')
          signOut(auth)
          return
        }

        setPerfil({ id: usuarioAuth.uid, ...datos })
        setCargando(false)
      },
      (error) => {
        console.error('No se pudo leer el perfil:', error.code)
        setCargando(false)
      }
    )
  }, [usuarioAuth])

  // El resto de la app recibe un solo objeto con el perfil y el estado de verificación
  const usuario = usuarioAuth && perfil ? { ...perfil, correoVerificado } : null

  // Crea la cuenta, guarda el perfil y, si es 2nd GUEST, envía el correo de verificación.
  // Si algo falla, lanza el error de Firebase para que el formulario muestre el mensaje.
  const registrarse = async ({ rol, nombre, correo, contrasena, carrera, telefono }) => {
    const credencial = await createUserWithEmailAndPassword(auth, correo.trim(), contrasena)
    await updateProfile(credencial.user, { displayName: nombre.trim() })

    const desde = anioMesActual()
    const datosPorRol =
      rol === 'estudiante'
        ? { carrera: carrera.trim(), favoritos: [], historial: [] }
        : { telefono: telefono.replace(/\D/g, ''), anfitrionDesde: desde }

    await setDoc(doc(db, 'usuarios', credencial.user.uid), {
      nombre: nombre.trim(),
      correo: credencial.user.email,
      rol,
      estado: 'activa',
      miembroDesde: desde,
      creadoEn: serverTimestamp(),
            // Qué versión del aviso de privacidad aceptó y cuándo
      avisoAceptado: { version: VERSION_AVISO, aceptadoEn: serverTimestamp() },
      ...datosPorRol,
    })

    if (rol === 'estudiante') await sendEmailVerification(credencial.user)
  }

  // Devuelve {} si todo salió bien, o { error: código de Firebase }
  const iniciarSesion = async (correo, contrasena) => {
    setAvisoSesion('')
    try {
      await signInWithEmailAndPassword(auth, correo.trim(), contrasena)
      return {}
    } catch (error) {
      return { error: error.code }
    }
  }

  const cerrarSesion = () => signOut(auth)

  const reenviarVerificacion = () => sendEmailVerification(auth.currentUser)

  // Después de abrir el enlace del correo: vuelve a consultar si ya está verificado
  const recargarVerificacion = async () => {
    await auth.currentUser.reload()
    await auth.currentUser.getIdToken(true) // Actualiza el permiso que leen las reglas de Firestore
    setCorreoVerificado(auth.currentUser.emailVerified)
    return auth.currentUser.emailVerified
  }

  const recuperarContrasena = (correo) => sendPasswordResetEmail(auth, correo.trim())

  return (
    <SesionContext.Provider
      value={{
        usuario,
        cargando,
        avisoSesion,
        registrarse,
        iniciarSesion,
        cerrarSesion,
        reenviarVerificacion,
        recargarVerificacion,
        recuperarContrasena,
      }}
    >
      {children}
    </SesionContext.Provider>
  )
}