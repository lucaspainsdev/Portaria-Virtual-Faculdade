export const dynamic = 'force-dynamic'

import { DollarSign, TrendingDown, FileSignature } from 'lucide-react'
import { FinancialChart } from '@/components/dashboard/financial-chart'
import { AlertsPanel }    from '@/components/dashboard/alerts-panel'
import { buscarDadosDashboard } from './queries'
import { formatCurrency } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function formatDataExtenso() {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date())
}

function MetricCardInline({
  title, value, sub, accentColor, iconColor, Icon,
}: {
  title:       string
  value:       string
  sub?:        string
  accentColor: string
  iconColor:   string
  Icon:        LucideIcon
}) {
  return (
    <div style={{
      background:    '#111111',
      border:        '1px solid rgba(255,255,255,0.08)',
      borderTop:     `3px solid ${accentColor}`,
      borderRadius:  '12px',
      padding:       '24px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize:      '11px',
            color:         '#666',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            fontWeight:    600,
            margin:        '0 0 12px',
          }}>
            {title}
          </p>
          <p style={{
            fontFamily:    'var(--font-heading), sans-serif',
            fontWeight:    900,
            fontSize:      '32px',
            color:         '#ffffff',
            margin:        '0 0 6px',
            lineHeight:    1,
            letterSpacing: '0.02em',
          }}>
            {value}
          </p>
          {sub && (
            <p style={{ fontSize: '12px', color: '#555', margin: 0 }}>{sub}</p>
          )}
        </div>
        <div style={{
          width:          '40px',
          height:         '40px',
          borderRadius:   '50%',
          background:     `${iconColor}22`,
          border:         `1px solid ${iconColor}44`,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          flexShrink:     0,
        }}>
          <Icon size={18} style={{ color: iconColor }} />
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background:   '#111111',
      border:       '1px solid rgba(255,255,255,0.08)',
      borderRadius: '12px',
      padding:      '24px',
    }}>
      <p style={{
        fontFamily:    'var(--font-heading), sans-serif',
        fontWeight:    700,
        fontSize:      '16px',
        color:         '#cc0000',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        margin:        '0 0 20px',
      }}>
        {title}
      </p>
      {children}
    </div>
  )
}

export default async function DashboardPage() {
  const {
    receitaMes, despesaMes,
    grafico3meses,
    contratosAtivosCount, contratosVencendo,
    mensalidadesAtrasadas, receitaRecorrente,
  } = await buscarDadosDashboard()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '48px' }}>

      {/* Saudação */}
      <div>
        <h2 style={{
          fontFamily:    'var(--font-heading), sans-serif',
          fontWeight:    700,
          fontSize:      '24px',
          color:         '#f0f0f0',
          margin:        '0 0 4px',
          textTransform: 'capitalize',
        }}>
          {getGreeting()}
        </h2>
        <p style={{ fontSize: '14px', color: '#666', margin: 0, textTransform: 'capitalize' }}>
          {formatDataExtenso()}
        </p>
      </div>

      {/* Alertas de contratos */}
      <AlertsPanel
        contratosVencendo={contratosVencendo}
        mensalidadesAtrasadas={mensalidadesAtrasadas}
        receitaRecorrente={receitaRecorrente}
        contratosAtivosCount={contratosAtivosCount}
      />

      {/* Cards de métricas */}
      <div style={{
        display:             'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap:                 '16px',
      }}>
        <MetricCardInline
          title="Receita do mês"
          value={formatCurrency(receitaMes)}
          sub={`Despesas: ${formatCurrency(despesaMes)}`}
          accentColor="#22c55e"
          iconColor="#22c55e"
          Icon={DollarSign}
        />
        <MetricCardInline
          title="Despesas do mês"
          value={formatCurrency(despesaMes)}
          sub={`Saldo: ${formatCurrency(receitaMes - despesaMes)}`}
          accentColor="#f87171"
          iconColor="#f87171"
          Icon={TrendingDown}
        />
        <MetricCardInline
          title="Receita recorrente"
          value={formatCurrency(receitaRecorrente)}
          sub={`${contratosAtivosCount} contratos ativos`}
          accentColor="#3b82f6"
          iconColor="#3b82f6"
          Icon={FileSignature}
        />
      </div>

      {/* Resumo financeiro */}
      <Section title="Resumo Financeiro">
        <FinancialChart data={grafico3meses} />
      </Section>

    </div>
  )
}
