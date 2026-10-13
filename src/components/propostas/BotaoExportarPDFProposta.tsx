'use client'

import { useState } from 'react'
import { FileDown } from 'lucide-react'
import { buscarPropostaParaPDF } from '@/app/(app)/propostas/actions'
import { gerarPropostaPDF } from '@/lib/pdf/gerarPropostaPDF'

export function BotaoExportarPDFProposta({ propostaId }: { propostaId: string }) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const res = await buscarPropostaParaPDF(propostaId)
      if ('erro' in res) { alert(res.erro); return }
      await gerarPropostaPDF(res.proposta)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '7px',
        background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px',
        padding: '9px 18px', color: loading ? '#555' : '#aaa',
        fontSize: '0.875rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.12s',
      }}
    >
      <FileDown size={15} />
      {loading ? 'Gerando PDF...' : 'Baixar PDF'}
    </button>
  )
}
