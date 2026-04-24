import { useState } from 'react'
import { Modal, Form, Button } from 'react-bootstrap'
import { useRooms } from '../hooks/useRooms'
import { useOnlineUsers } from '../hooks/useOnlineUsers'

function avatarColor(name) {
  const colors = ['#4f46e5','#7c3aed','#0891b2','#059669','#d97706','#dc2626','#db2777']
  let h = 0
  for (let i = 0; i < (name?.length || 0); i++) h = (h * 31 + name.charCodeAt(i)) % colors.length
  return colors[h]
}

function Avatar({ name, size = 40, style = {} }) {
  const color = avatarColor(name)
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, ${color}cc, ${color})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700,
      fontSize: size * 0.38,
      flexShrink: 0,
      boxShadow: `0 2px 8px ${color}40`,
      ...style
    }}>
      {name?.[0]?.toUpperCase()}
    </div>
  )
}

export default function Sidebar({ profile, currentRoom, onSelectRoom, onSignOut, isMobile = false }) {
  const { rooms, createRoom } = useRooms(profile?.id)
  const { onlineUsers } = useOnlineUsers()
  const [showModal, setShowModal] = useState(false)
  const [newRoom, setNewRoom] = useState({ name: '', description: '' })
  const [creating, setCreating] = useState(false)
  const [roomError, setRoomError] = useState('')
  const [search, setSearch] = useState('')

  async function handleCreateRoom(e) {
    e.preventDefault()
    setCreating(true); setRoomError('')
    const { error } = await createRoom(newRoom.name, newRoom.description)
    if (error) { setRoomError(error.message); setCreating(false); return }
    setNewRoom({ name: '', description: '' })
    setShowModal(false)
    setCreating(false)
  }

  const filtered = rooms.filter(r => r.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{
      width: isMobile ? '100%' : 340,
      minWidth: isMobile ? 'unset' : 340,
      background: 'var(--sidebar-bg)',
      height: '100vh',
      display: 'flex', flexDirection: 'column',
      borderRight: isMobile ? 'none' : '1px solid var(--border)',
      boxShadow: isMobile ? 'none' : '2px 0 12px rgba(0,0,0,0.04)'
    }}>
      {/* Header */}
      <div style={{
        padding: isMobile ? '16px 16px 12px' : '16px 20px',
        borderBottom: '1px solid var(--border)',
        background: '#fff'
      }}>
        {/* Top row: avatar + name + actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar name={profile?.username} size={isMobile ? 36 : 38} />
            <div>
              <div style={{ fontWeight: 600, fontSize: isMobile ? 15 : 14, color: 'var(--text)', lineHeight: 1.2 }}>
                {profile?.username}
              </div>
              <div style={{ fontSize: 12, color: 'var(--online)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--online)' }} />
                Active now
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => setShowModal(true)}
              title="New room"
              style={{
                width: isMobile ? 38 : 34, height: isMobile ? 38 : 34,
                borderRadius: 10,
                background: 'var(--primary-light)', border: 'none',
                color: 'var(--primary)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s', flexShrink: 0
              }}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
            </button>

            <button
              onClick={onSignOut}
              title="Sign out"
              style={{
                width: isMobile ? 38 : 34, height: isMobile ? 38 : 34,
                borderRadius: 10,
                background: 'var(--hover)', border: 'none',
                color: 'var(--text-muted)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s', flexShrink: 0
              }}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--input-bg)', borderRadius: 10,
          padding: '9px 12px', border: '1.5px solid var(--border)',
          transition: 'border-color 0.2s'
        }}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="var(--text-subtle)" style={{ flexShrink: 0 }}>
            <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search rooms..."
            style={{
              background: 'none', border: 'none', outline: 'none',
              color: 'var(--text)', fontSize: isMobile ? 15 : 13, flex: 1
            }}
          />
        </div>
      </div>

      {/* Section label */}
      <div style={{ padding: '12px 20px 8px' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Rooms ({filtered.length})
        </span>
      </div>

      {/* Room list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 8px' }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>💬</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              {search ? 'No rooms found' : 'No rooms yet'}
            </p>
            {!search && (
              <button
                onClick={() => setShowModal(true)}
                style={{
                  marginTop: 12, background: 'var(--primary-light)', border: 'none',
                  color: 'var(--primary)', borderRadius: 8, padding: '10px 18px',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer'
                }}
              >
                Create your first room
              </button>
            )}
          </div>
        )}

        {filtered.map(room => {
          const isActive = currentRoom?.id === room.id
          return (
            <div
              key={room.id}
              onClick={() => onSelectRoom(room)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: isMobile ? '12px 14px' : '10px 12px',
                borderRadius: 12, cursor: 'pointer',
                background: isActive
                  ? 'linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%)'
                  : 'transparent',
                marginBottom: 2,
                transition: 'all 0.15s',
              }}
            >
              <Avatar
                name={room.name}
                size={isMobile ? 50 : 44}
                style={isActive ? { boxShadow: '0 2px 8px rgba(0,0,0,0.3)' } : {}}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: 600,
                  fontSize: isMobile ? 16 : 14,
                  color: isActive ? '#fff' : 'var(--text)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  marginBottom: 3
                }}>
                  {room.name}
                </div>
                <div style={{
                  fontSize: isMobile ? 13 : 12,
                  color: isActive ? 'rgba(255,255,255,0.72)' : 'var(--text-muted)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>
                  {room.description || 'Tap to open chat'}
                </div>
              </div>

              {/* Chevron on mobile */}
              {isMobile && (
                <svg viewBox="0 0 24 24" width="18" height="18"
                  fill={isActive ? 'rgba(255,255,255,0.6)' : 'var(--text-subtle)'}
                  style={{ flexShrink: 0 }}
                >
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                </svg>
              )}
            </div>
          )
        })}
      </div>

      {/* Create Room Modal */}
      <Modal show={showModal} onHide={() => { setShowModal(false); setRoomError('') }} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create New Room</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {roomError && (
            <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 16, background: '#fef2f2', padding: '10px 14px', borderRadius: 8 }}>
              {roomError}
            </div>
          )}
          <Form onSubmit={handleCreateRoom}>
            <Form.Group className="mb-3">
              <Form.Label>Room Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. design-team"
                value={newRoom.name}
                onChange={e => setNewRoom({ ...newRoom, name: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>
                Description{' '}
                <span style={{ color: 'var(--text-subtle)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                  (optional)
                </span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="What's this room about?"
                value={newRoom.description}
                onChange={e => setNewRoom({ ...newRoom, description: e.target.value })}
              />
            </Form.Group>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Button
                variant="light"
                onClick={() => { setShowModal(false); setRoomError('') }}
                style={{ borderRadius: 10, fontSize: 13, fontWeight: 600, padding: '9px 18px' }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={creating}
                style={{
                  background: 'var(--primary)', border: 'none', borderRadius: 10,
                  fontSize: 13, fontWeight: 600, padding: '9px 18px',
                  boxShadow: '0 4px 12px rgba(79,70,229,0.3)'
                }}
              >
                {creating ? 'Creating...' : 'Create Room'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  )
}
