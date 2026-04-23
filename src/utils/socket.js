import { io } from 'socket.io-client'

let socket = null

export function getSocket(token) {
  if (!socket) {
    const serverUrl = import.meta.env.VITE_API_URL || ''
    socket = io(serverUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
    })
  }
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
