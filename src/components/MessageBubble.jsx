export default function MessageBubble({ message, isOwn }) {
  const time = new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const username = message.profiles?.username || 'Unknown'
  const initial = username[0]?.toUpperCase()

  return (
    <div style={{
      display: 'flex',
      flexDirection: isOwn ? 'row-reverse' : 'row',
      alignItems: 'flex-end',
      gap: '8px',
      marginBottom: '12px'
    }}>
      {/* Avatar */}
      {!isOwn && (
        <div style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: '12px', fontWeight: 600
        }}>
          {initial}
        </div>
      )}

      <div style={{ maxWidth: '65%' }}>
        {!isOwn && (
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginBottom: '4px', paddingLeft: '2px' }}>
            {username}
          </div>
        )}

        <div style={{
          background: isOwn ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255,255,255,0.08)',
          borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          padding: '10px 14px',
          color: '#fff',
          fontSize: '14px',
          lineHeight: 1.5,
          wordBreak: 'break-word'
        }}>
          {message.file_url && (
            <div style={{ marginBottom: message.content && message.content !== 'Shared a file' ? '8px' : 0 }}>
              {/\.(jpg|jpeg|png|gif|webp)$/i.test(message.file_name || '') ? (
                <img src={message.file_url} alt={message.file_name}
                  style={{ maxWidth: '100%', borderRadius: '8px', maxHeight: '200px', objectFit: 'cover' }} />
              ) : (
                <a href={message.file_url} target="_blank" rel="noopener noreferrer"
                  style={{ color: '#a5b4fc', textDecoration: 'underline', fontSize: '13px' }}>
                  📎 {message.file_name}
                </a>
              )}
            </div>
          )}
          {message.content && message.content !== 'Shared a file' && message.content}
        </div>

        <div style={{
          color: 'rgba(255,255,255,0.3)',
          fontSize: '10px',
          marginTop: '3px',
          textAlign: isOwn ? 'right' : 'left',
          paddingLeft: isOwn ? 0 : '2px',
          paddingRight: isOwn ? '2px' : 0
        }}>
          {time}
        </div>
      </div>
    </div>
  )
}
