import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import AuthPage from './pages/AuthPage'
import ChatPage from './pages/ChatPage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16
    }}>
      <div style={{
        width: 40, height: 40, border: '3px solid var(--border)',
        borderTopColor: 'var(--primary)', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <p style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 500 }}>Loading...</p>
    </div>
  )
  return user ? children : <Navigate to="/auth" />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}
