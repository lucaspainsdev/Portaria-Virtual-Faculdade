'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

function getSaudacao(): string {
  const h = new Date().getHours()
  if (h >= 5  && h < 12) return 'Bom dia'
  if (h >= 12 && h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function formatDataExtenso(d: Date): string {
  return d.toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

export function DashboardGreeting() {
  const [nome, setNome] = useState<string | null>(null)
  const hoje = formatDataExtenso(new Date())

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      const meta = session.user.user_metadata
      const n = meta?.full_name ?? meta?.name ?? session.user.email?.split('@')[0] ?? null
      setNome(n)
    })
  }, [])

  return (
    <div>
      <h1 style={{
        fontFamily: 'var(--font-barlow-condensed),sans-serif',
        fontWeight: 900, fontSize: '2rem', color: '#f0f0f0',
        margin: 0, letterSpacing: '0.03em',
      }}>
        {getSaudacao()}{nome ? `, ${nome}` : ''}
        <span style={{ color: '#cc0000' }}>.</span>
      </h1>
      <p style={{ fontSize: '0.85rem', color: '#555', margin: '4px 0 0', textTransform: 'capitalize' }}>
        {hoje}
      </p>
    </div>
  )
}
