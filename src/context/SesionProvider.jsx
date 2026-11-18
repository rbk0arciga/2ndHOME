import { useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  verifyBeforeUpdateEmail,
} from 'firebase/auth'
import { doc, onSnapshot, setDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore'
import { auth, db } from '../firebase/config'
import { SesionContext } from './sesion'
import { VERSION_AVISO } from '../utils/avisoPrivacidad'
import { guardarDocumento } from '../utils/documentos'
import { esCorreoInstitucional } from '../utils/aspirantes'

// Mes actual como "2026-10" (mismo formato que usan los perfiles)
function anioMesActual() {
  const hoy = new Date()
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`
}

// Errores de Firebase que indican que la sesión ya no es válida (por ejemplo, después de cambiar el correo)
const ERRORES_SESION_VENCIDA = ['auth/user-token-expired', 'auth/user-not-found', 'auth/invalid-user-token']

export default function SesionProvider({ children }) {
  const [usuarioAuth, setUsuarioAuth] = useState(null) // Cuenta de Firebase Authentication
  const [perfil, setPerfil] = useState(null) // Documento usuarios/{uid} de Firestore
  const [correoVerificado, setCorreoVerificado] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [avisoSesion, setAvisoSesion] = useState('') // Mensaje que se muestra en el login

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
    const refPerfil = doc(db, 'usuarios', usuarioAuth.uid)

    return onSnapshot(
      refPerfil,
      (instantanea) => {
        // Justo después de registrarse, el perfil tarda unos milisegundos en existir
        if (!instantanea.exists()) return

        const datos = instantanea.data()
        if (datos.estado === 'suspendida') {
          setAvisoSesion('Tu cuenta está suspendida. Si crees que es un error, contacta al equipo de 2nd HOME.')
          signOut(auth)
          return
        }

        // Aspirante que ya entró con su correo institucional verificado: deja de ser aspirante.
        // Se sigue mostrando "Cargando…" hasta que llegue el perfil actualizado.
        if (
          datos.aspirante &&
          usuarioAuth.emailVerified &&
          esCorreoInstitucional(usuarioAuth.email) &&
          datos.correo !== usuarioAuth.email
        ) {
          updateDoc(refPerfil, { correo: usuarioAuth.email, aspirante: false }).catch((error) => {
            console.error('No se pudo actualizar el perfil del aspirante:', error.code)
            setPerfil({ id: usuarioAuth.uid, ...datos })
            setCargando(false)
          })
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

  // Crea la cuenta y guarda el perfil. Los 2nd GUESTS (incluidos los aspirantes) reciben el correo
  // de verificación. Si algo falla, lanza el error de Firebase para que el formulario muestre el mensaje.
  const registrarse = async ({
    rol,
    nombre,
    correo,
    contrasena,
    carrera,
    telefono,
    aspirante = false,
    vigenteHasta = null, // Fecha (Date) en que vence la cuenta de aspirante
    ficha = null, // Ficha de admisión ya preparada (solo aspirantes)
  }) => {
    const credencial = await createUserWithEmailAndPassword(auth, correo.trim(), contrasena)
    const uid = credencial.user.uid
    await updateProfile(credencial.user, { displayName: nombre.trim() })

    const desde = anioMesActual()
    let datosPorRol
    if (rol === 'estudiante') {
      datosPorRol = { carrera: carrera.trim(), favoritos: [], historial: [], aspirante }
      if (aspirante) {
        datosPorRol.vigenteHasta = Timestamp.fromDate(vigenteHasta)
        datosPorRol.fichaEstado = 'sin_enviar' // Pasa a "en_revision" en cuanto se sube la ficha
      }
    } else {
      datosPorRol = { telefono: telefono.replace(/\D/g, ''), anfitrionDesde: desde }
    }

    await setDoc(doc(db, 'usuarios', uid), {
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

    // La ficha se sube después de crear el perfil. Si falla, la cuenta ya existe
    // y el aspirante puede volver a subirla desde la pantalla de revisión.
    if (aspirante && ficha) {
      try {
        await guardarDocumento(uid, 'fichaAdmision', ficha)
        await updateDoc(doc(db, 'usuarios', uid), { fichaEstado: 'en_revision' })
      } catch (error) {
        console.error('No se pudo subir la ficha de admisión:', error.code)
      }
    }
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

  // aviso: mensaje opcional que se muestra en el login después de cerrar sesión
  const cerrarSesion = (aviso = '') => {
    setAvisoSesion(typeof aviso === 'string' ? aviso : '')
    return signOut(auth)
  }

  const reenviarVerificacion = () => sendEmailVerification(auth.currentUser)

  // Después de abrir el enlace del correo: vuelve a consultar si ya está verificado
  const recargarVerificacion = async () => {
    await auth.currentUser.reload()
    await auth.currentUser.getIdToken(true) // Actualiza el permiso que leen las reglas de Firestore
    setCorreoVerificado(auth.currentUser.emailVerified)
    return auth.currentUser.emailVerified
  }

  const recuperarContrasena = (correo) => sendPasswordResetEmail(auth, correo.trim())

  // Aspirantes: envía el enlace para verificar y cambiar al correo institucional.
  // El correo de la cuenta cambia hasta que se abre ese enlace.
  const solicitarCambioCorreo = (nuevoCorreo) => verifyBeforeUpdateEmail(auth.currentUser, nuevoCorreo.trim())

  // Revisa si el aspirante ya abrió el enlace. Devuelve 'reiniciar' (debe volver a iniciar sesión
  // con su correo institucional) o 'pendiente' (todavía no abre el enlace).
  const comprobarCambioCorreo = async () => {
    try {
      await auth.currentUser.reload()
    } catch (error) {
      // Firebase cierra la sesión al cambiar el correo
      if (ERRORES_SESION_VENCIDA.includes(error.code)) {
        await cerrarSesion('Tu correo cambió. Inicia sesión con tu correo institucional y tu misma contraseña.')
        return 'reiniciar'
      }
      throw error
    }

    if (esCorreoInstitucional(auth.currentUser.email) && auth.currentUser.emailVerified) {
      await cerrarSesion('Tu correo institucional quedó verificado. Inicia sesión con él y tu misma contraseña.')
      return 'reiniciar'
    }
    return 'pendiente'
  }

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
        solicitarCambioCorreo,
        comprobarCambioCorreo,
      }}
    >
      {children}
    </SesionContext.Provider>
  )
}