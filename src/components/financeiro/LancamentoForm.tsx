'use client'

import { useState, useTransition } from 'react'
import { X } from 'lucide-react'
import { criarLancamento, atualizarLancamento, type LancamentoFormData } from '@/app/(app)/financeiro/actions'
import { toDateInput } from '@/lib/utils'
import type { TipoLancamento, CategoriaLancamento, Lancamento } from '@prisma/client'

// ─── Categorias por tipo ────────────────────────────────────────────────────

const CATS_RECEITA: { value: CategoriaLancamento; label: string }[] = [
  { value: 'INSTALACAO',  label: 'Instalação'  },
  { value: 'MENSALIDADE', label: 'Mensalidade' },
  { value: 'SERVICO',     label: 'Serviço'     },
  { value: 'OUTROS',      label: 'Outro'       },
]

const CATS_DESPESA: { value: CategoriaLancamento; label: string }[] = [
  { value: 'EQUIPAMENTO', label: 'Equipamento' },
  { value: 'SALARIO',     label: 'Salário'     },
  { value: 'FORNECEDOR',  label: 'Fornecedor'  },
  { value: 'ALUGUEL',     label: 'Aluguel'     },
  { value: 'OUTROS',      label: 'Outro'       },
]

const DEFAULT_CAT: Record<TipoLancamento, CategoriaLancamento> = {
  RECEITA: 'MENSALIDADE',
  DESPESA: 'FORNECEDOR',
}

// ─── Tipos ──────────────────────────────────────────────────────────────────

type ClienteOpt = { id: string; nome: string }

type Props = {
  onFechar: () => void
  onSalvo: () => void
  clientes: ClienteOpt[]
  lancamentoEditar?: Lancamento & { cliente?: { id: string; nome: string } | null }
}

// ─── Componente ─────────────────────────────────────────────────────────────

export function LancamentoForm({ onFechar, onSalvo, clientes, lancamentoEditar }: Props) {
  const [pending, startTransition] = useTransition()
  const [erros, setErros] = useState<Partial<Record<string, string>>>({})

  const [tipo,      setTipo]      = useState<TipoLancamento>(lancamentoEditar?.tipo ?? 'RECEITA')
  const [categoria, setCategoria] = useState<CategoriaLancamento>(
    lancamentoEditar?.categoria ?? DEFAULT_CAT['RECEITA']
  )
  const [descricao, setDescricao] = useState(lancamentoEditar?.descricao ?? '')
  const [valor,     setValor]     = useState(lancamentoEditar ? String(Number(lancamentoEditar.valor)) : '')
  const [data,      setData]      = useState(lancamentoEditar ? toDateInput(lancamentoEditar.data) : toDateInput(new Date()))
  const [clienteId, setClienteId] = useState(lancamentoEditar?.clienteId ?? '')
  const [obs,       setObs]       = useState(lancamentoEditar?.observacoes ?? '')

  const isReceita = tipo === 'RECEITA'
  const cats      = isReceita ? CATS_RECEITA : CATS_DESPESA
  const corTipo   = isReceita ? '#22c55e' : '#cc0000'
  const corSave   = isReceita ? '#16a34a' : '#cc0000'

  // Ao trocar tipo, redefine para categoria padrão do novo tipo
  function handleTipo(novoTipo: TipoLancamento) {
    setTipo(novoTipo)
    setCategoria(DEFAULT_CAT[novoTipo])
    setErros({})
  }

  function validate(): boolean {
    const e: typeof erros = {}
    if (!descricao.trim())              e.descricao = 'Informe a descrição.'
    if (!valor || parseFloat(valor) <= 0) e.valor   = 'Valor deve ser maior que zero.'
    if (!data)                          e.data      = 'Informe a data.'
    setErros(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    const fd: LancamentoFormData = {
      tipo,
      categoria,
      descricao: descricao.trim(),
      valor: parseFloat(valor),
      data,
      clienteId: clienteId || undefined,
      observacoes: obs.trim() || undefined,
    }

    startTransition(async () => {
      const res = lancamentoEditar
        ? await atualizarLancamento(lancamentoEditar.id, fd)
        : await criarLancamento(fd)

      if (res && 'erro' in res && res.erro) {
        setErros({ geral: res.erro })
        return
      }
      onSalvo()
      onFechar()
    })
  }

  // ─── Estilos reutilizáveis ─────────────────────────────────────────────

  const input: React.CSSProperties = {
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '6px',
    padding: '9px 12px',
    color: '#f0f0f0',
    fontSize: '0.875rem',
    width: '100%',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const inputErr = (campo: string): React.CSSProperties =>
    erros[campo] ? { ...input, border: '1px solid #cc0000' } : input

  const label: React.CSSProperties = {
    fontSize: '0.78rem',
    color: '#999',
    fontWeight: 500,
    marginBottom: '4px',
    display: 'block',
  }

  const field: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  }

  return (
    // ── Overlay ──
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}
        onClick={onFechar}
      />

      {/* ── Modal ── */}
      <div style={{
        position: 'relative',
        background: '#111111',
        border: '1px solid #333333',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '540px',
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #222' }}>
          <h2 style={{
            fontFamily: 'var(--font-barlow-condensed),sans-serif',
            fontWeight: 700, fontSize: '1.15rem', color: '#f0f0f0',
            margin: 0, letterSpacing: '0.02em',
          }}>
            {lancamentoEditar ? 'Editar Lançamento' : 'Novo Lançamento'}
          </h2>
          <button
            onClick={onFechar}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: '4px', display: 'flex', borderRadius: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* ── Toggle Receita / Despesa ── */}
          <div>
            <span style={{ ...label, marginBottom: '8px' }}>Tipo *</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {(['RECEITA', 'DESPESA'] as TipoLancamento[]).map((t) => {
                const ativo = tipo === t
                const cor   = t === 'RECEITA' ? '#22c55e' : '#cc0000'
                const bg    = t === 'RECEITA' ? '#14532d' : '#450a0a'
                return (
                  <button
                    key={t}
                    type='button'
                    onClick={() => handleTipo(t)}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      background:   ativo ? bg      : '#1a1a1a',
                      border:       ativo ? `1.5px solid ${cor}55` : '1.5px solid #2a2a2a',
                      color:        ativo ? cor      : '#555',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {t === 'RECEITA' ? '↑  Receita' : '↓  Despesa'}
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── Descrição ── */}
          <div style={field}>
            <label style={label}>Descrição *</label>
            <input
              value={descricao}
              onChange={(e) => { setDescricao(e.target.value); setErros((p) => ({ ...p, descricao: undefined })) }}
              placeholder='Ex: Mensalidade Cond. Jardins'
              style={inputErr('descricao')}
            />
            {erros.descricao && <span style={{ fontSize: '0.75rem', color: '#f87171' }}>{erros.descricao}</span>}
          </div>

          {/* ── Valor + Data ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={field}>
              <label style={label}>Valor (R$) *</label>
              <input
                type='number'
                min='0.01'
                step='0.01'
                value={valor}
                onChange={(e) => { setValor(e.target.value); setErros((p) => ({ ...p, valor: undefined })) }}
                placeholder='0,00'
                style={inputErr('valor')}
              />
              {erros.valor && <span style={{ fontSize: '0.75rem', color: '#f87171' }}>{erros.valor}</span>}
            </div>
            <div style={field}>
              <label style={label}>Data *</label>
              <input
                type='date'
                value={data}
                onChange={(e) => { setData(e.target.value); setErros((p) => ({ ...p, data: undefined })) }}
                style={inputErr('data')}
              />
              {erros.data && <span style={{ fontSize: '0.75rem', color: '#f87171' }}>{erros.data}</span>}
            </div>
          </div>

          {/* ── Categoria ── */}
          <div style={field}>
            <label style={label}>Categoria</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '6px' }}>
              {cats.map((c) => {
                const ativo = categoria === c.value
                return (
                  <button
                    key={c.value}
                    type='button'
                    onClick={() => setCategoria(c.value)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: ativo ? 700 : 400,
                      cursor: 'pointer',
                      transition: 'all 0.12s',
                      background: ativo ? `${corTipo}18` : '#1a1a1a',
                      border:     ativo ? `1px solid ${corTipo}44` : '1px solid #2a2a2a',
                      color:      ativo ? corTipo : '#666',
                      textAlign: 'center',
                    }}
                  >
                    {c.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── Cliente ── */}
          <div style={field}>
            <label style={label}>Cliente (opcional)</label>
            <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} style={input}>
              <option value=''>— Sem cliente vinculado —</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>

          {/* ── Observações ── */}
          <div style={field}>
            <label style={label}>Observações (opcional)</label>
            <textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              rows={2}
              placeholder='Detalhes adicionais...'
              style={{ ...input, resize: 'vertical' }}
            />
          </div>

          {/* ── Erro geral ── */}
          {erros.geral && (
            <div style={{ background: '#450a0a', border: '1px solid #cc000044', borderRadius: '6px', padding: '10px 14px' }}>
              <span style={{ fontSize: '0.875rem', color: '#f87171' }}>{erros.geral}</span>
            </div>
          )}

          {/* ── Botões ── */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '4px' }}>
            <button
              type='button'
              onClick={onFechar}
              disabled={pending}
              style={{
                background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px',
                padding: '9px 22px', color: '#aaa', fontSize: '0.875rem', cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type='submit'
              disabled={pending}
              style={{
                background: corSave, border: 'none', borderRadius: '6px',
                padding: '9px 28px', color: '#fff', fontSize: '0.875rem',
                fontWeight: 700, cursor: pending ? 'not-allowed' : 'pointer',
                opacity: pending ? 0.65 : 1, letterSpacing: '0.04em',
              }}
            >
              {pending ? 'Salvando...' : lancamentoEditar ? 'Salvar Alterações' : 'Lançar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
