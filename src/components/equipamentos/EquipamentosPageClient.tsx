'use client'

import { useState, useMemo, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Package, X, AlertTriangle, Percent } from 'lucide-react'
import { EquipamentoFormModal } from './EquipamentoFormModal'
import { toggleAtivoEquipamento, excluirEquipamento, definirMargemEmMassa } from '@/app/(app)/equipamentos/actions'
import { formatCurrency } from '@/lib/utils'
import type { CategoriaEquipamento, Equipamento } from '@prisma/client'
import type { Cargo } from '@/lib/usuario'

type EqRow = Equipamento & {
  _count: { itensOrcamento: number }
  precoFornecedor?: number | null
  margem?: number | null
}

// ─── Config de categorias ────────────────────────────────────────────────────

type CatConfig = { label: string; cor: string; bg: string; borda: string }

const CAT: Record<CategoriaEquipamento, CatConfig> = {
  CFTV:           { label: 'CFTV',          cor: '#60a5fa', bg: '#1e3a5f', borda: '#60a5fa33' },
  ACESSO:         { label: 'Acesso',        cor: '#4ade80', bg: '#14532d', borda: '#4ade8033' },
  COMUNICACAO:    { label: 'Comunicação',   cor: '#facc15', bg: '#422006', borda: '#facc1533' },
  INFRAESTRUTURA: { label: 'Infraestrutura',cor: '#a78bfa', bg: '#2e1065', borda: '#a78bfa33' },
}


// ─── Modal de confirmação de exclusão ────────────────────────────────────────

function ConfirmarExcluir({ eq, onFechar, onExcluido }: { eq: EqRow; onFechar: () => void; onExcluido: () => void }) {
  const [pending, setPending]   = useState(false)
  const [erroMsg, setErroMsg]   = useState('')

  async function confirmar() {
    setPending(true)
    const res = await excluirEquipamento(eq.id)
    if (res && 'erro' in res && res.erro) { setErroMsg(res.erro); setPending(false); return }
    onExcluido()
    onFechar()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }} onClick={() => !pending && onFechar()} />
      <div style={{ position: 'relative', background: '#111', border: '1px solid #333', borderRadius: '12px', padding: '28px', maxWidth: '420px', width: '100%', boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}>
        <button onClick={onFechar} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#555', display: 'flex' }}>
          <X size={16} />
        </button>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(204,0,0,0.12)', border: '1px solid rgba(204,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertTriangle size={18} style={{ color: '#cc0000' }} />
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-barlow-condensed),sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#f0f0f0', margin: '0 0 8px', textTransform: 'uppercase' }}>
              Excluir Equipamento
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#888', lineHeight: 1.6, margin: 0 }}>
              Tem certeza que deseja excluir <strong style={{ color: '#f0f0f0' }}>{eq.nome}</strong>?
              {eq._count.itensOrcamento > 0 && (
                <span style={{ display: 'block', marginTop: '6px', color: '#f87171' }}>
                  Este equipamento aparece em {eq._count.itensOrcamento} orçamento(s) e não pode ser excluído.
                </span>
              )}
            </p>
          </div>
        </div>
        {erroMsg && (
          <div style={{ marginTop: '16px', background: '#450a0a', border: '1px solid #cc000044', borderRadius: '6px', padding: '10px 14px' }}>
            <span style={{ fontSize: '0.875rem', color: '#f87171' }}>{erroMsg}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
          <button onClick={onFechar} style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', padding: '8px 20px', color: '#f0f0f0', fontSize: '0.875rem', cursor: 'pointer' }}>
            Cancelar
          </button>
          <button
            onClick={confirmar}
            disabled={pending || eq._count.itensOrcamento > 0}
            style={{ background: '#cc0000', border: 'none', borderRadius: '6px', padding: '8px 20px', color: '#fff', fontSize: '0.875rem', fontWeight: 700, cursor: (pending || eq._count.itensOrcamento > 0) ? 'not-allowed' : 'pointer', opacity: (pending || eq._count.itensOrcamento > 0) ? 0.5 : 1 }}
          >
            {pending ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Componente principal ────────────────────────────────────────────────────

export function EquipamentosPageClient({ equipamentos: inicial, cargo }: { equipamentos: EqRow[]; cargo: Cargo }) {
  const podeEditar = cargo !== 'OPERADOR'
  const router    = useRouter()
  const [togPend, startToggle]   = useTransition()
  const [massaPend, startMassa]  = useTransition()

  const equipamentos = inicial
  const [filtroCateg,  setFiltroCateg]  = useState<CategoriaEquipamento | 'TODOS'>('TODOS')
  const [modal,        setModal]        = useState<'novo' | EqRow | null>(null)
  const [excluindo,    setExcluindo]    = useState<EqRow | null>(null)

  // Modal de margem em massa
  const [modalMassa,   setModalMassa]   = useState(false)
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set())
  const [margemMassa,  setMargemMassa]  = useState('30')
  const [erroMassa,    setErroMassa]    = useState('')
  const [okMassa,      setOkMassa]      = useState('')

  function toggleSelecao(id: string) {
    setSelecionados((prev) => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  function selecionarTodos(lista: EqRow[]) {
    setSelecionados(new Set(lista.map((e) => e.id)))
  }

  function aplicarMargem() {
    const m = parseFloat(margemMassa)
    if (isNaN(m) || m < 0 || m > 200) { setErroMassa('Margem deve ser entre 0 e 200.'); return }
    if (selecionados.size === 0) { setErroMassa('Selecione ao menos um equipamento.'); return }
    setErroMassa('')
    startMassa(async () => {
      const res = await definirMargemEmMassa([...selecionados], m)
      if ('erro' in res && res.erro) { setErroMassa(res.erro); return }
      setOkMassa(`${(res as { atualizados: number }).atualizados} equipamento(s) atualizados com margem de ${m}%.`)
      router.refresh()
      setSelecionados(new Set())
    })
  }

  const filtrados = useMemo(() =>
    filtroCateg === 'TODOS' ? equipamentos : equipamentos.filter((e) => e.categoria === filtroCateg),
    [equipamentos, filtroCateg]
  )

  const totalAtivos = equipamentos.filter((e) => e.ativo).length

  function handleToggle(eq: EqRow) {
    startToggle(async () => {
      await toggleAtivoEquipamento(eq.id, !eq.ativo)
      router.refresh()
    })
  }

  // ── Filtro btn style ──
  const btnFiltro = (ativo: boolean, cfg?: CatConfig): React.CSSProperties => ({
    padding: '6px 14px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
    border:      ativo ? `1px solid ${cfg?.borda ?? '#cc000033'}` : '1px solid #2a2a2a',
    background:  ativo ? (cfg?.bg ?? 'rgba(204,0,0,0.1)') : '#1a1a1a',
    color:       ativo ? (cfg?.cor ?? '#cc0000') : '#555',
    transition:  'all 0.12s',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '48px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontFamily: 'var(--font-barlow-condensed),sans-serif', fontWeight: 600, fontSize: '1.5rem', color: '#f0f0f0', margin: 0 }}>
              Catálogo de Equipamentos
            </h1>
            <span style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '20px', padding: '3px 12px', fontSize: '0.78rem', color: '#888', fontWeight: 600, whiteSpace: 'nowrap' }}>
              {totalAtivos} ativo{totalAtivos !== 1 ? 's' : ''}
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#555', margin: '4px 0 0' }}>
            Itens disponíveis para inclusão em orçamentos
          </p>
        </div>
        {podeEditar && (
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>

            <button
              onClick={() => { setModalMassa(true); setOkMassa(''); setErroMassa('') }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', padding: '9px 18px', color: '#aaa', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
            >
              <Percent size={15} /> Margem em massa
            </button>
<button
              onClick={() => setModal('novo')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: '#cc0000', border: '1px solid #aa000066', borderRadius: '6px', padding: '9px 18px', color: '#fff', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
            >
              <Plus size={15} /> Novo Equipamento
            </button>
          </div>
        )}
      </div>

      {/* ── Filtros de categoria ── */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        <button onClick={() => setFiltroCateg('TODOS')} style={btnFiltro(filtroCateg === 'TODOS')}>
          Todos ({equipamentos.length})
        </button>
        {(Object.keys(CAT) as CategoriaEquipamento[]).map((cat) => {
          const cfg   = CAT[cat]
          const count = equipamentos.filter((e) => e.categoria === cat).length
          return (
            <button key={cat} onClick={() => setFiltroCateg(cat)} style={btnFiltro(filtroCateg === cat, cfg)}>
              {cfg.label} ({count})
            </button>
          )
        })}
      </div>

      {/* ── Tabela ── */}
      <div style={{ background: '#111', border: '1px solid #222', borderRadius: '8px', overflow: 'hidden' }}>
        {filtrados.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px', textAlign: 'center' }}>
            <Package size={36} style={{ color: '#2a2a2a', marginBottom: '12px' }} />
            <p style={{ color: '#555', margin: 0 }}>Nenhum equipamento {filtroCateg !== 'TODOS' ? 'nesta categoria' : 'cadastrado'}.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1e1e1e' }}>
                {['Código', 'Nome', 'Categoria', 'Unidade', 'Fornecedor', 'Margem', 'Preço Final', 'Uso', 'Status', 'Ações'].map((h) => (
                  <th key={h} style={{ padding: '11px 18px', textAlign: 'left', fontSize: '0.68rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((eq) => {
                const cfg = CAT[eq.categoria]
                return (
                  <tr
                    key={eq.id}
                    style={{ borderBottom: '1px solid #181818', opacity: eq.ativo ? 1 : 0.5, transition: 'opacity 0.15s' }}
                  >
                    {/* Código */}
                    <td style={{ padding: '14px 18px' }}>
                      {eq.codigo
                        ? <span style={{ fontFamily: "'Barlow', sans-serif", fontVariantNumeric: 'tabular-nums', fontSize: '0.9rem', color: '#ffffff' }}>{eq.codigo}</span>
                        : <span style={{ color: '#333' }}>—</span>
                      }
                    </td>

                    {/* Nome */}
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600, color: '#e0e0e0' }}>{eq.nome}</div>
                      {eq.descricao && (
                        <div style={{ fontSize: '0.75rem', color: '#555', marginTop: '2px', maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {eq.descricao}
                        </div>
                      )}
                    </td>

                    {/* Categoria badge */}
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ background: cfg.bg, border: `1px solid ${cfg.borda}`, borderRadius: '5px', padding: '3px 10px', fontSize: '0.72rem', color: cfg.cor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                        {cfg.label}
                      </span>
                    </td>

                    {/* Unidade */}
                    <td style={{ padding: '14px 18px', color: '#666', fontSize: '0.82rem' }}>{eq.unidade}</td>

                    {/* Preço Fornecedor */}
                    <td style={{ padding: '14px 18px', color: '#666', fontSize: '0.85rem' }}>
                      {eq.precoFornecedor
                        ? formatCurrency(eq.precoFornecedor)
                        : <span style={{ color: '#333' }}>—</span>}
                    </td>

                    {/* Margem */}
                    <td style={{ padding: '14px 18px', color: '#888', fontSize: '0.85rem' }}>
                      {eq.margem != null
                        ? <span style={{ color: '#facc15', fontWeight: 700 }}>{eq.margem}%</span>
                        : <span style={{ color: '#333' }}>—</span>}
                    </td>

                    {/* Preço Final */}
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ fontFamily: 'var(--font-barlow-condensed),sans-serif', fontWeight: 700, fontSize: '1rem', color: '#cc0000' }}>
                        {formatCurrency(eq.precoBase)}
                      </span>
                    </td>

                    {/* Uso em orçamentos */}
                    <td style={{ padding: '14px 18px', color: '#555', fontSize: '0.8rem' }}>
                      {eq._count.itensOrcamento > 0
                        ? <span style={{ color: '#888' }}>{eq._count.itensOrcamento}×</span>
                        : <span style={{ color: '#333' }}>—</span>
                      }
                    </td>

                    {/* Status */}
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ background: eq.ativo ? '#14532d' : '#1a1a1a', border: `1px solid ${eq.ativo ? '#22c55e33' : '#2a2a2a'}`, borderRadius: '4px', padding: '2px 10px', fontSize: '0.72rem', color: eq.ativo ? '#22c55e' : '#555', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {eq.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>

                    {/* Ações */}
                    <td style={{ padding: '14px 18px' }}>
                      {podeEditar && (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          {/* Editar */}
                          <ActionBtn onClick={() => setModal(eq)} title='Editar'>
                            <Pencil size={13} />
                          </ActionBtn>

                          {/* Toggle ativo */}
                          <ActionBtn
                            onClick={() => handleToggle(eq)}
                            title={eq.ativo ? 'Desativar' : 'Ativar'}
                            cor={eq.ativo ? '#facc15' : '#22c55e'}
                            disabled={togPend}
                          >
                            {eq.ativo ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                          </ActionBtn>

                          {/* Excluir */}
                          <ActionBtn onClick={() => setExcluindo(eq)} title='Excluir' cor='#cc0000'>
                            <Trash2 size={13} />
                          </ActionBtn>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Rodapé informativo ── */}
      {filtrados.length > 0 && (
        <p style={{ fontSize: '0.78rem', color: '#333', textAlign: 'right', margin: '-12px 0 0' }}>
          {filtrados.length} equipamento{filtrados.length !== 1 ? 's' : ''} exibido{filtrados.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* ── Modal: Margem em massa ── */}
      {modalMassa && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }} onClick={() => setModalMassa(false)} />
          <div style={{ position: 'relative', background: '#111', border: '1px solid #333', borderRadius: '12px', width: '100%', maxWidth: '640px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #222' }}>
              <h2 style={{ fontFamily: 'var(--font-barlow-condensed),sans-serif', fontWeight: 600, fontSize: '1.1rem', color: '#f0f0f0', margin: 0 }}>
                Definir Margem em Massa
              </h2>
              <button onClick={() => setModalMassa(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', display: 'flex' }}>
                <X size={18} />
              </button>
            </div>

            {/* Margem input */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #1a1a1a' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Margem de Lucro (%)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type='number' min='0' max='200' step='0.5'
                      value={margemMassa}
                      onChange={(e) => setMargemMassa(e.target.value)}
                      style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', padding: '8px 12px', color: '#f0f0f0', fontSize: '0.875rem', width: '100px', outline: 'none' }}
                    />
                    <span style={{ color: '#facc15', fontWeight: 700, fontSize: '1rem' }}>%</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => selecionarTodos(filtrados)}
                    style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', padding: '8px 14px', color: '#aaa', fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    Selecionar todos ({filtrados.length})
                  </button>
                  <button
                    onClick={() => setSelecionados(new Set())}
                    style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', padding: '8px 14px', color: '#666', fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    Limpar seleção
                  </button>
                </div>
              </div>
              {selecionados.size > 0 && (
                <p style={{ fontSize: '0.78rem', color: '#888', margin: '8px 0 0' }}>
                  {selecionados.size} equipamento{selecionados.size !== 1 ? 's' : ''} selecionado{selecionados.size !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Lista de equipamentos */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <tbody>
                  {filtrados.map((eq) => {
                    const sel = selecionados.has(eq.id)
                    const precoAtual = Number(eq.precoBase)
                    const fornecedor = eq.precoFornecedor ?? precoAtual
                    const mg = parseFloat(margemMassa) || 0
                    const previewFinal = mg > 0 ? fornecedor * (1 + mg / 100) : fornecedor
                    return (
                      <tr
                        key={eq.id}
                        onClick={() => toggleSelecao(eq.id)}
                        style={{ borderBottom: '1px solid #181818', cursor: 'pointer', background: sel ? 'rgba(204,0,0,0.06)' : 'transparent', transition: 'background 0.1s' }}
                      >
                        <td style={{ padding: '10px 16px', width: '36px' }}>
                          <div style={{
                            width: '16px', height: '16px', borderRadius: '4px',
                            border: `2px solid ${sel ? '#cc0000' : '#333'}`,
                            background: sel ? '#cc0000' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {sel && <span style={{ color: '#fff', fontSize: '10px', lineHeight: 1 }}>✓</span>}
                          </div>
                        </td>
                        <td style={{ padding: '10px 8px' }}>
                          <div style={{ fontWeight: 600, color: '#e0e0e0', fontSize: '0.82rem' }}>{eq.nome}</div>
                          {eq.codigo && <div style={{ fontSize: '0.72rem', color: '#555' }}>{eq.codigo}</div>}
                        </td>
                        <td style={{ padding: '10px 8px', color: '#555', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                          Forn: {fornecedor > 0 ? formatCurrency(fornecedor) : '—'}
                        </td>
                        <td style={{ padding: '10px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <span style={{ color: '#555', fontSize: '0.75rem' }}>{formatCurrency(precoAtual)}</span>
                          {sel && mg > 0 && (
                            <>
                              <span style={{ color: '#333', margin: '0 4px' }}>→</span>
                              <span style={{ color: '#22c55e', fontWeight: 700, fontSize: '0.82rem' }}>{formatCurrency(previewFinal)}</span>
                            </>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #222', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
              <div>
                {erroMassa && <p style={{ fontSize: '0.8rem', color: '#f87171', margin: 0 }}>{erroMassa}</p>}
                {okMassa   && <p style={{ fontSize: '0.8rem', color: '#22c55e', margin: 0 }}>{okMassa}</p>}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setModalMassa(false)} style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', padding: '9px 20px', color: '#aaa', fontSize: '0.875rem', cursor: 'pointer' }}>
                  Fechar
                </button>
                <button
                  onClick={aplicarMargem}
                  disabled={massaPend || selecionados.size === 0}
                  style={{ background: '#cc0000', border: 'none', borderRadius: '6px', padding: '9px 24px', color: '#fff', fontSize: '0.875rem', fontWeight: 700, cursor: (massaPend || selecionados.size === 0) ? 'not-allowed' : 'pointer', opacity: (massaPend || selecionados.size === 0) ? 0.55 : 1 }}
                >
                  {massaPend ? 'Aplicando...' : `Aplicar ${margemMassa}% em ${selecionados.size} item${selecionados.size !== 1 ? 's' : ''}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modais ── */}
      {modal && (
        <EquipamentoFormModal
          equipamento={modal === 'novo' ? undefined : modal}
          onFechar={() => setModal(null)}
          onSalvo={() => { router.refresh(); setModal(null) }}
        />
      )}
      {excluindo && (
        <ConfirmarExcluir
          eq={excluindo}
          onFechar={() => setExcluindo(null)}
          onExcluido={() => { router.refresh(); setExcluindo(null) }}
        />
      )}
    </div>
  )
}

// ─── Botão de ação reutilizável ───────────────────────────────────────────────

function ActionBtn({ children, onClick, title, cor, disabled }: {
  children: React.ReactNode
  onClick: () => void
  title: string
  cor?: string
  disabled?: boolean
}) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? (cor ? `${cor}18` : '#1e1e1e') : '#1a1a1a',
        border: `1px solid ${hover ? (cor ?? '#444') + '55' : '#2a2a2a'}`,
        borderRadius: '5px', padding: '6px 8px',
        color: hover ? (cor ?? '#e0e0e0') : (cor ?? '#666'),
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.12s',
      }}
    >
      {children}
    </button>
  )
}
