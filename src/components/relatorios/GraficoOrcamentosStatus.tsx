'use client'

import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const STATUS_CFG = [
  { key: 'APROVADO', label: 'Aprovado', cor: '#22c55e' },
  { key: 'ENVIADO',  label: 'Enviado',  cor: '#3b82f6' },
  { key: 'RASCUNHO', label: 'Rascunho', cor: '#666666' },
  { key: 'RECUSADO', label: 'Recusado', cor: '#cc0000' },
]

function Tip({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: { cor: string } }[] }) {
  if (!active || !payload?.length) return null
  const p = payload[0]
  return (
    <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '8px 12px', fontSize: '0.8rem' }}>
      <span style={{ color: p.payload.cor, fontWeight: 700 }}>{p.name}:</span>
      <span style={{ color: '#ccc', marginLeft: '6px' }}>{p.value} orçamento{p.value !== 1 ? 's' : ''}</span>
    </div>
  )
}

export function GraficoOrcamentosStatus({ dados }: { dados: Record<string, number> }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const total = Object.values(dados).reduce((s, v) => s + v, 0)
  const data  = STATUS_CFG.map((s) => ({ name: s.label, value: dados[s.key] ?? 0, cor: s.cor })).filter((d) => d.value > 0)

  if (total === 0) return <p style={{ color: '#555', textAlign: 'center', padding: '40px' }}>Sem dados.</p>

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
      <ResponsiveContainer width={180} height={180}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" stroke="none" startAngle={90} endAngle={-270}>
            {data.map((d, i) => <Cell key={i} fill={d.cor} />)}
          </Pie>
          <Tooltip content={<Tip />} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {data.map((d) => {
          const pct = Math.round((d.value / total) * 100)
          return (
            <div key={d.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: d.cor, display: 'block' }} />
                  <span style={{ fontSize: '0.82rem', color: '#ccc' }}>{d.name}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: '#555' }}>{d.value}</span>
                  <span style={{ fontSize: '0.72rem', color: d.cor, fontWeight: 700, minWidth: '32px', textAlign: 'right' }}>{pct}%</span>
                </div>
              </div>
              <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: d.cor, borderRadius: '2px', transition: 'width 0.6s ease' }} />
              </div>
            </div>
          )
        })}
        <p style={{ fontSize: '0.72rem', color: '#444', margin: '4px 0 0' }}>{total} total</p>
      </div>
    </div>
  )
}
