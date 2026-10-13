'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

type StatusMap = Record<string, number>

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  APROVADO: { label: 'Aprovados', color: '#22c55e' },
  ENVIADO:  { label: 'Enviados',  color: '#3b82f6' },
  RASCUNHO: { label: 'Rascunho',  color: '#71717a' },
  RECUSADO: { label: 'Recusados', color: '#cc0000' },
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: { color: string } }[] }) {
  if (!active || !payload?.length) return null
  const p = payload[0]
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-xl text-sm">
      <span style={{ color: p.payload.color }} className="font-semibold">{p.name}:</span>
      <span className="ml-2 text-foreground">{p.value}</span>
    </div>
  )
}

export function QuotesStatusChart({ statusMap }: { statusMap: StatusMap }) {
  const total = Object.values(statusMap).reduce((s, v) => s + v, 0)

  const data = Object.entries(STATUS_CONFIG)
    .map(([key, cfg]) => ({ name: cfg.label, value: statusMap[key] ?? 0, color: cfg.color }))
    .filter((d) => d.value > 0)

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="mb-4 font-heading text-base font-semibold uppercase tracking-wide text-foreground">
        Status dos Orçamentos
      </h3>

      {total === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Nenhum dado disponível.</p>
      ) : (
        <>
          {/* Donut chart */}
          <div className="relative flex justify-center">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={46} outerRadius={70}
                  paddingAngle={3} dataKey="value" stroke="none" startAngle={90} endAngle={-270}>
                  {data.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-heading text-2xl font-black text-foreground">{total}</span>
              <span className="text-xs text-muted-foreground">total</span>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 space-y-2">
            {data.map((d) => {
              const pct = Math.round((d.value / total) * 100)
              return (
                <div key={d.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-sm shrink-0" style={{ background: d.color }} />
                    <span className="text-muted-foreground">{d.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{d.value}</span>
                    <span className="w-10 text-right font-semibold" style={{ color: d.color }}>{pct}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
