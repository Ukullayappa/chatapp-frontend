import { useState, useEffect, useRef } from 'react'
import { useMessages } from '../hooks/useMessages'
import { getSocket } from '../utils/socket'
import api from '../utils/api'
import MessageBubble from './MessageBubble'
import { useOnlineUsers } from '../hooks/useOnlineUsers'

function groupMessagesByDate(messages) {
  const groups = []
  let lastDate = null
  messages.forEach(msg => {
    const d = new Date(msg.created_at)
    const label = d.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' })
    if (label !== lastDate) { groups.push({ type: 'date', label }); lastDate = label }
    groups.push({ type: 'message', msg })
  })
  return groups
}

function avatarColor(name) {
  const colors = ['#4f46e5','#7c3aed','#0891b2','#059669','#d97706','#dc2626','#db2777']
  let h = 0
  for (let i = 0; i < (name?.length || 0); i++) h = (h * 31 + name.charCodeAt(i)) % colors.length
  return colors[h]
}

export default function ChatWindow({ room, profile, onBack, isMobile = false }) {
  const { messages, loading, sendMessage } = useMessages(room?.id)
  const { onlineUsers } = useOnlineUsers()
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [typingUsers, setTypingUsers] = useState([])
  const bottomRef = useRef(null)
  const fileRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!room) return
    const token = localStorage.getItem('chatapp_token')
    const socket = getSocket(token)
    const onUserTyping = ({ userId, username }) => {
      if (userId === profile?.id) return
      setTypingUsers(prev => prev.includes(username) ? prev : [...prev, username])
    }
    const onUserStoppedTyping = ({ username }) => {
      setTypingUsers(prev => prev.filter(u => u !== username))
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
    const el = textareaRef.current
    if (el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 120) + 'px' }
    if (!room) return
    const token = localStorage.getItem('chatapp_token')
    const socket = getSocket(token)
    socket.emit('typing_start', { room_id: room.id })
    clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => socket.emit('typing_stop', { room_id: room.id }), 2000)
  }

  async function handleSend(e) {
    e?.preventDefault()
    if (!text.trim() || sending) return
    setSending(true)
    const token = localStorage.getItem('chatapp_token')
    const socket = getSocket(token)
    socket.emit('typing_stop', { room_id: room.id })
    sendMessage(text.trim(), profile.id)
    setText('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setSending(false)
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await api.post('/api/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      sendMessage('Shared a file', profile.id, res.data.url, res.data.name)
    } catch { alert('File upload failed.') }
    setUploading(false)
    e.target.value = ''
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  // Empty state (desktop only — mobile never shows this because we always show sidebar first)
  if (!room) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--chat-bg)',
      }}>
        <div style={{ textAlign: 'center', maxWidth: 320 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 24,
            background: 'linear-gradient(135deg, var(--primary), #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 8px 32px rgba(79,70,229,0.3)'
          }}>
            <svg viewBox="0 0 24 24" width="40" height="40" fill="white">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
            </svg>
          </div>
          <h2 style={{ fontWeight: 700, fontSize: 22, color: 'var(--text)', marginBottom: 10, letterSpacing: '-0.02em' }}>
            Select a Room
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6 }}>
            Choose a room from the sidebar to start chatting.
          </p>
        </div>
      </div>
    )
  }

  const color = avatarColor(room.name)
  const grouped = groupMessagesByDate(messages)

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      background: 'var(--chat-bg)', height: '100vh', overflow: 'hidden',
      width: isMobile ? '100%' : undefined
    }}>
      {/* Header */}
      <div style={{
        background: 'var(--header-bg)',
        padding: isMobile ? '10px 14px' : '12px 20px',
        display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 14,
        flexShrink: 0,
        borderBottom: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        minHeight: isMobile ? 62 : 66
      }}>
        {/* Back button on mobile */}
        {isMobile && (
          <button
            onClick={onBack}
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'var(--hover)', border: 'none',
              color: 'var(--text)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'all 0.15s'
            }}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
          </button>
        )}

        <div style={{
          width: isMobile ? 38 : 42, height: isMobile ? 38 : 42,
          borderRadius: isMobile ? 12 : 14,
          background: `linear-gradient(135deg, ${color}cc, ${color})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: isMobile ? 15 : 16,
          flexShrink: 0, boxShadow: `0 4px 12px ${color}40`
        }}>
          {room.name[0]?.toUpperCase()}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 700, fontSize: isMobile ? 16 : 15,
            color: 'var(--text)', letterSpacing: '-0.01em',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>
            {room.name}
          </div>
          <div style={{ fontSize: 12, color: typingUsers.length > 0 ? 'var(--primary)' : 'var(--text-muted)', marginTop: 1 }}>
            {typingUsers.length > 0 ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                  {[0, 0.2, 0.4].map((delay, i) => (
                    <span key={i} style={{
                      width: 4, height: 4, borderRadius: '50%', background: 'var(--primary)',
                      display: 'inline-block',
                      animation: `blink 1.2s ${delay}s infinite`
                    }} />
                  ))}
                </span>
                {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing
              </span>
            ) : (
              room.description || 'Group room'
            )}
          </div>
        </div>

        {/* Action buttons — hide on very small screens if needed */}
        {!isMobile && (
          <div style={{ display: 'flex', gap: 4 }}>
            {[
              { icon: <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>, title: 'Search' },
              { icon: <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>, title: 'More' }
            ].map(({ icon, title }, i) => (
              <button key={i} title={title} style={{
                width: 34, height: 34, borderRadius: 10,
                background: 'transparent', border: 'none',
                color: 'var(--text-muted)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s'
              }}
                onMouseOver={e => { e.currentTarget.style.background = 'var(--hover)'; e.currentTarget.style.color = 'var(--text)' }}
                onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
              >
                {icon}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '12px 0',
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(79,70,229,0.04) 1px, transparent 0)',
        backgroundSize: '24px 24px'
      }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: 60, flexDirection: 'column', gap: 12 }}>
            <div style={{
              width: 32, height: 32, border: '3px solid var(--border)',
              borderTopColor: 'var(--primary)', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }} />
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}>
            <div style={{
              background: '#fff', padding: '12px 20px', borderRadius: 12,
              fontSize: 13, color: 'var(--text-muted)',
              border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)'
            }}>
              👋 No messages yet. Say hello!
            </div>
          </div>
        ) : (
          grouped.map((item, i) => item.type === 'date' ? (
            <div key={`d-${i}`} style={{ display: 'flex', justifyContent: 'center', margin: '16px 0 8px' }}>
              <div style={{
                background: '#fff', color: 'var(--text-muted)',
                padding: '5px 14px', borderRadius: 20, fontSize: 11,
                fontWeight: 600, boxShadow: 'var(--shadow-sm)',
                border: '1px solid var(--border)', letterSpacing: '0.02em'
              }}>
                {item.label}
              </div>
            </div>
          ) : (
            <MessageBubble key={item.msg.id} message={item.msg} isOwn={item.msg.sender_id === profile?.id} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div style={{
        background: 'var(--header-bg)',
        padding: isMobile ? '10px 12px' : '12px 16px',
        borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'flex-end', gap: 8, flexShrink: 0,
        // Safe area for mobile browsers with home bar
        paddingBottom: isMobile ? 'max(10px, env(safe-area-inset-bottom))' : '12px'
      }}>
        <input type="file" ref={fileRef} onChange={handleFileUpload} style={{ display: 'none' }} />

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          title="Attach file"
          style={{
            width: isMobile ? 44 : 40, height: isMobile ? 44 : 40,
            borderRadius: 12,
            background: 'var(--hover)', border: '1.5px solid var(--border)',
            color: uploading ? 'var(--primary)' : 'var(--text-muted)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'all 0.15s'
          }}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
          </svg>
        </button>

        {/* Text input */}
        <div style={{
          flex: 1,
          background: 'var(--input-bg)',
          borderRadius: 14, border: '1.5px solid var(--border)',
          display: 'flex', alignItems: 'flex-end',
          transition: 'border-color 0.2s'
        }}
          onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--primary)'}
          onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: 'var(--text)', resize: 'none',
              fontSize: isMobile ? 15 : 14,
              padding: isMobile ? '12px 14px' : '11px 14px',
              lineHeight: 1.5, maxHeight: 120,
              fontFamily: 'inherit', overflowY: 'auto'
            }}
          />
        </div>

        {/* Send button */}
        <button
          onClick={text.trim() ? handleSend : undefined}
          style={{
            width: isMobile ? 46 : 42, height: isMobile ? 46 : 42,
            borderRadius: 13,
            background: text.trim()
              ? 'linear-gradient(135deg, var(--primary), #7c3aed)'
              : 'var(--hover)',
            border: text.trim() ? 'none' : '1.5px solid var(--border)',
            cursor: text.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            transition: 'all 0.2s',
            boxShadow: text.trim() ? '0 4px 12px rgba(79,70,229,0.35)' : 'none',
          }}
        >
          {text.trim() ? (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="white">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="var(--text-subtle)">
              <path d="M12 15c1.66 0 2.99-1.34 2.99-3L15 6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 15 6.7 12H5c0 3.42 2.72 6.23 6 6.72V22h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
