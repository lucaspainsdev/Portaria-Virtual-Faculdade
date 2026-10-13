import { ReactNode } from 'react'

interface EmptyStateProps {
  icon?:        ReactNode
  title:        string
  description?: string
  action?:      ReactNode
  compact?:     boolean
}

export function EmptyState({ icon, title, description, action, compact }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: compact ? '32px 24px' : '64px 24px',
        gap: '12px',
      }}
    >
      {icon && (
        <div
          style={{
            width: compact ? '40px' : '52px',
            height: compact ? '40px' : '52px',
            borderRadius: '12px',
            background: '#1a1a1a',
            border: '1px solid #222',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#333',
            marginBottom: '4px',
          }}
        >
          {icon}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: compact ? '0.9rem' : '1rem',
            color: '#555',
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {title}
        </p>
        {description && (
          <p style={{ fontSize: '0.82rem', color: '#333', margin: 0, maxWidth: '280px' }}>
            {description}
          </p>
        )}
      </div>

      {action && <div style={{ marginTop: '8px' }}>{action}</div>}
    </div>
  )
}
