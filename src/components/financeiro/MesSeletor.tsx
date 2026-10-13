'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

export function MesSeletor({ mes, ano }: { mes: number; ano: number }) {
  const router      = useRouter()
  const pathname    = usePathname()
  const searchParams = useSearchParams()

  function navegar(novoMes: number, novoAno: number) {
    const p = new URLSearchParams(searchParams.toString())
    p.set('mes', String(novoMes))
    p.set('ano', String(novoAno))
    router.push(`${pathname}?${p.toString()}`)
  }

  function anterior() {
    if (mes === 1) navegar(12, ano - 1)
    else navegar(mes - 1, ano)
  }

  function proximo() {
    const agora = new Date()
    if (ano > agora.getFullYear() || (ano === agora.getFullYear() && mes >= agora.getMonth() + 1)) return
    if (mes === 12) navegar(1, ano + 1)
    else navegar(mes + 1, ano)
  }

  const isFuturo = (() => {
    const agora = new Date()
    return ano > agora.getFullYear() || (ano === agora.getFullYear() && mes >= agora.getMonth() + 1)
  })()

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <button onClick={anterior} style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', padding: '6px 8px', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
        <ChevronLeft size={16} />
      </button>
      <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', padding: '6px 16px', minWidth: '160px', textAlign: 'center' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f0f0f0' }}>
          {MESES[mes - 1]} {ano}
        </span>
      </div>
      <button
        onClick={proximo}
        disabled={isFuturo}
        style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', padding: '6px 8px', color: isFuturo ? '#333' : '#888', cursor: isFuturo ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
