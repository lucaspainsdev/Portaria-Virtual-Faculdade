'use client'

import { useState, useTransition } from 'react'
import { X } from 'lucide-react'
import { criarLancamento, atualizarLancamento, type LancamentoFormData } from '@/app/(app)/financeiro/actions'
import { toDateInput } from '@/lib/utils'
import type { TipoLancamento, CategoriaLancamento, Lancamento } from '@prisma/client'

type ClienteOpt = { id: string; nome: string }
type Props = {
  onFechar: () => void
  onSalvo: () => void
  clientes: ClienteOpt[]
  lancamentoEditar?: Lancamento & { cliente?: { id: string; nome: string } | null }
}

const CATEGORIAS: { value: CategoriaLancamento; label: string }[] = [
  { value: 'INSTALACAO',  label: 'Instalação'  },
  { value: 'MENSALIDADE', label: 'Mensalidade' },
  { value: 'EQUIPAMENTO', label: 'Equipamento' },
  { value: 'SALARIO',     label: 'Salário'     },
  { value: 'FORNECEDOR',  label: 'Fornecedor'  },
  { value: 'OUTROS',      label: 'Outros'      },
]

export function LancamentoModal({ onFechar, onSalvo, clientes, lancamentoEditar }: Props) {
  const [pending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)

  const [tipo,      setTipo]      = useState<TipoLancamento>(lancamentoEditar?.tipo ?? 'RECEITA')
  const [categoria, setCategoria] = useState<CategoriaLancamento>(lancamentoEditar?.categoria ?? 'MENSALIDADE')
  const [descricao, setDescricao] = useState(lancamentoEditar?.descricao ?? '')
  const [valor,     setValor]     = useState(lancamentoEditar ? String(Number(lancamentoEditar.valor)) : '')
  const [data,      setData]      = useState(lancamentoEditar ? toDateInput(lancamentoEditar.data) : toDateInput(new Date()))
  const [clienteId, setClienteId] = useState(lancamentoEditar?.clienteId ?? '')
  const [obs,       setObs]       = useState(lancamentoEditar?.observacoes ?? '')

  const input: React.CSSProperties = { background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', padding: '8px 12px', color: '#f0f0f0', fontSize: '0.875rem', width: '100%', outline: 'none' }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    const fd: LancamentoFormData = { tipo, categoria, descricao, valor: parseFloat(valor) || 0, data, clienteId: clienteId || undefined, observacoes: obs }
    startTransition(async () => {
      const res = lancamentoEditar
        ? await atualizarLancamento(lancamentoEditar.id, fd)
        : await criarLancamento(fd)
      if (res && 'erro' in res && res.erro) { setErro(res.erro); return }
      onSalvo()
      onFechar()
    })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} onClick={onFechar} />
      <div style={{ position: 'relative', background: '#111', border: '1px solid #222', borderRadius: '10px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #222' }}>
          <h2 style={{ fontFamily: 'var(--font-barlow-condensed),sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#f0f0f0', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {lancamentoEditar ? 'Editar Lançamento' : 'Novo Lançamento'}
          </h2>
          <button onClick={onFechar} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', display: 'flex' }}><X size={18} /></button>
        </div>

        <form onSubmit={submit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Tipo */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['RECEITA', 'DESPESA'] as TipoLancamento[]).map((t) => (
              <button
                key={t} type='button'
                onClick={() => setTipo(t)}
                style={{
                  flex: 1, padding: '10px', borderRadius: '6px', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.15s',
                  background: tipo === t ? (t === 'RECEITA' ? '#14532d' : '#450a0a') : '#1a1a1a',
                  border: `1px solid ${tipo === t ? (t === 'RECEITA' ? '#22c55e44' : '#cc000044') : '#333'}`,
                  color: tipo === t ? (t === 'RECEITA' ? '#22c55e' : '#f87171') : '#666',
                }}
              >
                {t === 'RECEITA' ? '↑ Receita' : '↓ Despesa'}
              </button>
            ))}
          </div>

          {/* Grid campos */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.8rem', color: '#aaa' }}>Descrição *</label>
              <input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder='Ex: Mensalidade Cond. Jardins' style={input} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.8rem', color: '#aaa' }}>Valor (R$) *</label>
              <input type='number' min='0.01' step='0.01' value={valor} onChange={(e) => setValor(e.target.value)} placeholder='0,00' style={input} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.8rem', color: '#aaa' }}>Data *</label>
              <input type='date' value={data} onChange={(e) => setData(e.target.value)} style={input} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.8rem', color: '#aaa' }}>Categoria</label>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaLancamento)} style={input}>
                {CATEGORIAS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.8rem', color: '#aaa' }}>Cliente (opcional)</label>
              <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} style={input}>
                <option value=''>Sem cliente</option>
                {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>

            <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.8rem', color: '#aaa' }}>Observações</label>
              <textarea value={obs} onChange={(e) => setObs(e.target.value)} rows={2} style={{ ...input, resize: 'vertical' }} />
            </div>
          </div>

          {erro && (
            <p style={{ fontSize: '0.875rem', color: '#f87171', background: '#450a0a', border: '1px solid #f8717133', borderRadius: '6px', padding: '10px 14px' }}>{erro}</p>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type='button' onClick={onFechar} style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', padding: '8px 20px', color: '#f0f0f0', fontSize: '0.875rem', cursor: 'pointer' }}>
              Cancelar
            </button>
            <button type='submit' disabled={pending} style={{ background: tipo === 'RECEITA' ? '#16a34a' : '#cc0000', border: 'none', borderRadius: '6px', padding: '8px 24px', color: '#fff', fontSize: '0.875rem', fontWeight: 700, cursor: pending ? 'not-allowed' : 'pointer', opacity: pending ? 0.6 : 1 }}>
              {pending ? 'Salvando...' : lancamentoEditar ? 'Salvar Alterações' : 'Lançar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
