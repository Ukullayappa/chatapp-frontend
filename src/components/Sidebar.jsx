import { useState } from 'react'
import { Modal, Form, Button } from 'react-bootstrap'
import { useRooms } from '../hooks/useRooms'
import { useOnlineUsers } from '../hooks/useOnlineUsers'

export default function Sidebar({ profile, currentRoom, onSelectRoom, onSignOut }) {
  const { rooms, createRoom } = useRooms(profile?.id)
  const { onlineUsers } = useOnlineUsers()
  const [showModal, setShowModal] = useState(false)
  const [newRoom, setNewRoom] = useState({ name: '', description: '' })
  const [creating, setCreating] = useState(false)
  const [roomError, setRoomError] = useState('')
  const [search, setSearch] = useState('')

  async function handleCreateRoom(e) {
    e.preventDefault()
    setCreating(true)
    setRoomError('')
    const { error } = await createRoom(newRoom.name, newRoom.description)
    if (error) { setRoomError(error.message); setCreating(false); return }
    setNewRoom({ name: '', description: '' })
    setShowModal(false)
    setCreating(false)
  }

  const filtered = rooms.filter(r => r.name.toLowerCase().includes(search.toLowerCase()))

  function avatarColor(name) {
    const colors = ['#00a884','#25d366','#128c7e','#075e54','#34b7f1','#ef9c0d','#f15c6d']
    let h = 0
    for (let i = 0; i < (name?.length || 0); i++) h = (h * 31 + name.charCodeAt(i)) % colors.length
    return colors[h]
  }

  return (
    <div style={{
      width: '380px', minWidth: '380px',
      background: 'var(--wa-sidebar-bg)',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid var(--wa-border)'
    }}>
      {/* Header */}
      <div style={{
        background: 'var(--wa-header-bg)',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '59px',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: avatarColor(profile?.username),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: '16px', cursor: 'pointer', flexShrink: 0
          }}>
            {profile?.username?.[0]?.toUpperCase()}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setShowModal(true)}
            title="New group"
            style={{
              background: 'none', border: 'none', color: 'var(--wa-text-muted)',
              cursor: 'pointer', padding: '8px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onMouseOver={e => e.currentTarget.style.background = 'var(--wa-hover)'}
            onMouseOut={e => e.currentTarget.style.background = 'none'}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M19.005 3.175H4.674C3.642 3.175 3 3.789 3 4.821V21.02l3.544-3.514h12.461c1.033 0 2.064-1.06 2.064-2.093V4.821c-.001-1.032-1.032-1.646-2.064-1.646zm-4.989 9.869H13v2.016h-2v-2.016H9v-2h2V9.044h2v2h2.016v2z"/>
            </svg>
          </button>

          <button
            onClick={onSignOut}
            title="Sign out"
            style={{
              background: 'none', border: 'none', color: 'var(--wa-text-muted)',
              cursor: 'pointer', padding: '8px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onMouseOver={e => e.currentTarget.style.background = 'var(--wa-hover)'}
            onMouseOut={e => e.currentTarget.style.background = 'none'}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: '8px 12px', background: 'var(--wa-sidebar-bg)', flexShrink: 0 }}>
        <div style={{
          background: 'var(--wa-panel-bg)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '7px 12px'
        }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="var(--wa-text-muted)">
            <path d="M15.009 13.805h-.636l-.22-.219a5.184 5.184 0 0 0 1.256-3.386 5.207 5.207 0 1 0-5.207 5.208 5.183 5.183 0 0 0 3.385-1.255l.221.22v.635l4.004 3.999 1.194-1.195-3.997-4.007zm-4.808 0a3.605 3.605 0 1 1 0-7.21 3.605 3.605 0 0 1 0 7.21z"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search or start new chat"
            style={{
              background: 'none', border: 'none', outline: 'none',
              color: 'var(--wa-text)', fontSize: '14px', flex: 1
            }}
          />
        </div>
      </div>

      {/* Chat list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.map(room => {
          const isActive = currentRoom?.id === room.id
          const color = avatarColor(room.name)
          return (
            <div
              key={room.id}
              onClick={() => onSelectRoom(room)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '13px',
                padding: '10px 16px',
                cursor: 'pointer',
                background: isActive ? 'var(--wa-hover)' : 'transparent',
                borderBottom: '1px solid var(--wa-border)',
                transition: 'background 0.1s'
              }}
              onMouseOver={e => { if (!isActive) e.currentTarget.style.background = 'var(--wa-hover)' }}
              onMouseOut={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
            >
              <div style={{
                width: 49, height: 49, borderRadius: '50%',
                background: color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: '18px', flexShrink: 0
              }}>
                {room.name[0]?.toUpperCase()}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <span style={{ color: 'var(--wa-text)', fontWeight: 500, fontSize: '17px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {room.name}
                  </span>
                </div>
                <span style={{ color: 'var(--wa-text-muted)', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                  {room.description || 'Tap to open chat'}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Create Group Modal */}
      <Modal show={showModal} onHide={() => { setShowModal(false); setRoomError('') }} centered>
        <Modal.Header closeButton style={{ background: 'var(--wa-panel-bg)', borderColor: 'var(--wa-border)' }}>
          <Modal.Title style={{ color: 'var(--wa-text)', fontSize: '16px' }}>New Group Chat</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'var(--wa-panel-bg)' }}>
          {roomError && <div style={{ color: '#f87171', fontSize: '13px', marginBottom: '12px' }}>{roomError}</div>}
          <Form onSubmit={handleCreateRoom}>
            <Form.Group className="mb-3">
              <Form.Label style={{ color: 'var(--wa-text-muted)', fontSize: '13px' }}>Group Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. project-ideas"
                value={newRoom.name}
                onChange={e => setNewRoom({ ...newRoom, name: e.target.value })}
                style={{ background: 'var(--wa-input-bg)', border: '1px solid var(--wa-border)', color: 'var(--wa-text)' }}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ color: 'var(--wa-text-muted)', fontSize: '13px' }}>Description (optional)</Form.Label>
              <Form.Control
                type="text"
                placeholder="What's this group about?"
                value={newRoom.description}
                onChange={e => setNewRoom({ ...newRoom, description: e.target.value })}
                style={{ background: 'var(--wa-input-bg)', border: '1px solid var(--wa-border)', color: 'var(--wa-text)' }}
              />
            </Form.Group>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => { setShowModal(false); setRoomError('') }}>Cancel</Button>
              <Button type="submit" disabled={creating} style={{ background: 'var(--wa-green)', border: 'none' }}>
                {creating ? 'Creating...' : 'Create Group'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  )
}
