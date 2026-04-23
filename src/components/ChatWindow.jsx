import { useState, useEffect, useRef } from 'react'
import { Spinner } from 'react-bootstrap'
import { useMessages } from '../hooks/useMessages'
import { useAuth } from '../hooks/useAuth'
import { getSocket } from '../utils/socket'
import api from '../utils/api'
import MessageBubble from './MessageBubble'

export default function ChatWindow({ room, profile }) {
  const { messages, loading, sendMessage } = useMessages(room?.id)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [typingUsers, setTypingUsers] = useState([])
  const bottomRef = useRef(null)
  const fileRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Listen for typing indicators
  useEffect(() => {
    if (!room) return
    const token = localStorage.getItem('chatapp_token')
    const socket = getSocket(token)

    function onUserTyping({ userId, username }) {
      if (userId === profile?.id) return
      setTypingUsers(prev => prev.includes(username) ? prev : [...prev, username])
    }
    function onUserStoppedTyping({ userId }) {
      setTypingUsers(prev => prev.filter(u => u !== userId))
    }

    socket.on('user_typing', onUserTyping)
    socket.on('user_stopped_typing', onUserStoppedTyping)

    return () => {
      socket.off('user_typing', onUserTyping)
      socket.off('user_stopped_typing', onUserStoppedTyping)
    }
  }, [room, profile])

  function handleTextChange(e) {
    setText(e.target.value)
    if (!room) return
    const token = localStorage.getItem('chatapp_token')
    const socket = getSocket(token)
    socket.emit('typing_start', { room_id: room.id })
    clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', { room_id: room.id })
    }, 2000)
  }

  async function handleSend(e) {
    e.preventDefault()
    if (!text.trim() || sending) return
    setSending(true)

    const token = localStorage.getItem('chatapp_token')
    const socket = getSocket(token)
    socket.emit('typing_stop', { room_id: room.id })

    sendMessage(text.trim(), profile.id)
    setText('')
    setSending(false)
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await api.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      sendMessage('Shared a file', profile.id, res.data.url, res.data.name)
    } catch (err) {
      console.error('Upload failed:', err.message)
      alert('File upload failed. Make sure Cloudinary is configured.')
    }
    setUploading(false)
    e.target.value = ''
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(e)
    }
  }

  if (!room) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f1a' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>💬</div>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '15px' }}>Select a channel to start chatting</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0f0f1a', height: '100vh' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '18px' }}>#</span>
        <div>
          <h6 style={{ color: '#fff', margin: 0, fontWeight: 600 }}>{room.name}</h6>
          {room.description && <p style={{ color: 'rgba(255,255,255,0.4)', margin: 0, fontSize: '12px' }}>{room.description}</p>}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', paddingTop: '40px' }}>
            <Spinner animation="border" size="sm" style={{ color: '#667eea' }} />
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: '40px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>👋</div>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>Be the first to say something in #{room.name}!</p>
          </div>
        ) : (
          messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} isOwn={msg.sender_id === profile?.id} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div style={{ padding: '0 20px 4px', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
          {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '12px 20px 16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <form onSubmit={handleSend} style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
          <input type="file" ref={fileRef} onChange={handleFileUpload} style={{ display: 'none' }} />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '10px 12px', fontSize: '16px', flexShrink: 0 }}
            title="Attach file">
            {uploading ? '⏳' : '📎'}
          </button>

          <textarea
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder={`Message #${room.name}`}
            rows={1}
            style={{
              flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px', padding: '10px 14px', color: '#fff', resize: 'none',
              fontSize: '14px', outline: 'none', lineHeight: 1.5, maxHeight: '120px',
              fontFamily: 'inherit'
            }}
          />

          <button type="submit" disabled={!text.trim() || sending}
            style={{
              background: text.trim() ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255,255,255,0.07)',
              border: 'none', borderRadius: '8px', color: '#fff', cursor: text.trim() ? 'pointer' : 'default',
              padding: '10px 14px', fontSize: '16px', flexShrink: 0, transition: 'all 0.2s'
            }}>
            {sending ? '⏳' : '➤'}
          </button>
        </form>
      </div>
    </div>
  )
}
