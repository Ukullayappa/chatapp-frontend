import { useState, useEffect, useRef } from 'react'
import api from '../utils/api'
import { getSocket } from '../utils/socket'

export function useMessages(roomId) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!roomId) return
    setMessages([])
    setLoading(true)

    // Load history
    api.get(`/api/messages/${roomId}`)
      .then(res => setMessages(res.data))
      .catch(err => console.error('fetchMessages error:', err.message))
      .finally(() => setLoading(false))

    // Subscribe to real-time messages
    const token = localStorage.getItem('chatapp_token')
    const socket = getSocket(token)

    socket.emit('join_room', roomId)

    function onNewMessage(msg) {
      setMessages(prev => {
        // Avoid duplicates
        if (prev.find(m => m.id === msg.id)) return prev
        return [...prev, msg]
      })
    }

    socket.on('new_message', onNewMessage)

    return () => {
      socket.off('new_message', onNewMessage)
      socket.emit('leave_room', roomId)
    }
  }, [roomId])

  function sendMessage(content, senderId, fileUrl = null, fileName = null) {
    const token = localStorage.getItem('chatapp_token')
    const socket = getSocket(token)
    socket.emit('send_message', {
      room_id: roomId,
      content,
      file_url: fileUrl,
      file_name: fileName
    })
    return { error: null }
  }

  return { messages, loading, sendMessage }
}
