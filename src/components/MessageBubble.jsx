export default function MessageBubble({ message, isOwn }) {
  const time = new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const username = message.profiles?.username || 'Unknown'
  const initial = username[0]?.toUpperCase()

  function avatarColor(name) {
    const colors = ['#00a884','#25d366','#128c7e','#ef9c0d','#f15c6d','#34b7f1','#9c59d1']
    let h = 0
    for (let i = 0; i < (name?.length || 0); i++) h = (h * 31 + name.charCodeAt(i)) % colors.length
    return colors[h]
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: isOwn ? 'row-reverse' : 'row',
      alignItems: 'flex-end',
      gap: '6px',
      marginBottom: '2px',
      padding: isOwn ? '1px 16px 1px 64px' : '1px 64px 1px 16px',
    }}>
      {!isOwn && (
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: avatarColor(username),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: '11px', fontWeight: 700, flexShrink: 0, marginBottom: '2px'
        }}>
          {initial}
        </div>
      )}

      <div style={{
        maxWidth: '65%',
        background: isOwn ? 'var(--wa-bubble-out)' : 'var(--wa-bubble-in)',
        borderRadius: isOwn ? '12px 2px 12px 12px' : '2px 12px 12px 12px',
        padding: '6px 10px 8px 10px',
        position: 'relative',
        boxShadow: '0 1px 2px rgba(0,0,0,0.3)'
      }}>
        {!isOwn && (
          <div style={{
            color: avatarColor(username),
            fontSize: '12.5px',
            fontWeight: 600,
            marginBottom: '2px'
          }}>
            {username}
          </div>
        )}

        {message.file_url && (
          <div style={{ marginBottom: 4 }}>
            {/\.(jpg|jpeg|png|gif|webp)$/i.test(message.file_name || '') ? (
              <img src={message.file_url} alt={message.file_name}
                style={{ maxWidth: '100%', borderRadius: '8px', maxHeight: '200px', objectFit: 'cover', display: 'block' }} />
            ) : (
              <a href={message.file_url} target="_blank" rel="noopener noreferrer"
                style={{ color: '#53bdeb', textDecoration: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '20px' }}>📎</span>
                <span style={{ textDecoration: 'underline' }}>{message.file_name}</span>
              </a>
            )}
          </div>
        )}

        {message.content && message.content !== 'Shared a file' && (
          <span style={{
            color: 'var(--wa-text)',
            fontSize: '14.2px',
            lineHeight: 1.45,
            wordBreak: 'break-word',
            paddingRight: '44px',
            display: 'inline'
          }}>
            {message.content}
          </span>
        )}

        <span style={{
          float: 'right',
          marginLeft: '8px',
          marginBottom: '-4px',
          marginTop: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '3px'
        }}>
          <span style={{ color: 'var(--wa-text-muted)', fontSize: '11px', whiteSpace: 'nowrap' }}>{time}</span>
          {isOwn && (
            <svg viewBox="0 0 16 15" width="16" height="15" fill="var(--wa-tick)">
              <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.88a.32.32 0 0 1-.484.032l-.358-.325a.32.32 0 0 0-.484.032l-.378.48a.418.418 0 0 0 .036.54l1.32 1.267a.32.32 0 0 0 .484-.034l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.88a.32.32 0 0 1-.484.032L1.892 7.77a.366.366 0 0 0-.516.009l-.423.433a.364.364 0 0 0 .006.514l3.255 3.185a.32.32 0 0 0 .484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"/>
            </svg>
          )}
        </span>
      </div>
    </div>
  )
}
