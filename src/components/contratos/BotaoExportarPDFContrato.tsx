'use client'

import { useState } from 'react'
import { FileDown } from 'lucide-react'
import { buscarContratoParaPDF } from '@/app/(app)/contratos/actions'

type Props = { contratoId: string }

export function BotaoExportarPDFContrato({ contratoId }: Props) {
  const [loading, setLoading] = useState(false)
  const [erro,    setErro]    = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setErro(null)
    try {
      const res = await buscarContratoParaPDF(contratoId)
      if ('erro' in res) {
        setErro(res.erro)
        return
      }
      const { gerarContratoPDF } = await import('@/lib/pdf/gerarContratoPDF')
      await gerarContratoPDF(res.contrato)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao gerar PDF.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex items-center gap-2'>
      <button
        onClick={handleClick}
        disabled={loading}
        className='inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60'
      >
        <FileDown className='h-4 w-4' />
        {loading ? 'Gerando...' : 'Exportar Contrato PDF'}
      </button>
      {erro && (
        <span className='text-xs text-red-400'>{erro}</span>
      )}
    </div>
  )
}
