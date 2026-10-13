'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { formatCurrency } from '@/lib/utils'

const CAT_LABEL: Record<string, string> = {
  INSTALACAO: 'Instalação', MENSALIDADE: 'Mensalidade', SERVICO: 'Serviço',
  EQUIPAMENTO: 'Equip.', SALARIO: 'Salário', FORNECEDOR: 'Fornecedor',
  ALUGUEL: 'Aluguel', OUTROS: 'Outros',
}

const CORES = ['#cc0000','#f59e0b','#3b82f6','#8b5cf6','#ec4899','#14b8a6','#fb923c','#6b7280']

function Tip({ active, payload }: { active?: boolean; payload?: { value: number; payload: { cor: string; labelFull: string } }[] }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '8px 12px', fontSize: '0.8rem' }}>
      <p style={{ margin: 0, color: payload[0].payload.cor, fontWeight: 700 }}>{payload[0].payload.labelFull}</p>
      <p style={{ margin: '2px 0 0', color: '#ccc' }}>{formatCurrency(payload[0].value)}</p>
    </div>
  )
}

export function GraficoDespesasCategoria({ dados }: { dados: Record<string, number> }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const data = Object.entries(dados)
    .sort((a, b) => b[1] - a[1])
    .map(([key, value], i) => ({
      label: CAT_LABEL[key] ?? key,
      labelFull: CAT_LABEL[key] ?? key,
      value,
      cor: CORES[i % CORES.length],
    }))

  if (data.length === 0) return <p style={{ color: '#555', textAlign: 'center', padding: '40px' }}>Sem despesas no período.</p>

  const fmt = (v: number) => v === 0 ? '0' : `${(v / 1000).toFixed(0)}k`

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
        <XAxis type="number" tickFormatter={fmt} tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="label" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} width={72} />
        <Tooltip content={<Tip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {data.map((d, i) => <Cell key={i} fill={d.cor} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
