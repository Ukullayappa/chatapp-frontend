import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

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
    if (signupForm.username.length < 3) { setError('Username must be at least 3 characters'); setLoading(false); return }
    const { error } = await signUp(signupForm.email, signupForm.password, signupForm.username)
    if (error) setError(error.message)
    else { setSuccess('Account created! Please sign in.'); setSignupForm({ email: '', password: '', username: '' }); setTab('login') }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', background: 'var(--wa-input-bg)', border: 'none',
    borderBottom: '2px solid var(--wa-border)', outline: 'none',
    color: 'var(--wa-text)', fontSize: '15px', padding: '10px 4px',
    marginBottom: '20px', borderRadius: 0, transition: 'border-color 0.2s'
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--wa-bg)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px'
    }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, background: 'var(--wa-green)', height: '220px', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <svg viewBox="0 0 24 24" width="42" height="42" fill="var(--wa-green)">
              <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.195 2.105 3.195 5.1 4.485.714.3 1.27.48 1.704.629.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345z"/>
              <path d="M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652c1.746.943 3.71 1.444 5.71 1.447h.006c6.585 0 11.946-5.336 11.949-11.896 0-3.176-1.24-6.165-3.48-8.45zm-8.475 18.301h-.005c-1.775 0-3.514-.477-5.031-1.378l-.361-.214-3.741.975.994-3.62-.235-.374c-.99-1.574-1.512-3.393-1.512-5.26.003-5.45 4.46-9.884 9.928-9.884 2.652 0 5.139 1.025 7.01 2.887 1.87 1.859 2.909 4.33 2.907 6.96-.003 5.452-4.46 9.886-9.954 9.886z"/>
            </svg>
          </div>
          <h1 style={{ color: '#fff', fontWeight: 600, fontSize: '26px', margin: 0 }}>ChatApp</h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', marginTop: '4px' }}>Real-time messaging</p>
        </div>

        <div style={{ background: 'var(--wa-panel-bg)', borderRadius: '12px', padding: '28px 28px 32px', boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--wa-border)', marginBottom: '28px' }}>
            {['login', 'signup'].map(t => (
              <button key={t} onClick={() => { setTab(t); setError(''); setSuccess('') }} style={{
                flex: 1, background: 'none', border: 'none',
                borderBottom: `2px solid ${tab === t ? 'var(--wa-green)' : 'transparent'}`,
                color: tab === t ? 'var(--wa-green)' : 'var(--wa-text-muted)',
                padding: '8px 0 12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s', marginBottom: '-1px', textTransform: 'uppercase', letterSpacing: '0.05em'
              }}>
                {t === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {error && (
            <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px' }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ background: 'rgba(0,168,132,0.1)', border: '1px solid rgba(0,168,132,0.3)', color: 'var(--wa-green)', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px' }}>
              {success}
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLogin}>
              <label style={{ color: 'var(--wa-green)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em' }}>EMAIL</label>
              <input type="email" placeholder="you@example.com" value={loginForm.email}
                onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                style={inputStyle} required
                onFocus={e => e.target.style.borderBottomColor = 'var(--wa-green)'}
                onBlur={e => e.target.style.borderBottomColor = 'var(--wa-border)'}
              />
              <label style={{ color: 'var(--wa-green)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em' }}>PASSWORD</label>
              <input type="password" placeholder="••••••••" value={loginForm.password}
                onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                style={inputStyle} required
                onFocus={e => e.target.style.borderBottomColor = 'var(--wa-green)'}
                onBlur={e => e.target.style.borderBottomColor = 'var(--wa-border)'}
              />
              <button type="submit" disabled={loading} style={{
                width: '100%', background: 'var(--wa-green)', border: 'none', color: '#fff',
                borderRadius: '24px', padding: '13px', fontSize: '15px', fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                marginTop: '8px', letterSpacing: '0.03em'
              }}>
                {loading ? 'Signing in...' : 'SIGN IN'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup}>
              <label style={{ color: 'var(--wa-green)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em' }}>USERNAME</label>
              <input type="text" placeholder="cooluser123" value={signupForm.username}
                onChange={e => setSignupForm({ ...signupForm, username: e.target.value })}
                style={inputStyle} required
                onFocus={e => e.target.style.borderBottomColor = 'var(--wa-green)'}
                onBlur={e => e.target.style.borderBottomColor = 'var(--wa-border)'}
              />
              <label style={{ color: 'var(--wa-green)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em' }}>EMAIL</label>
              <input type="email" placeholder="you@example.com" value={signupForm.email}
                onChange={e => setSignupForm({ ...signupForm, email: e.target.value })}
                style={inputStyle} required
                onFocus={e => e.target.style.borderBottomColor = 'var(--wa-green)'}
                onBlur={e => e.target.style.borderBottomColor = 'var(--wa-border)'}
              />
              <label style={{ color: 'var(--wa-green)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em' }}>PASSWORD</label>
              <input type="password" placeholder="Min. 6 characters" value={signupForm.password}
                onChange={e => setSignupForm({ ...signupForm, password: e.target.value })}
                style={inputStyle} minLength={6} required
                onFocus={e => e.target.style.borderBottomColor = 'var(--wa-green)'}
                onBlur={e => e.target.style.borderBottomColor = 'var(--wa-border)'}
              />
              <button type="submit" disabled={loading} style={{
                width: '100%', background: 'var(--wa-green)', border: 'none', color: '#fff',
                borderRadius: '24px', padding: '13px', fontSize: '15px', fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                marginTop: '8px', letterSpacing: '0.03em'
              }}>
                {loading ? 'Creating account...' : 'CREATE ACCOUNT'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
