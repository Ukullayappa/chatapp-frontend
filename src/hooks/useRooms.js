import { useState, useEffect } from 'react'
import api from '../utils/api'

export function useRooms(userId) {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) fetchRooms()
  }, [userId])

  async function fetchRooms() {
    try {
      const res = await api.get('/api/rooms')
      setRooms(res.data)
    } catch (err) {
      console.error('fetchRooms error:', err.message)
    } finally {
      setLoading(false)
    }
  }

  async function createRoom(name, description, isPrivate = false) {
    try {
      const res = await api.post('/api/rooms', { name, description, is_private: isPrivate })
      setRooms(prev => [...prev, res.data])
      return { data: res.data, error: null }
    } catch (err) {
      return { data: null, error: { message: err.response?.data?.error || 'Failed to create room' } }
    }
  }

  return { rooms, loading, createRoom, refetch: fetchRooms }
}
