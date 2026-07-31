import { io } from 'socket.io-client'

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')

let socket = null

export const getSocket = () => {
  const token = localStorage.getItem('token')
  if (!token) return null

  if (!socket) {
    socket = io(SOCKET_URL, { auth: { token }, autoConnect: false })
  } else {
    socket.auth = { token }
  }

  if (!socket.connected) socket.connect()
  return socket
}

export const disconnectSocket = () => {
  socket?.disconnect()
}
