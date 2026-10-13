'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { atualizarStatusProposta } from '@/app/(app)/propostas/actions'
import type { StatusProposta } from '@prisma/client'

const STATUS_OPCOES: { value: StatusProposta; label: string }[] = [
  { value: 'RASCUNHO', label: 'Rascunho' },
  { value: 'ENVIADA',  label: 'Enviada'  },
  { value: 'APROVADA', label: 'Aprovada' },
  { value: 'RECUSADA', label: 'Recusada' },
]

export function BotaoStatusProposta({ propostaId, statusAtual }: { propostaId: string; statusAtual: StatusProposta }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [aberto, setAberto] = useState(false)

  function mudar(status: StatusProposta) {
    setAberto(false)
    if (status === statusAtual) return
    startTransition(async () => {
      await atualizarStatusProposta(propostaId, status)
      router.refresh()
    })
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setAberto((v) => !v)}
        disabled={pending}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px',
          padding: '9px 14px', color: pending ? '#555' : '#aaa',
          fontSize: '0.875rem', fontWeight: 600, cursor: pending ? 'not-allowed' : 'pointer',
        }}
      >
        {pending ? 'Atualizando...' : 'Alterar Status'}
        <ChevronDown size={14} />
      </button>

      {aberto && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setAberto(false)} />
          <div style={{
            position: 'absolute', top: '100%', right: 0, marginTop: '4px',
            background: '#111', border: '1px solid #333', borderRadius: '8px',
            padding: '6px', zIndex: 50, minWidth: '160px',
            boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
          }}>
            {STATUS_OPCOES.map((op) => (
              <button
                key={op.value}
                onClick={() => mudar(op.value)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '8px 12px', background: op.value === statusAtual ? '#1a1a1a' : 'none',
                  border: 'none', borderRadius: '5px',
                  color: op.value === statusAtual ? '#cc0000' : '#888',
                  fontSize: '0.875rem', fontWeight: op.value === statusAtual ? 700 : 400,
                  cursor: 'pointer',
                }}
              >
                {op.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
