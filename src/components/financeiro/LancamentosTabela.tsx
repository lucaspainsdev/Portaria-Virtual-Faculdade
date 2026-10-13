'use client'

import { useState } from 'react'
import { Pencil, Trash2, X, AlertTriangle } from 'lucide-react'
import { excluirLancamento } from '@/app/(app)/financeiro/actions'
import { LancamentoForm } from './LancamentoForm'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { TipoLancamento, CategoriaLancamento, Lancamento } from '@prisma/client'

type LancamentoRow = Lancamento & { cliente: { id: string; nome: string } | null }
type ClienteOpt = { id: string; nome: string }

const CAT_LABEL: Record<CategoriaLancamento, string> = {
  INSTALACAO:  'Instalação',
  MENSALIDADE: 'Mensalidade',
  SERVICO:     'Serviço',
  EQUIPAMENTO: 'Equipamento',
  SALARIO:     'Salário',
  FORNECEDOR:  'Fornecedor',
  ALUGUEL:     'Aluguel',
  OUTROS:      'Outros',
}
const CAT_COR: Record<CategoriaLancamento, { cor: string; bg: string }> = {
  INSTALACAO:  { cor: '#60a5fa', bg: '#1e3a5f' },
  MENSALIDADE: { cor: '#a78bfa', bg: '#2e1065' },
  SERVICO:     { cor: '#34d399', bg: '#064e3b' },
  EQUIPAMENTO: { cor: '#fb923c', bg: '#431407' },
  SALARIO:     { cor: '#facc15', bg: '#422006' },
  FORNECEDOR:  { cor: '#94a3b8', bg: '#1e293b' },
  ALUGUEL:     { cor: '#f472b6', bg: '#500724' },
  OUTROS:      { cor: '#888',    bg: '#1a1a1a' },
}

function ConfirmarExcluir({ lancamento, onFechar, onExcluido }: {
  lancamento: LancamentoRow
  onFechar: () => void
  onExcluido: () => void
}) {
  const [pending, setPending] = useState(false)
  async function confirmar() {
    setPending(true)
    await excluirLancamento(lancamento.id)
    onExcluido()
    onFechar()
  }
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} onClick={onFechar} />
      <div style={{ position: 'relative', background: '#111', border: '1px solid #222', borderRadius: '10px', padding: '28px', maxWidth: '400px', width: '100%' }}>
        <button onClick={onFechar} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#555' }}><X size={16} /></button>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(204,0,0,0.15)', border: '1px solid rgba(204,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertTriangle size={18} style={{ color: '#cc0000' }} />
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-barlow-condensed),sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#f0f0f0', margin: '0 0 8px', textTransform: 'uppercase' }}>Excluir Lançamento</h3>
            <p style={{ fontSize: '0.875rem', color: '#888', lineHeight: 1.6, margin: 0 }}>
              Excluir <strong style={{ color: '#f0f0f0' }}>{lancamento.descricao}</strong> ({formatCurrency(lancamento.valor)})? Esta ação não pode ser desfeita.
            </p>
          </div>
        </div>
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

export function LancamentosTabela({ lancamentos: inicial, clientes }: { lancamentos: LancamentoRow[]; clientes: ClienteOpt[] }) {
  const [lancamentos, setLancamentos] = useState(inicial)
  const [filtroTipo, setFiltroTipo]   = useState<'TODOS' | TipoLancamento>('TODOS')
  const [filtroCat,  setFiltroCat]    = useState<CategoriaLancamento | 'TODAS'>('TODAS')
  const [editando,   setEditando]     = useState<LancamentoRow | null>(null)
  const [excluindo,  setExcluindo]    = useState<LancamentoRow | null>(null)

  const filtrados = lancamentos.filter((l) => {
    if (filtroTipo !== 'TODOS' && l.tipo !== filtroTipo) return false
    if (filtroCat  !== 'TODAS' && l.categoria !== filtroCat) return false
    return true
  })

  const btnFiltro = (ativo: boolean, cor?: string): React.CSSProperties => ({
    padding: '6px 14px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
    border: ativo ? `1px solid ${cor ?? '#cc0000'}44` : '1px solid #2a2a2a',
    background: ativo ? (cor ? `${cor}18` : 'rgba(204,0,0,0.1)') : '#1a1a1a',
    color: ativo ? (cor ?? '#cc0000') : '#555',
  })

  return (
    <div>
      {/* Filtros */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '4px', marginRight: '8px' }}>
          {(['TODOS', 'RECEITA', 'DESPESA'] as const).map((t) => (
            <button key={t} onClick={() => setFiltroTipo(t)} style={btnFiltro(filtroTipo === t, t === 'RECEITA' ? '#22c55e' : t === 'DESPESA' ? '#cc0000' : undefined)}>
              {t === 'TODOS' ? 'Todos' : t === 'RECEITA' ? '↑ Receitas' : '↓ Despesas'}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          <button onClick={() => setFiltroCat('TODAS')} style={btnFiltro(filtroCat === 'TODAS', '#888')}>Todas</button>
          {Object.entries(CAT_LABEL).map(([val, label]) => (
            <button key={val} onClick={() => setFiltroCat(val as CategoriaLancamento)} style={btnFiltro(filtroCat === val, CAT_COR[val as CategoriaLancamento].cor)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela */}
      <div style={{ background: '#111', border: '1px solid #222', borderRadius: '8px', overflow: 'hidden' }}>
        {filtrados.length === 0 ? (
          <p style={{ padding: '40px', textAlign: 'center', color: '#444', fontSize: '0.875rem' }}>
            Nenhum lançamento encontrado para os filtros selecionados.
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1e1e1e' }}>
                {['Data', 'Descrição', 'Categoria', 'Cliente', 'Valor', 'Ações'].map((h) => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.68rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((l) => {
                const cat = CAT_COR[l.categoria]
                const isReceita = l.tipo === 'RECEITA'
                return (
                  <tr key={l.id} style={{ borderBottom: '1px solid #181818' }}>
                    <td style={{ padding: '12px 16px', color: '#666', whiteSpace: 'nowrap' }}>{formatDate(l.data)}</td>
                    <td style={{ padding: '12px 16px', color: '#e0e0e0', maxWidth: '260px' }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.descricao}</div>
                      {l.observacoes && <div style={{ fontSize: '0.75rem', color: '#555', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.observacoes}</div>}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: cat.bg, border: `1px solid ${cat.cor}33`, borderRadius: '4px', padding: '2px 8px', fontSize: '0.72rem', color: cat.cor, fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {CAT_LABEL[l.categoria]}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#555', fontSize: '0.8rem' }}>
                      {l.cliente?.nome ?? '—'}
                    </td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontFamily: 'var(--font-barlow-condensed),sans-serif', fontWeight: 700, fontSize: '1rem', color: isReceita ? '#22c55e' : '#f87171' }}>
                        {isReceita ? '+' : '−'} {formatCurrency(l.valor)}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => setEditando(l)} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '4px', padding: '5px 8px', color: '#888', cursor: 'pointer', display: 'flex' }}>
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => setExcluindo(l)} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '4px', padding: '5px 8px', color: '#cc0000', cursor: 'pointer', display: 'flex' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {editando && (
        <LancamentoForm
          lancamentoEditar={editando}
          clientes={clientes}
          onFechar={() => setEditando(null)}
          onSalvo={() => setLancamentos((prev) => prev.map((l) => l.id === editando.id ? { ...l, ...editando } : l))}
        />
      )}
      {excluindo && (
        <ConfirmarExcluir
          lancamento={excluindo}
          onFechar={() => setExcluindo(null)}
          onExcluido={() => setLancamentos((prev) => prev.filter((l) => l.id !== excluindo.id))}
        />
      )}
    </div>
  )
}
