import { useEffect, useState } from 'react'
import { escucharConversaciones } from '../firebase/chat'

export function useNoLeidos(uid) {
  const [conversaciones, setConversaciones] = useState([])
  useEffect(() => {
    if (!uid) return
    return escucharConversaciones(uid, setConversaciones)
  }, [uid])
  return uid ? conversaciones.reduce((total, c) => total + (c.noLeidos?.[uid] ?? 0), 0) : 0
}