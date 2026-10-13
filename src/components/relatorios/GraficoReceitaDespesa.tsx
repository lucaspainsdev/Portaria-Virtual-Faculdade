'use client'

import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

type Ponto = { label: string; receitas: number; despesas: number; saldo: number }

function Tip({ active, payload, label }: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px 14px', fontSize: '0.8rem' }}>
      <p style={{ color: '#888', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ margin: '2px 0', color: p.color, fontWeight: 600 }}>
          {p.name === 'receitas' ? '↑ Receitas' : p.name === 'despesas' ? '↓ Despesas' : '= Saldo'}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  )
}

export function GraficoReceitaDespesa({ dados }: { dados: Ponto[] }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const fmt = (v: number) => `${(v / 1000).toFixed(0)}k`

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={dados} barCategoryGap="30%" barGap={3} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
        <XAxis dataKey="label" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={fmt} tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
        <Tooltip content={<Tip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Legend formatter={(v) => <span style={{ color: '#888', fontSize: '0.78rem' }}>{v === 'receitas' ? 'Receitas' : v === 'despesas' ? 'Despesas' : 'Saldo'}</span>} />
        <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
        <Bar dataKey="receitas" fill="#22c55e" radius={[3, 3, 0, 0]} />
        <Bar dataKey="despesas" fill="#cc0000"  radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
