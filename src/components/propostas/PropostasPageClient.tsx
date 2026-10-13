'use client'

import { useState, useMemo, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Eye, Copy, Trash2, Presentation, X, AlertTriangle } from 'lucide-react'
import { excluirProposta, duplicarProposta } from '@/app/(app)/propostas/actions'
import { formatCurrency } from '@/lib/utils'
import type { StatusProposta } from '@prisma/client'
import type { Cargo } from '@/lib/usuario'

type PropostaRow = {
  id: string
  numero: number
  status: StatusProposta
  totalGeral: unknown
  validadeDias: number
  createdAt: Date
  cliente: { id: string; nome: string }
  _count: { secoes: number; condicoes: number }
}

const STATUS_CFG: Record<StatusProposta, { label: string; cor: string; bg: string; borda: string }> = {
  RASCUNHO: { label: 'Rascunho', cor: '#888',    bg: '#1a1a1a', borda: '#333'       },
  ENVIADA:  { label: 'Enviada',  cor: '#60a5fa', bg: '#1e3a5f', borda: '#60a5fa33' },
  APROVADA: { label: 'Aprovada', cor: '#22c55e', bg: '#14532d', borda: '#22c55e33' },
  RECUSADA: { label: 'Recusada', cor: '#f87171', bg: '#450a0a', borda: '#cc000033' },
}

function formatNumero(n: number) {
  return `PROP-${String(n).padStart(3, '0')}`
}

function formatData(d: Date) {
  return new Date(d).toLocaleDateString('pt-BR')
}

// ── Modal de confirmação de exclusão ─────────────────────────────────────────

function ConfirmarExcluir({ proposta, onFechar, onExcluido }: {
  proposta: PropostaRow
  onFechar: () => void
  onExcluido: () => void
}) {
  const [pending, setPending] = useState(false)
  const [erro, setErro]       = useState('')

  async function confirmar() {
    setPending(true)
    const res = await excluirProposta(proposta.id)
    if (res && 'erro' in res && res.erro) { setErro(res.erro); setPending(false); return }
    onExcluido()
    onFechar()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }} onClick={() => !pending && onFechar()} />
      <div style={{ position: 'relative', background: '#111', border: '1px solid #333', borderRadius: '12px', padding: '28px', maxWidth: '420px', width: '100%' }}>
        <button onClick={onFechar} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#555', display: 'flex' }}><X size={16} /></button>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(204,0,0,0.12)', border: '1px solid rgba(204,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertTriangle size={18} style={{ color: '#cc0000' }} />
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-barlow-condensed),sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#f0f0f0', margin: '0 0 6px', textTransform: 'uppercase' }}>
              Excluir Proposta
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#888', lineHeight: 1.6, margin: 0 }}>
              Tem certeza que deseja excluir <strong style={{ color: '#f0f0f0' }}>{formatNumero(proposta.numero)}</strong>?
              Esta ação não pode ser desfeita.
            </p>
          </div>
        </div>
        {erro && (
          <div style={{ marginTop: '16px', background: '#450a0a', border: '1px solid #cc000044', borderRadius: '6px', padding: '10px 14px' }}>
            <span style={{ fontSize: '0.875rem', color: '#f87171' }}>{erro}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
          <button onClick={onFechar} style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', padding: '8px 20px', color: '#f0f0f0', fontSize: '0.875rem', cursor: 'pointer' }}>Cancelar</button>
          <button onClick={confirmar} disabled={pending} style={{ background: '#cc0000', border: 'none', borderRadius: '6px', padding: '8px 20px', color: '#fff', fontSize: '0.875rem', fontWeight: 700, cursor: pending ? 'not-allowed' : 'pointer', opacity: pending ? 0.6 : 1 }}>
            {pending ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

export function PropostasPageClient({ propostas: inicial, cargo }: { propostas: PropostaRow[]; cargo: Cargo }) {
  const podeEditar = cargo !== 'OPERADOR'
  const router = useRouter()
  const [dupPend, startDup] = useTransition()

  const [filtroStatus, setFiltroStatus] = useState<StatusProposta | 'TODOS'>('TODOS')
  const [excluindo, setExcluindo]       = useState<PropostaRow | null>(null)

  const filtradas = useMemo(() =>
    filtroStatus === 'TODOS' ? inicial : inicial.filter((p) => p.status === filtroStatus),
    [inicial, filtroStatus]
  )

  function handleDuplicar(p: PropostaRow) {
    startDup(async () => {
      await duplicarProposta(p.id)
      router.refresh()
    })
  }

  const btnFiltro = (ativo: boolean, cfg?: { cor: string; bg: string; borda: string }): React.CSSProperties => ({
    padding: '6px 14px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
    border:     ativo ? `1px solid ${cfg?.borda ?? '#cc000033'}` : '1px solid #2a2a2a',
    background: ativo ? (cfg?.bg ?? 'rgba(204,0,0,0.1)') : '#1a1a1a',
    color:      ativo ? (cfg?.cor ?? '#cc0000') : '#555',
    transition: 'all 0.12s',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '48px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontFamily: 'var(--font-barlow-condensed),sans-serif', fontWeight: 600, fontSize: '1.5rem', color: '#f0f0f0', margin: 0 }}>
              Propostas Comerciais
            </h1>
            <span style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '20px', padding: '3px 12px', fontSize: '0.78rem', color: '#888', fontWeight: 600 }}>
              {inicial.length} proposta{inicial.length !== 1 ? 's' : ''}
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#555', margin: '4px 0 0' }}>
            Propostas comerciais enviadas a clientes
          </p>
        </div>
        {podeEditar && (
          <Link
            href='/propostas/nova'
            style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: '#cc0000', border: '1px solid #aa000066', borderRadius: '6px', padding: '9px 18px', color: '#fff', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none', flexShrink: 0 }}
          >
            <Plus size={15} /> Nova Proposta
          </Link>
        )}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        <button onClick={() => setFiltroStatus('TODOS')} style={btnFiltro(filtroStatus === 'TODOS')}>
          Todas ({inicial.length})
        </button>
        {(Object.keys(STATUS_CFG) as StatusProposta[]).map((s) => {
          const cfg   = STATUS_CFG[s]
          const count = inicial.filter((p) => p.status === s).length
          return (
            <button key={s} onClick={() => setFiltroStatus(s)} style={btnFiltro(filtroStatus === s, cfg)}>
              {cfg.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Tabela */}
      <div style={{ background: '#111', border: '1px solid #222', borderRadius: '8px', overflow: 'hidden' }}>
        {filtradas.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px', textAlign: 'center' }}>
            <Presentation size={36} style={{ color: '#2a2a2a', marginBottom: '12px' }} />
            <p style={{ color: '#555', margin: 0 }}>
              Nenhuma proposta {filtroStatus !== 'TODOS' ? 'com este status' : 'criada ainda'}.
            </p>
            {podeEditar && filtroStatus === 'TODOS' && (
              <Link href='/propostas/nova' style={{ marginTop: '12px', fontSize: '0.85rem', color: '#cc0000', textDecoration: 'none' }}>
                Criar primeira proposta →
              </Link>
            )}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1e1e1e' }}>
                {['Número', 'Cliente', 'Data', 'Validade', 'Total', 'Status', 'Ações'].map((h) => (
                  <th key={h} style={{ padding: '11px 18px', textAlign: 'left', fontSize: '0.68rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtradas.map((p) => {
                const cfg = STATUS_CFG[p.status]
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid #181818' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ fontFamily: 'var(--font-barlow-condensed),sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#cc0000' }}>
                        {formatNumero(p.numero)}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 600, color: '#e0e0e0' }}>{p.cliente.nome}</td>
                    <td style={{ padding: '14px 18px', color: '#666', fontSize: '0.82rem' }}>{formatData(p.createdAt)}</td>
                    <td style={{ padding: '14px 18px', color: '#666', fontSize: '0.82rem' }}>{p.validadeDias}d</td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ fontFamily: 'var(--font-barlow-condensed),sans-serif', fontWeight: 700, fontSize: '1rem', color: '#cc0000' }}>
                        {formatCurrency(Number(p.totalGeral))}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ background: cfg.bg, border: `1px solid ${cfg.borda}`, borderRadius: '4px', padding: '2px 10px', fontSize: '0.72rem', color: cfg.cor, fontWeight: 700, textTransform: 'uppercase' }}>
                        {cfg.label}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <ABtn href={`/propostas/${p.id}`} title='Visualizar'><Eye size={13} /></ABtn>
                        {podeEditar && (
                          <>
                            <ABtn onClick={() => handleDuplicar(p)} title='Duplicar' disabled={dupPend}><Copy size={13} /></ABtn>
                            <ABtn onClick={() => setExcluindo(p)} title='Excluir' cor='#cc0000'><Trash2 size={13} /></ABtn>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {filtradas.length > 0 && (
        <p style={{ fontSize: '0.78rem', color: '#333', textAlign: 'right', margin: '-12px 0 0' }}>
          {filtradas.length} proposta{filtradas.length !== 1 ? 's' : ''} exibida{filtradas.length !== 1 ? 's' : ''}
        </p>
      )}

      {excluindo && (
        <ConfirmarExcluir
          proposta={excluindo}
          onFechar={() => setExcluindo(null)}
          onExcluido={() => { router.refresh(); setExcluindo(null) }}
        />
      )}
    </div>
  )
}

// ── Botão de ação ─────────────────────────────────────────────────────────────

function ABtn({ children, onClick, href, title, cor, disabled }: {
  children: React.ReactNode
  onClick?: () => void
  href?: string
  title: string
  cor?: string
  disabled?: boolean
}) {
  const [hover, setHover] = useState(false)
  const style: React.CSSProperties = {
    background:   hover ? (cor ? `${cor}18` : '#1e1e1e') : '#1a1a1a',
    border:       `1px solid ${hover ? (cor ?? '#444') + '55' : '#2a2a2a'}`,
    borderRadius: '5px', padding: '6px 8px',
    color:        hover ? (cor ?? '#e0e0e0') : (cor ?? '#666'),
    cursor:       disabled ? 'not-allowed' : 'pointer',
    display:      'flex', alignItems: 'center',
    opacity:      disabled ? 0.5 : 1,
    transition:   'all 0.12s',
    textDecoration: 'none',
  }
  if (href) {
    return (
      <Link href={href} title={title} style={style}
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        {children}
      </Link>
    )
  }
  return (
    <button onClick={onClick} title={title} disabled={disabled} style={style}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {children}
    </button>
  )
}
