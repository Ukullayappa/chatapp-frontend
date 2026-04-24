import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import Sidebar from '../components/Sidebar'
import ChatWindow from '../components/ChatWindow'

export default function ChatPage() {
  const { profile, signOut } = useAuth()
  const [currentRoom, setCurrentRoom] = useState(null)

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      <Sidebar
        profile={profile}
        currentRoom={currentRoom}
        onSelectRoom={setCurrentRoom}
        onSignOut={signOut}
      />
      <ChatWindow room={currentRoom} profile={profile} />
    </div>
  )
}
