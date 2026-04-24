import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import Sidebar from '../components/Sidebar'
import ChatWindow from '../components/ChatWindow'

export default function ChatPage() {
  const { profile, signOut } = useAuth()
  const [currentRoom, setCurrentRoom] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  // On mobile: 'sidebar' | 'chat'
  const [mobileView, setMobileView] = useState('sidebar')

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  function handleSelectRoom(room) {
    setCurrentRoom(room)
    if (isMobile) setMobileView('chat')
  }

  function handleBack() {
    setMobileView('sidebar')
  }

  if (isMobile) {
    return (
      <div style={{ height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
        {mobileView === 'sidebar' ? (
          <Sidebar
            profile={profile}
            currentRoom={currentRoom}
            onSelectRoom={handleSelectRoom}
            onSignOut={signOut}
            isMobile={true}
          />
        ) : (
          <ChatWindow
            room={currentRoom}
            profile={profile}
            onBack={handleBack}
            isMobile={true}
          />
        )}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      <Sidebar
        profile={profile}
        currentRoom={currentRoom}
        onSelectRoom={handleSelectRoom}
        onSignOut={signOut}
      />
      <ChatWindow room={currentRoom} profile={profile} />
    </div>
  )
}
