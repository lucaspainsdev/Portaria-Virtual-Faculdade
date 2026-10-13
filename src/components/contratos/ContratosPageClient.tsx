'use client'

import { useState, useMemo, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Search, FileSignature, X, AlertTriangle, Pencil, ToggleLeft, ToggleRight } from 'lucide-react'
import { ContratoFormModal } from './ContratoFormModal'
import { atualizarStatusContrato, excluirContrato, listarClientesSelect } from '@/app/(app)/contratos/actions'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import type { Contrato, Cliente, StatusContrato } from '@prisma/client'
import type { Cargo } from '@/lib/usuario'

type ContratoRow = Contrato & { cliente: Pick<Cliente, 'id' | 'nome' | 'responsavel'> }
type ClienteOpt  = { id: string; nome: string }

const STATUS_CFG: Record<StatusContrato, { label: string; cor: string; bg: string; borda: string }> = {
  ATIVO:     { label: 'Ativo',     cor: '#22c55e', bg: '#14532d', borda: '#22c55e33' },
  SUSPENSO:  { label: 'Suspenso',  cor: '#fb923c', bg: '#431407', borda: '#fb923c33' },
  ENCERRADO: { label: 'Encerrado', cor: '#888',    bg: '#1a1a1a', borda: '#33333380' },
}

function progressoContrato(inicio: Date, fim: Date | null): number {
  if (!fim) return 0
  const total  = fim.getTime() - inicio.getTime()
  const decorrido = Date.now() - inicio.getTime()
  return Math.min(100, Math.max(0, Math.round((decorrido / total) * 100)))
}

function diasRestantes(fim: Date | null): number | null {
  if (!fim) return null
  return Math.ceil((fim.getTime() - Date.now()) / 86_400_000)
}

type Props = { contratos: ContratoRow[]; clientes: ClienteOpt[]; cargo: Cargo }

export function ContratosPageClient({ contratos, clientes, cargo }: Props) {
  const podeEditar = cargo !== 'OPERADOR'
  const router = useRouter()
  const [togPend, startToggle] = useTransition()

  const [busca,       setBusca]       = useState('')
  const [filtroStatus, setFiltroStatus] = useState<StatusContrato | 'TODOS'>('TODOS')
  const [modal,       setModal]       = useState<'novo' | ContratoRow | null>(null)
  const [excluindo,   setExcluindo]   = useState<ContratoRow | null>(null)
  const [excPend,     setExcPend]     = useState(false)

  const filtrados = useMemo(() => {
    return contratos.filter((c) => {
      const matchStatus = filtroStatus === 'TODOS' || c.status === filtroStatus
      const q = busca.toLowerCase()
      const matchBusca = !q ||
        c.numero.toLowerCase().includes(q) ||
        c.cliente.nome.toLowerCase().includes(q) ||
        c.descricao?.toLowerCase().includes(q)
      return matchStatus && matchBusca
    })
  }, [contratos, busca, filtroStatus])

  const totais = {
    ativos:    contratos.filter((c) => c.status === 'ATIVO').length,
    recorrente: contratos.filter((c) => c.status === 'ATIVO').reduce((s, c) => s + Number(c.valorMensal), 0),
  }

  async function handleToggle(c: ContratoRow) {
    const novoStatus: StatusContrato = c.status === 'ATIVO' ? 'SUSPENSO' : 'ATIVO'
    startToggle(async () => { await atualizarStatusContrato(c.id, novoStatus); router.refresh() })
  }

  async function handleExcluir() {
    if (!excluindo) return
    setExcPend(true)
    await excluirContrato(excluindo.id)
    setExcluindo(null); setExcPend(false); router.refresh()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '48px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading),sans-serif', fontWeight: 600, fontSize: '1.5rem', color: '#f0f0f0', margin: 0 }}>
            Contratos
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#666', margin: '4px 0 0' }}>
            <span style={{ color: '#f0f0f0', fontWeight: 600 }}>{totais.ativos}</span> ativos ·{' '}
            Receita recorrente: <span style={{ color: '#22c55e', fontWeight: 600 }}>{formatCurrency(totais.recorrente)}/mês</span>
          </p>
        </div>
        {podeEditar && (
          <button
            onClick={() => setModal('novo')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: '#cc0000', border: '1px solid rgba(204,0,0,0.4)', borderRadius: '8px', padding: '9px 18px', color: '#fff', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.04em' }}
          >
            <Plus size={15} /> Novo Contrato
          </button>
        )}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#555', pointerEvents: 'none' }} />
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder='Buscar por número, cliente ou descrição...'
            style={{ width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '9px 14px 9px 34px', color: '#f0f0f0', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {(['TODOS', 'ATIVO', 'SUSPENSO', 'ENCERRADO'] as const).map((s) => {
            const cfg = s !== 'TODOS' ? STATUS_CFG[s] : null
            const ativo = filtroStatus === s
            return (
              <button key={s} onClick={() => setFiltroStatus(s)}
                style={{ padding: '7px 14px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.12s',
                  background: ativo ? (cfg ? cfg.bg : 'rgba(204,0,0,0.1)') : '#1a1a1a',
                  border: `1px solid ${ativo ? (cfg ? cfg.borda : 'rgba(204,0,0,0.3)') : 'rgba(255,255,255,0.08)'}`,
                  color: ativo ? (cfg ? cfg.cor : '#cc0000') : '#666',
                }}>
                {s === 'TODOS' ? 'Todos' : STATUS_CFG[s].label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Lista */}
      {filtrados.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px', textAlign: 'center' }}>
          <FileSignature size={36} style={{ color: '#2a2a2a', marginBottom: '12px' }} />
          <p style={{ color: '#555', margin: 0 }}>Nenhum contrato encontrado.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtrados.map((c) => {
            const cfg    = STATUS_CFG[c.status]
            const progresso = progressoContrato(c.dataInicio, c.dataFim)
            const dias   = diasRestantes(c.dataFim)
            const vencendoEm30 = dias !== null && dias >= 0 && dias <= 30
            const vencido      = dias !== null && dias < 0

            return (
              <div key={c.id}
                style={{ background: '#111', border: `1px solid ${vencendoEm30 ? 'rgba(251,146,60,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '10px', padding: '18px 20px', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>

                {/* Info principal */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <Link href={`/contratos/${c.id}`} style={{ fontFamily: 'var(--font-heading),sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#cc0000', textDecoration: 'none' }}>
                      {c.numero}
                    </Link>
                    <span style={{ background: cfg.bg, border: `1px solid ${cfg.borda}`, borderRadius: '4px', padding: '2px 8px', fontSize: '0.68rem', color: cfg.cor, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>
                      {cfg.label}
                    </span>
                    {vencendoEm30 && !vencido && (
                      <span style={{ background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.3)', borderRadius: '4px', padding: '2px 8px', fontSize: '0.68rem', color: '#fb923c', fontWeight: 700 }}>
                        Vence em {dias}d
                      </span>
                    )}
                    {vencido && (
                      <span style={{ background: 'rgba(204,0,0,0.1)', border: '1px solid rgba(204,0,0,0.3)', borderRadius: '4px', padding: '2px 8px', fontSize: '0.68rem', color: '#f87171', fontWeight: 700 }}>
                        Vencido
                      </span>
                    )}
                  </div>

                  <p style={{ fontWeight: 600, color: '#e0e0e0', fontSize: '0.9rem', margin: '0 0 2px' }}>{c.cliente.nome}</p>
                  {c.descricao && <p style={{ fontSize: '0.8rem', color: '#666', margin: 0 }}>{c.descricao}</p>}

                  {/* Datas */}
                  <p style={{ fontSize: '0.75rem', color: '#555', margin: '6px 0 0' }}>
                    {formatDate(c.dataInicio)} → {c.dataFim ? formatDate(c.dataFim) : 'Indeterminado'}
                  </p>

                  {/* Barra de progresso */}
                  {c.dataFim && (
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', width: `${progresso}%`,
                          background: vencido ? '#cc0000' : vencendoEm30 ? 'linear-gradient(90deg,#cc0000,#fb923c)' : 'linear-gradient(90deg,#cc0000aa,#cc0000)',
                          borderRadius: '2px', transition: 'width 0.5s ease',
                        }} />
                      </div>
                      <p style={{ fontSize: '0.68rem', color: '#444', margin: '2px 0 0' }}>{progresso}% do período</p>
                    </div>
                  )}
                </div>

                {/* Valor + ações */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', shrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontFamily: 'var(--font-heading),sans-serif', fontWeight: 900, fontSize: '1.2rem', color: '#f0f0f0', margin: 0 }}>
                      {formatCurrency(c.valorMensal)}
                    </p>
                    <p style={{ fontSize: '0.7rem', color: '#555', margin: '1px 0 0' }}>por mês</p>
                  </div>
                  {podeEditar && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => setModal(c)} title='Editar'
                        style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '6px 8px', color: '#666', cursor: 'pointer', display: 'flex' }}>
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleToggle(c)} disabled={togPend} title={c.status === 'ATIVO' ? 'Suspender' : 'Ativar'}
                        style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '6px 8px', color: c.status === 'ATIVO' ? '#fb923c' : '#22c55e', cursor: 'pointer', display: 'flex', opacity: togPend ? 0.5 : 1 }}>
                        {c.status === 'ATIVO' ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                      </button>
                      <button onClick={() => setExcluindo(c)} title='Excluir'
                        style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '6px 8px', color: '#cc0000', cursor: 'pointer', display: 'flex' }}>
                        <X size={13} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal create/edit */}
      {modal && (
        <ContratoFormModal
          contrato={modal === 'novo' ? undefined : modal}
          clientes={clientes}
          onFechar={() => setModal(null)}
          onSalvo={() => { router.refresh(); setModal(null) }}
        />
      )}

      {/* Modal excluir */}
      {excluindo && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }} onClick={() => !excPend && setExcluindo(null)} />
          <div style={{ position: 'relative', background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '28px', maxWidth: '420px', width: '100%' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(204,0,0,0.12)', border: '1px solid rgba(204,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertTriangle size={18} style={{ color: '#cc0000' }} />
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading),sans-serif', fontWeight: 700, fontSize: '1.05rem', color: '#f0f0f0', margin: '0 0 8px', textTransform: 'uppercase' }}>Excluir Contrato</h3>
                <p style={{ fontSize: '0.875rem', color: '#888', lineHeight: 1.6, margin: 0 }}>
                  Excluir <strong style={{ color: '#f0f0f0' }}>{excluindo.numero}</strong> — {excluindo.cliente.nome}? Esta ação não pode ser desfeita.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
              <button onClick={() => setExcluindo(null)} style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '8px 20px', color: '#f0f0f0', fontSize: '0.875rem', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleExcluir} disabled={excPend} style={{ background: '#cc0000', border: 'none', borderRadius: '6px', padding: '8px 20px', color: '#fff', fontSize: '0.875rem', fontWeight: 700, cursor: excPend ? 'not-allowed' : 'pointer', opacity: excPend ? 0.6 : 1 }}>
                {excPend ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
