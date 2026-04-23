import { useState } from 'react'
import { Button, Modal, Form } from 'react-bootstrap'
import { useRooms } from '../hooks/useRooms'
import { useOnlineUsers } from '../hooks/useOnlineUsers'

export default function Sidebar({ profile, currentRoom, onSelectRoom, onSignOut }) {
  const { rooms, createRoom } = useRooms(profile?.id)
  const { onlineUsers } = useOnlineUsers()
  const [showModal, setShowModal] = useState(false)
  const [newRoom, setNewRoom] = useState({ name: '', description: '' })
  const [creating, setCreating] = useState(false)
  const [roomError, setRoomError] = useState('')

  async function handleCreateRoom(e) {
    e.preventDefault()
    setCreating(true)
    setRoomError('')
    const { error } = await createRoom(newRoom.name, newRoom.description)
    if (error) {
      setRoomError(error.message)
      setCreating(false)
      return
    }
    setNewRoom({ name: '', description: '' })
    setShowModal(false)
    setCreating(false)
  }

  const sidebarStyle = {
    width: '260px',
    minWidth: '260px',
    background: '#1a1a2e',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid rgba(255,255,255,0.08)'
  }

  return (
    <div style={sidebarStyle}>
      {/* Header */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: '15px', flexShrink: 0
          }}>
            {profile?.username?.[0]?.toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.username}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rooms */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px 8px', marginBottom: '4px' }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Channels</span>
          <button
            onClick={() => setShowModal(true)}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: 0 }}
            title="Create channel"
          >+</button>
        </div>

        {rooms.map(room => (
          <button
            key={room.id}
            onClick={() => onSelectRoom(room)}
            style={{
              width: '100%', textAlign: 'left',
              background: currentRoom?.id === room.id ? 'rgba(102,126,234,0.2)' : 'transparent',
              border: 'none', borderRadius: '8px', padding: '8px 10px',
              color: currentRoom?.id === room.id ? '#fff' : 'rgba(255,255,255,0.6)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '14px', marginBottom: '2px', transition: 'all 0.15s'
            }}
          >
            <span style={{ fontSize: '15px', color: 'rgba(255,255,255,0.4)' }}>#</span>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{room.name}</span>
          </button>
        ))}

        {/* Online users */}
        <div style={{ padding: '16px 8px 8px', marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Online — {onlineUsers.length}
          </span>
          {onlineUsers.slice(0, 8).map(u => (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: '11px', fontWeight: 600
                }}>
                  {u.username?.[0]?.toUpperCase()}
                </div>
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 8, height: 8, borderRadius: '50%', background: '#22c55e', border: '1.5px solid #1a1a2e' }} />
              </div>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.username}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sign out */}
      <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button onClick={onSignOut} style={{
          width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.6)', borderRadius: '8px', padding: '8px', cursor: 'pointer', fontSize: '13px'
        }}>
          Sign Out
        </button>
      </div>

      {/* Create Channel Modal */}
      <Modal show={showModal} onHide={() => { setShowModal(false); setRoomError('') }} centered>
        <Modal.Header closeButton style={{ background: '#1a1a2e', borderColor: 'rgba(255,255,255,0.1)' }}>
          <Modal.Title style={{ color: '#fff', fontSize: '16px' }}>Create a Channel</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#1a1a2e' }}>
          {roomError && <div style={{ color: '#f87171', fontSize: '13px', marginBottom: '12px' }}>{roomError}</div>}
          <Form onSubmit={handleCreateRoom}>
            <Form.Group className="mb-3">
              <Form.Label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>Channel Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. project-ideas"
                value={newRoom.name}
                onChange={e => setNewRoom({ ...newRoom, name: e.target.value })}
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>Description (optional)</Form.Label>
              <Form.Control
                type="text"
                placeholder="What's this channel about?"
                value={newRoom.description}
                onChange={e => setNewRoom({ ...newRoom, description: e.target.value })}
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
              />
            </Form.Group>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => { setShowModal(false); setRoomError('') }}>Cancel</Button>
              <Button type="submit" disabled={creating}
                style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none' }}>
                {creating ? 'Creating...' : 'Create Channel'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  )
}
