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

export default function ChatWindow({ room, profile }) {
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
    function onUserTyping({ userId, username }) {
      if (userId === profile?.id) return
      setTypingUsers(prev => prev.includes(username) ? prev : [...prev, username])
    }
    function onUserStoppedTyping({ username }) {
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
    if (el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 140) + 'px' }
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

  function avatarColor(name) {
    const colors = ['#00a884','#25d366','#128c7e','#ef9c0d','#f15c6d','#34b7f1','#9c59d1']
    let h = 0
    for (let i = 0; i < (name?.length || 0); i++) h = (h * 31 + name.charCodeAt(i)) % colors.length
    return colors[h]
  }

  if (!room) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: 'var(--wa-chat-bg)', borderLeft: '1px solid var(--wa-border)'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '320px' }}>
          <div style={{ fontSize: '80px', marginBottom: '24px', opacity: 0.1 }}>💬</div>
          <h2 style={{ color: 'var(--wa-text)', fontWeight: 300, fontSize: '32px', marginBottom: '16px' }}>WhatsApp Web</h2>
          <p style={{ color: 'var(--wa-text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
            Select a chat from the left to start messaging
          </p>
        </div>
      </div>
    )
  }

  const grouped = groupMessagesByDate(messages)

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--wa-chat-bg)', height: '100vh' }}>
      {/* Header */}
      <div style={{
        background: 'var(--wa-header-bg)',
        padding: '10px 16px',
        display: 'flex', alignItems: 'center', gap: '12px',
        height: '59px', flexShrink: 0, borderBottom: '1px solid var(--wa-border)'
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: avatarColor(room.name),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: '16px', flexShrink: 0
        }}>
          {room.name[0]?.toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: 'var(--wa-text)', fontWeight: 600, fontSize: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {room.name}
          </div>
          <div style={{ color: 'var(--wa-green)', fontSize: '12px' }}>
            {typingUsers.length > 0
              ? `${typingUsers.join(', ')} ${typingUsers.length === 1 ? 'is' : 'are'} typing...`
              : room.description || 'Group chat'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[
            <svg key="s" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M15.009 13.805h-.636l-.22-.219a5.184 5.184 0 0 0 1.256-3.386 5.207 5.207 0 1 0-5.207 5.208 5.183 5.183 0 0 0 3.385-1.255l.221.22v.635l4.004 3.999 1.194-1.195-3.997-4.007zm-4.808 0a3.605 3.605 0 1 1 0-7.21 3.605 3.605 0 0 1 0 7.21z"/></svg>,
            <svg key="m" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 9zm0 6a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 15z"/></svg>
          ].map((icon, i) => (
            <button key={i} style={{ background: 'none', border: 'none', color: 'var(--wa-text-muted)', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center' }}>
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '40px' }}>
            <div style={{ width: 28, height: 28, border: '3px solid var(--wa-green)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : messages.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '30px' }}>
            <div style={{ background: 'var(--wa-panel-bg)', color: 'var(--wa-text-muted)', padding: '8px 16px', borderRadius: '8px', fontSize: '13px' }}>
              No messages yet. Say hello! 👋
            </div>
          </div>
        ) : (
          grouped.map((item, i) => item.type === 'date' ? (
            <div key={`d-${i}`} style={{ display: 'flex', justifyContent: 'center', margin: '12px 0' }}>
              <div style={{ background: 'var(--wa-panel-bg)', color: 'var(--wa-text-muted)', padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 500 }}>
                {item.label}
              </div>
            </div>
          ) : (
            <MessageBubble key={item.msg.id} message={item.msg} isOwn={item.msg.sender_id === profile?.id} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        background: 'var(--wa-header-bg)', padding: '10px 16px',
        display: 'flex', alignItems: 'flex-end', gap: '10px', flexShrink: 0
      }}>
        <input type="file" ref={fileRef} onChange={handleFileUpload} style={{ display: 'none' }} />
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
          style={{ background: 'none', border: 'none', color: uploading ? 'var(--wa-green)' : 'var(--wa-text-muted)', cursor: 'pointer', padding: '8px', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
            <path d="M1.816 15.556v.002c0 1.502.584 2.912 1.646 3.972s2.472 1.647 3.974 1.647a5.58 5.58 0 0 0 3.972-1.645l9.547-9.548c.769-.768 1.147-1.767 1.058-2.817-.079-.968-.548-1.927-1.319-2.698-1.594-1.592-4.068-1.711-5.517-.262l-7.916 7.915c-.881.881-.792 2.25.214 3.261.959.958 2.423 1.053 3.263.215l5.511-5.512c.28-.28.267-.722.053-.936l-.244-.244c-.191-.191-.567-.349-.957.04l-5.506 5.506c-.18.18-.635.127-.976-.214-.098-.097-.576-.613-.213-.973l7.915-7.917c.818-.817 2.267-.699 3.23.262.5.501.802 1.1.849 1.685.051.573-.156 1.111-.589 1.543l-9.547 9.549a3.97 3.97 0 0 1-2.829 1.171 3.975 3.975 0 0 1-2.83-1.173 3.973 3.973 0 0 1-1.172-2.828c0-1.071.415-2.076 1.172-2.83l7.209-7.211c.157-.157.264-.579.028-.814L11.5 4.36a.572.572 0 0 0-.834.018L3.458 11.58a5.567 5.567 0 0 0-1.642 3.976z"/>
          </svg>
        </button>

        <button style={{ background: 'none', border: 'none', color: 'var(--wa-text-muted)', cursor: 'pointer', padding: '8px', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
            <path d="M9.153 11.603c.795 0 1.44-.88 1.44-1.962s-.645-1.96-1.44-1.96c-.795 0-1.44.88-1.44 1.96s.645 1.965 1.44 1.965zM5.95 12.965c-.027.271.266.569.542.455.547-.23 1.607-.36 2.508-.36.902 0 1.96.13 2.508.36.276.115.57-.184.542-.455-.105-1.016-.68-1.964-1.857-2.38a4.163 4.163 0 0 0-1.387-.236c-.482 0-.976.081-1.39.236-1.175.416-1.751 1.364-1.856 2.38zm11.035-1.362c.795 0 1.44-.88 1.44-1.962s-.645-1.96-1.44-1.96c-.795 0-1.44.88-1.44 1.96s.645 1.965 1.44 1.965zm1.949 1.713a4.175 4.175 0 0 0-1.387-.236c-.482 0-.976.081-1.39.236-1.175.416-1.75 1.363-1.857 2.38-.026.27.267.568.543.454.547-.23 1.606-.36 2.508-.36.902 0 1.96.13 2.508.36.276.114.57-.184.542-.455-.105-1.016-.68-1.964-1.857-2.38zm-4.626 5.559c-1.525 0-3.015-.512-3.839-1.359a.245.245 0 0 0-.36.331c.98 1.036 2.653 1.72 4.199 1.72 1.545 0 3.219-.684 4.199-1.72a.245.245 0 0 0-.36-.33c-.825.847-2.315 1.358-3.839 1.358zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22.786C6.048 22.786 1.214 17.953 1.214 12 1.214 6.048 6.048 1.214 12 1.214c5.953 0 10.786 4.834 10.786 10.786 0 5.953-4.833 10.786-10.786 10.786z"/>
          </svg>
        </button>

        <div style={{ flex: 1, background: 'var(--wa-input-bg)', borderRadius: '10px', display: 'flex', alignItems: 'flex-end' }}>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message"
            rows={1}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: 'var(--wa-text)', resize: 'none', fontSize: '15px',
              padding: '11px 14px', lineHeight: 1.5, maxHeight: '140px',
              fontFamily: 'inherit', overflowY: 'auto'
            }}
          />
        </div>

        <button onClick={text.trim() ? handleSend : undefined} style={{
          width: 44, height: 44, borderRadius: '50%', background: 'var(--wa-green)',
          border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          {text.trim() ? (
            <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff">
              <path d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff">
              <path d="M11.999 14.942c2.001 0 3.531-1.53 3.531-3.531V4.35c0-2.001-1.53-3.531-3.531-3.531S8.468 2.35 8.468 4.35v7.061c0 2.001 1.53 3.531 3.531 3.531zm6.238-3.53c0 3.531-2.942 6.002-6.237 6.002s-6.237-2.471-6.237-6.002H3.761c0 3.884 3.001 7.129 6.943 7.766v3.089h2.588v-3.089c3.942-.637 6.943-3.882 6.943-7.766h-2.001z"/>
            </svg>
          )}
        </button>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
