export default function MessageBubble({ message, isOwn }) {
  const time = new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const username = message.profiles?.username || 'Unknown'
  const initial = username[0]?.toUpperCase()

  function avatarColor(name) {
    const colors = ['#4f46e5','#7c3aed','#0891b2','#059669','#d97706','#dc2626','#db2777']
    let h = 0
    for (let i = 0; i < (name?.length || 0); i++) h = (h * 31 + name.charCodeAt(i)) % colors.length
    return colors[h]
  }

  const color = avatarColor(username)

  return (
    <div style={{
      display: 'flex',
      flexDirection: isOwn ? 'row-reverse' : 'row',
      alignItems: 'flex-end',
      gap: 8,
      marginBottom: 4,
      padding: isOwn ? '2px 16px 2px 72px' : '2px 72px 2px 16px',
      animation: 'fadeIn 0.2s ease'
    }}>
      {!isOwn && (
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background: `linear-gradient(135deg, ${color}cc, ${color})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0
        }}>
          {initial}
        </div>
      )}

      <div style={{ maxWidth: '65%', position: 'relative' }}>
        {!isOwn && (
          <div style={{ color, fontSize: 11, fontWeight: 700, marginBottom: 4, paddingLeft: 2, letterSpacing: '0.02em' }}>
            {username}
          </div>
        )}

        <div style={{
          background: isOwn
            ? 'linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%)'
            : 'var(--bubble-in)',
          borderRadius: isOwn ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
          padding: '10px 14px',
          boxShadow: isOwn
            ? '0 4px 12px rgba(79,70,229,0.25)'
            : '0 2px 8px rgba(0,0,0,0.06)',
          border: isOwn ? 'none' : '1px solid var(--border)'
        }}>
          {message.file_url && (
            <div style={{ marginBottom: message.content && message.content !== 'Shared a file' ? 8 : 0 }}>
              {/\.(jpg|jpeg|png|gif|webp)$/i.test(message.file_name || '') ? (
                <img
                  src={message.file_url}
                  alt={message.file_name}
                  style={{ maxWidth: '100%', borderRadius: 10, maxHeight: 200, objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <a
                  href={message.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: isOwn ? 'rgba(255,255,255,0.9)' : 'var(--primary)',
                    textDecoration: 'none', fontSize: 13,
                    display: 'flex', alignItems: 'center', gap: 6
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: isOwn ? 'rgba(255,255,255,0.2)' : 'var(--primary-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill={isOwn ? '#fff' : 'var(--primary)'}>
                      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
                    </svg>
                  </div>
                  <span style={{ textDecoration: 'underline', wordBreak: 'break-word' }}>{message.file_name}</span>
                </a>
              )}
            </div>
          )}

          {message.content && message.content !== 'Shared a file' && (
            <span style={{
              color: isOwn ? '#fff' : 'var(--text)',
              fontSize: 14, lineHeight: 1.5, wordBreak: 'break-word',
              display: 'block', paddingRight: 52
            }}>
              {message.content}
            </span>
          )}

          {/* Time + tick */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
            gap: 3, marginTop: 4
          }}>
            <span style={{
              color: isOwn ? 'rgba(255,255,255,0.6)' : 'var(--text-subtle)',
              fontSize: 11, whiteSpace: 'nowrap'
            }}>
              {time}
            </span>
            {isOwn && (
              <svg viewBox="0 0 16 15" width="14" height="14" fill="rgba(255,255,255,0.7)">
                <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.88a.32.32 0 0 1-.484.032l-.358-.325a.32.32 0 0 0-.484.032l-.378.48a.418.418 0 0 0 .036.54l1.32 1.267a.32.32 0 0 0 .484-.034l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.88a.32.32 0 0 1-.484.032L1.892 7.77a.366.366 0 0 0-.516.009l-.423.433a.364.364 0 0 0 .006.514l3.255 3.185a.32.32 0 0 0 .484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"/>
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
