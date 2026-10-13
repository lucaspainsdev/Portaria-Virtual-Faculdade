'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

type Dado = { label: string; receitas: number; despesas: number }

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { value: number; name: string; color: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', padding: '10px 14px' }}>
      <p style={{ fontSize: '0.75rem', color: '#888', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ fontSize: '0.875rem', color: p.color, margin: '2px 0' }}>
          {p.name === 'receitas' ? 'Receitas' : 'Despesas'}: <strong>{formatCurrency(p.value)}</strong>
        </p>
      ))}
    </div>
  )
}

export function GraficoBarras({ dados }: { dados: Dado[] }) {
  return (
    <ResponsiveContainer width='100%' height={240}>
      <BarChart data={dados} barCategoryGap='30%' barGap={4}>
        <CartesianGrid vertical={false} stroke='#222' />
        <XAxis
          dataKey='label'
          tick={{ fill: '#555', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
          tick={{ fill: '#555', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={56}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Legend
          formatter={(v) => <span style={{ color: '#888', fontSize: '0.8rem' }}>{v === 'receitas' ? 'Receitas' : 'Despesas'}</span>}
        />
        <Bar dataKey='receitas' fill='#22c55e' radius={[4, 4, 0, 0]} />
        <Bar dataKey='despesas' fill='#cc0000'  radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
