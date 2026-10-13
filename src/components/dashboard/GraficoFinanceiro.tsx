'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

type Dado = { label: string; receitas: number; despesas: number }

function Tip({ active, payload, label }: {
  active?: boolean
  payload?: { value: number; name: string; color: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#1a1a1a',
      border: '1px solid #2a2a2a',
      borderRadius: '8px',
      padding: '10px 14px',
      fontSize: '0.8rem',
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
    }}>
      <p style={{ color: '#555', margin: '0 0 8px', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </p>
      {payload.map((p) => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '3px 0' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color, flexShrink: 0 }} />
          <span style={{ color: '#888' }}>{p.name === 'receitas' ? 'Receitas' : 'Despesas'}:</span>
          <span style={{ color: p.color, fontWeight: 700 }}>{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export function GraficoFinanceiro({ dados }: { dados: Dado[] }) {
  return (
    <ResponsiveContainer width='100%' height={180}>
      <AreaChart data={dados} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id='gradReceitas' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='5%'  stopColor='#22c55e' stopOpacity={0.25} />
            <stop offset='95%' stopColor='#22c55e' stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id='gradDespesas' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='5%'  stopColor='#cc0000' stopOpacity={0.3} />
            <stop offset='95%' stopColor='#cc0000' stopOpacity={0.02} />
          </linearGradient>
        </defs>

        <CartesianGrid vertical={false} stroke='#1e1e1e' strokeDasharray='4 4' />

        <XAxis
          dataKey='label'
          tick={{ fill: '#555', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => v === 0 ? '0' : `${(v / 1000).toFixed(0)}k`}
          tick={{ fill: '#444', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={36}
        />

        <Tooltip content={<Tip />} cursor={{ stroke: '#333', strokeWidth: 1 }} />

        <Area
          type='monotone'
          dataKey='receitas'
          stroke='#22c55e'
          strokeWidth={2}
          fill='url(#gradReceitas)'
          dot={false}
          activeDot={{ r: 4, fill: '#22c55e', stroke: '#111', strokeWidth: 2 }}
        />
        <Area
          type='monotone'
          dataKey='despesas'
          stroke='#cc0000'
          strokeWidth={2}
          fill='url(#gradDespesas)'
          dot={false}
          activeDot={{ r: 4, fill: '#cc0000', stroke: '#111', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
