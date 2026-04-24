import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Form, Alert } from 'react-bootstrap'

export default function AuthPage() {
  const { signIn, signUp, user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [tab, setTab] = useState('login')

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [signupForm, setSignupForm] = useState({ email: '', password: '', username: '' })

  if (user) { navigate('/'); return null }

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await signIn(loginForm.email, loginForm.password)
    if (error) setError(error.message)
    else navigate('/')
    setLoading(false)
  }

  async function handleSignup(e) {
    e.preventDefault()
    setLoading(true); setError(''); setSuccess('')
    if (signupForm.username.length < 3) {
      setError('Username must be at least 3 characters')
      setLoading(false); return
    }
    const { error } = await signUp(signupForm.email, signupForm.password, signupForm.username)
    if (error) setError(error.message)
    else {
      setSuccess('Account created! Please sign in.')
      setSignupForm({ email: '', password: '', username: '' })
      setTab('login')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px'
    }}>
      {/* Decorative circles */}
      <div style={{
        position: 'fixed', top: -80, right: -80, width: 300, height: 300,
        borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'fixed', bottom: -60, left: -60, width: 240, height: 240,
        borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none'
      }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', animation: 'fadeIn 0.4s ease' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          }}>
            <svg viewBox="0 0 24 24" width="32" height="32" fill="white">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
            </svg>
          </div>
          <h1 style={{ color: '#fff', fontWeight: 700, fontSize: 26, margin: 0, letterSpacing: '-0.02em' }}>
            ChatApp
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 6 }}>
            Real-time messaging for teams
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#fff',
          borderRadius: 20,
          padding: '32px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
        }}>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            background: 'var(--bg)',
            borderRadius: 10,
            padding: 4,
            marginBottom: 28,
            gap: 4
          }}>
            {[
              { key: 'login', label: 'Sign In' },
              { key: 'signup', label: 'Create Account' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => { setTab(key); setError(''); setSuccess('') }}
                style={{
                  flex: 1, border: 'none', padding: '9px 0', borderRadius: 8,
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: tab === key ? '#fff' : 'transparent',
                  color: tab === key ? 'var(--primary)' : 'var(--text-muted)',
                  boxShadow: tab === key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {error && (
            <Alert variant="danger" style={{ fontSize: 13, borderRadius: 10, padding: '10px 14px', marginBottom: 20, border: 'none', background: '#fef2f2', color: '#b91c1c' }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert variant="success" style={{ fontSize: 13, borderRadius: 10, padding: '10px 14px', marginBottom: 20, border: 'none', background: '#f0fdf4', color: '#15803d' }}>
              {success}
            </Alert>
          )}

          {tab === 'login' ? (
            <Form onSubmit={handleLogin}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="you@example.com"
                  value={loginForm.email}
                  onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter your password"
                  value={loginForm.password}
                  onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                />
              </Form.Group>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', background: 'var(--primary)', border: 'none',
                  color: '#fff', borderRadius: 10, padding: '12px',
                  fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.75 : 1, transition: 'all 0.2s',
                  letterSpacing: '0.02em',
                  boxShadow: '0 4px 12px rgba(79,70,229,0.3)'
                }}
                onMouseOver={e => { if (!loading) e.currentTarget.style.background = 'var(--primary-dark)' }}
                onMouseOut={e => e.currentTarget.style.background = 'var(--primary)'}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </Form>
          ) : (
            <Form onSubmit={handleSignup}>
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="cooluser123"
                  value={signupForm.username}
                  onChange={e => setSignupForm({ ...signupForm, username: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="you@example.com"
                  value={signupForm.email}
                  onChange={e => setSignupForm({ ...signupForm, email: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Min. 6 characters"
                  value={signupForm.password}
                  onChange={e => setSignupForm({ ...signupForm, password: e.target.value })}
                  minLength={6}
                  required
                />
              </Form.Group>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', background: 'var(--primary)', border: 'none',
                  color: '#fff', borderRadius: 10, padding: '12px',
                  fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.75 : 1, transition: 'all 0.2s',
                  letterSpacing: '0.02em',
                  boxShadow: '0 4px 12px rgba(79,70,229,0.3)'
                }}
                onMouseOver={e => { if (!loading) e.currentTarget.style.background = 'var(--primary-dark)' }}
                onMouseOut={e => e.currentTarget.style.background = 'var(--primary)'}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </Form>
          )}
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 20 }}>
          Secure • Real-time • Open source
        </p>
      </div>
    </div>
  )
}
