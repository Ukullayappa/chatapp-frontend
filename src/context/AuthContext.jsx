import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'
import { disconnectSocket } from '../utils/socket'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('chatapp_token')
    const stored = localStorage.getItem('chatapp_user')
    if (token && stored) {
      setUser(JSON.parse(stored))
      api.get('/api/auth/me')
        .then(res => setUser(res.data.user))
        .catch(() => {
          localStorage.removeItem('chatapp_token')
          localStorage.removeItem('chatapp_user')
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  async function signUp(email, password, username) {
    try {
      await api.post('/api/auth/register', { email, password, username })
      return { error: null }
    } catch (err) {
      return { error: { message: err.response?.data?.error || 'Registration failed' } }
    }
  }

  async function signIn(email, password) {
    try {
      const res = await api.post('/api/auth/login', { email, password })
      const { token, user } = res.data
      localStorage.setItem('chatapp_token', token)
      localStorage.setItem('chatapp_user', JSON.stringify(user))
      setUser(user)
      return { error: null }
    } catch (err) {
      return { error: { message: err.response?.data?.error || 'Login failed' } }
    }
  }

  async function signOut() {
    try { await api.post('/api/auth/logout') } catch {}
    disconnectSocket()
    localStorage.removeItem('chatapp_token')
    localStorage.removeItem('chatapp_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile: user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
