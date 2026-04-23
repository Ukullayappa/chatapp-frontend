import { useState, useEffect } from 'react'
import api from '../utils/api'
import { getSocket } from '../utils/socket'

export function useOnlineUsers() {
  const [onlineUsers, setOnlineUsers] = useState([])

  useEffect(() => {
    // Initial fetch
    api.get('/api/users/online')
      .then(res => setOnlineUsers(res.data))
      .catch(err => console.error('fetchOnlineUsers error:', err.message))

    // Subscribe to real-time updates
    const token = localStorage.getItem('chatapp_token')
    const socket = getSocket(token)

    function onOnlineUsers(users) {
      setOnlineUsers(users)
    }

    socket.on('online_users', onOnlineUsers)

    return () => {
      socket.off('online_users', onOnlineUsers)
    }
  }, [])

  return { onlineUsers }
}
