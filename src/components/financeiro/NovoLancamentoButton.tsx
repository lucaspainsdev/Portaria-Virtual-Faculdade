'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { LancamentoForm } from './LancamentoForm'
import { useRouter } from 'next/navigation'

type ClienteOpt = { id: string; nome: string }

export function NovoLancamentoButton({ clientes }: { clientes: ClienteOpt[] }) {
  const [aberto, setAberto] = useState(false)
  const router = useRouter()

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '7px',
          background: '#cc0000', border: '1px solid #aa000066',
          borderRadius: '6px', padding: '9px 18px',
          color: '#fff', fontSize: '0.875rem', fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        <Plus size={15} /> Novo Lançamento
      </button>
      {aberto && (
        <LancamentoForm
          clientes={clientes}
          onFechar={() => setAberto(false)}
          onSalvo={() => router.refresh()}
        />
      )}
    </>
  )
}
