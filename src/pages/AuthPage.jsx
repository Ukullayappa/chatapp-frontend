import { useState } from 'react'
import { Container, Row, Col, Card, Form, Button, Alert, Tab, Tabs } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function AuthPage() {
  const { signIn, signUp, user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [signupForm, setSignupForm] = useState({ email: '', password: '', username: '' })

  // Redirect if already logged in
  if (user) {
    navigate('/')
    return null
  }

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await signIn(loginForm.email, loginForm.password)
    if (error) setError(error.message)
    else navigate('/')
    setLoading(false)
  }

  async function handleSignup(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    if (signupForm.username.length < 3) {
      setError('Username must be at least 3 characters')
      setLoading(false)
      return
    }
    const { error } = await signUp(signupForm.email, signupForm.password, signupForm.username)
    if (error) setError(error.message)
    else {
      setSuccess('Account created! Please sign in.')
      setSignupForm({ email: '', password: '', username: '' })
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', display: 'flex', alignItems: 'center' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={5}>
            <div className="text-center mb-4">
              <div style={{ fontSize: '3rem' }}>💬</div>
              <h1 style={{ color: '#fff', fontWeight: 700, fontSize: '2rem' }}>ChatApp</h1>
              <p style={{ color: 'rgba(255,255,255,0.6)' }}>Real-time conversations</p>
            </div>

            <Card style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '16px' }}>
              <Card.Body className="p-4">
                {error && <Alert variant="danger" className="py-2">{error}</Alert>}
                {success && <Alert variant="success" className="py-2">{success}</Alert>}

                <Tabs defaultActiveKey="login" className="mb-4" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                  <Tab eventKey="login" title="Sign In">
                    <Form onSubmit={handleLogin}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: 'rgba(255,255,255,0.8)' }}>Email</Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="you@example.com"
                          value={loginForm.email}
                          onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                          required
                        />
                      </Form.Group>
                      <Form.Group className="mb-4">
                        <Form.Label style={{ color: 'rgba(255,255,255,0.8)' }}>Password</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="••••••••"
                          value={loginForm.password}
                          onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                          required
                        />
                      </Form.Group>
                      <Button type="submit" className="w-100" disabled={loading}
                        style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', borderRadius: '8px', padding: '10px' }}>
                        {loading ? 'Signing in...' : 'Sign In'}
                      </Button>
                    </Form>
                  </Tab>

                  <Tab eventKey="signup" title="Create Account">
                    <Form onSubmit={handleSignup}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: 'rgba(255,255,255,0.8)' }}>Username</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="cooluser123"
                          value={signupForm.username}
                          onChange={e => setSignupForm({ ...signupForm, username: e.target.value })}
                          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                          required
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: 'rgba(255,255,255,0.8)' }}>Email</Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="you@example.com"
                          value={signupForm.email}
                          onChange={e => setSignupForm({ ...signupForm, email: e.target.value })}
                          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                          required
                        />
                      </Form.Group>
                      <Form.Group className="mb-4">
                        <Form.Label style={{ color: 'rgba(255,255,255,0.8)' }}>Password</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Min. 6 characters"
                          value={signupForm.password}
                          onChange={e => setSignupForm({ ...signupForm, password: e.target.value })}
                          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                          minLength={6}
                          required
                        />
                      </Form.Group>
                      <Button type="submit" className="w-100" disabled={loading}
                        style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', borderRadius: '8px', padding: '10px' }}>
                        {loading ? 'Creating account...' : 'Create Account'}
                      </Button>
                    </Form>
                  </Tab>
                </Tabs>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}
