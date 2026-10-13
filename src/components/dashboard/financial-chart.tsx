'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

type ChartPoint = { label: string; receitas: number; despesas: number }

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  const fmt = (v: number) => `R$ ${(v / 1000).toFixed(1)}k`
  return (
    <div className="rounded-lg border border-border bg-popover px-4 py-3 shadow-xl">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-medium" style={{ color: p.color }}>
          {p.name === 'receitas' ? 'Receitas' : 'Despesas'}: {fmt(p.value)}
        </p>
      ))}
    </div>
  )
}

export function FinancialChart({ data }: { data: ChartPoint[] }) {
  const fmt = (v: number) => v === 0 ? '0' : `${(v / 1000).toFixed(0)}k`

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-heading text-base font-semibold uppercase tracking-wide text-foreground">
            Resumo Financeiro
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">Últimos 6 meses</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-[#22c55e]" />Receitas</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-[#cc0000]" />Despesas</span>
        </div>
      </div>

      {data.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">Sem dados financeiros para exibir.</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="gradR" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradD" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#cc0000" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#cc0000" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
            <XAxis dataKey="label" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={fmt} tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }} />
            <Area type="monotone" dataKey="receitas" stroke="#22c55e" strokeWidth={2} fill="url(#gradR)"
              dot={false} activeDot={{ r: 4, fill: '#22c55e', stroke: '#111', strokeWidth: 2 }} />
            <Area type="monotone" dataKey="despesas" stroke="#cc0000" strokeWidth={2} fill="url(#gradD)"
              dot={false} activeDot={{ r: 4, fill: '#cc0000', stroke: '#111', strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
