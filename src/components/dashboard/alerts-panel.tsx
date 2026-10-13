import Link from 'next/link'
import { AlertTriangle, Clock, CheckCircle2, TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

type Props = {
  contratosVencendo:     number
  mensalidadesAtrasadas: number
  receitaRecorrente:     number
  contratosAtivosCount:  number
}

export function AlertsPanel({
  contratosVencendo,
  mensalidadesAtrasadas,
  receitaRecorrente,
  contratosAtivosCount,
}: Props) {
  const temAlertas = contratosVencendo > 0 || mensalidadesAtrasadas > 0

  return (
    <div
      style={{
        background: '#111',
        border: `1px solid ${temAlertas ? 'rgba(251,146,60,0.25)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: `1px solid ${temAlertas ? 'rgba(251,146,60,0.15)' : 'rgba(255,255,255,0.06)'}`,
          background: temAlertas ? 'rgba(251,146,60,0.04)' : 'transparent',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {temAlertas
            ? <AlertTriangle size={15} style={{ color: '#fb923c' }} />
            : <CheckCircle2 size={15} style={{ color: '#22c55e' }} />
          }
          <span style={{
            fontFamily: 'var(--font-heading),sans-serif',
            fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: temAlertas ? '#fb923c' : '#22c55e',
          }}>
            {temAlertas ? 'Alertas de Contratos' : 'Contratos em dia'}
          </span>
        </div>
        <Link href='/contratos' style={{ fontSize: '0.72rem', color: '#cc0000', textDecoration: 'none', fontWeight: 600 }}>
          Ver contratos →
        </Link>
      </div>

      {/* Itens */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0' }}>

        {/* Mensalidades atrasadas */}
        <AlertItem
          valor={mensalidadesAtrasadas}
          label='Mensalidades atrasadas'
          sublabel='neste mês'
          icon={<AlertTriangle size={16} />}
          cor={mensalidadesAtrasadas > 0 ? '#cc0000' : '#22c55e'}
          bg={mensalidadesAtrasadas > 0 ? 'rgba(204,0,0,0.1)' : 'rgba(34,197,94,0.08)'}
          borda='right'
        />

        {/* Contratos vencendo */}
        <AlertItem
          valor={contratosVencendo}
          label='Vencem em 30 dias'
          sublabel={`de ${contratosAtivosCount} ativos`}
          icon={<Clock size={16} />}
          cor={contratosVencendo > 0 ? '#fb923c' : '#22c55e'}
          bg={contratosVencendo > 0 ? 'rgba(251,146,60,0.08)' : 'rgba(34,197,94,0.08)'}
          borda='right'
        />

        {/* Receita recorrente */}
        <AlertItem
          valor={null}
          valorStr={formatCurrency(receitaRecorrente)}
          label='Receita recorrente'
          sublabel='mensal (contratos ativos)'
          icon={<TrendingUp size={16} />}
          cor='#22c55e'
          bg='rgba(34,197,94,0.06)'
        />
      </div>
    </div>
  )
}

function AlertItem({
  valor, valorStr, label, sublabel, icon, cor, bg, borda,
}: {
  valor:     number | null
  valorStr?: string
  label:     string
  sublabel:  string
  icon:      React.ReactNode
  cor:       string
  bg:        string
  borda?:    'right'
}) {
  return (
    <div style={{
      padding: '16px 20px',
      background: bg,
      borderRight: borda === 'right' ? '1px solid rgba(255,255,255,0.06)' : 'none',
      display: 'flex', flexDirection: 'column', gap: '8px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: cor }}>
        {icon}
        <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </span>
      </div>
      <p style={{
        fontFamily: 'var(--font-heading),sans-serif',
        fontWeight: 900, fontSize: '1.6rem', color: cor,
        margin: 0, lineHeight: 1, letterSpacing: '0.02em',
      }}>
        {valorStr ?? String(valor)}
      </p>
      <p style={{ fontSize: '0.72rem', color: '#555', margin: 0 }}>{sublabel}</p>
    </div>
  )
}
