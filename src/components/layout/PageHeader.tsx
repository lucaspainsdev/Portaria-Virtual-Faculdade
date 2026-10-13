import { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface PageHeaderProps {
  title:       string
  description?: string
  actions?:    ReactNode
  backHref?:   string
  backLabel?:  string
}

export function PageHeader({ title, description, actions, backHref, backLabel = 'Voltar' }: PageHeaderProps) {
  return (
    <div style={{ marginBottom: '28px' }}>
      {backHref && (
        <Link
          href={backHref}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            fontSize: '0.8rem', color: '#555', textDecoration: 'none',
            marginBottom: '12px', transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#f0f0f0' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#555' }}
        >
          <ArrowLeft size={13} />
          {backLabel}
        </Link>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: '1.9rem',
            color: '#f0f0f0',
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            lineHeight: 1.1,
          }}>
            {title}
          </h1>
          {description && (
            <p style={{ fontSize: '0.85rem', color: '#555', margin: '4px 0 0' }}>
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
