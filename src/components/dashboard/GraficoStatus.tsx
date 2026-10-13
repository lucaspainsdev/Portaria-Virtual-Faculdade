'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const STATUS_CONFIG: Record<string, { label: string; cor: string; bg: string }> = {
  APROVADO: { label: 'Aprovado', cor: '#22c55e', bg: '#14532d' },
  ENVIADO:  { label: 'Enviado',  cor: '#60a5fa', bg: '#1e3a5f' },
  RASCUNHO: { label: 'Rascunho', cor: '#666666', bg: '#1a1a1a' },
  RECUSADO: { label: 'Recusado', cor: '#f87171', bg: '#450a0a' },
}

type Props = { statusMap: Record<string, number> }

function CustomTooltip({ active, payload }: {
  active?: boolean
  payload?: { name: string; value: number; payload: { cor: string } }[]
}) {
  if (!active || !payload?.length) return null
  const p = payload[0]
  return (
    <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '8px 12px', fontSize: '0.8rem', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
      <span style={{ color: p.payload.cor, fontWeight: 700 }}>{p.name}</span>
      <span style={{ color: '#888', marginLeft: '8px' }}>{p.value} orçamento{p.value !== 1 ? 's' : ''}</span>
    </div>
  )
}

export function GraficoStatus({ statusMap }: Props) {
  const total = Object.values(statusMap).reduce((s, v) => s + v, 0)

  const dados = Object.entries(STATUS_CONFIG)
    .map(([key, cfg]) => ({ name: cfg.label, value: statusMap[key] ?? 0, cor: cfg.cor, bg: cfg.bg }))
    .filter((d) => d.value > 0)

  if (total === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '180px', gap: '8px' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '3px solid #1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '1.5rem', color: '#2a2a2a' }}>0</span>
        </div>
        <p style={{ color: '#333', fontSize: '0.8rem' }}>Nenhum orçamento ainda</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
      {/* Donut */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <ResponsiveContainer width={150} height={150}>
          <PieChart>
            <Pie
              data={dados}
              cx='50%' cy='50%'
              innerRadius={48} outerRadius={68}
              paddingAngle={4}
              dataKey='value'
              stroke='none'
              startAngle={90}
              endAngle={-270}
            >
              {dados.map((d, i) => <Cell key={i} fill={d.cor} />)}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Centro: total */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <span style={{ fontFamily: 'var(--font-barlow-condensed),sans-serif', fontWeight: 900, fontSize: '1.4rem', color: '#f0f0f0', lineHeight: 1 }}>
            {total}
          </span>
          <span style={{ fontSize: '0.62rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '2px' }}>
            total
          </span>
        </div>
      </div>

      {/* Legenda lateral */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {dados.map((d) => {
          const pct = total > 0 ? Math.round((d.value / total) * 100) : 0
          return (
            <div key={d.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: d.cor, flexShrink: 0, display: 'block' }} />
                  <span style={{ fontSize: '0.8rem', color: '#ccc' }}>{d.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#555' }}>{d.value}</span>
                  <span style={{
                    background: d.bg,
                    border: `1px solid ${d.cor}33`,
                    borderRadius: '4px',
                    padding: '1px 6px',
                    fontSize: '0.68rem',
                    color: d.cor,
                    fontWeight: 700,
                    minWidth: '36px',
                    textAlign: 'center',
                  }}>
                    {pct}%
                  </span>
                </div>
              </div>
              {/* Barra de progresso */}
              <div style={{ height: '3px', background: '#1e1e1e', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${d.cor}aa, ${d.cor})`,
                  borderRadius: '2px',
                  transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
