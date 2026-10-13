'use client'

import { useState, useTransition } from 'react'
import { X } from 'lucide-react'
import { criarEquipamento, atualizarEquipamento, type EquipamentoFormData } from '@/app/(app)/equipamentos/actions'
import type { CategoriaEquipamento, Equipamento } from '@prisma/client'

const CATEGORIAS: { value: CategoriaEquipamento; label: string }[] = [
  { value: 'CFTV',           label: 'CFTV'          },
  { value: 'ACESSO',         label: 'Acesso'        },
  { value: 'COMUNICACAO',    label: 'Comunicação'   },
  { value: 'INFRAESTRUTURA', label: 'Infraestrutura'},
]

const UNIDADES = ['un', 'ponto', 'metro', 'hora']

type EqExtended = Equipamento & { precoFornecedor?: number | null; margem?: number | null }

type Props = {
  onFechar: () => void
  onSalvo:  () => void
  equipamento?: EqExtended
}

function fmt(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

export function EquipamentoFormModal({ onFechar, onSalvo, equipamento }: Props) {
  const [pending, startTransition] = useTransition()
  const [erros, setErros] = useState<Record<string, string>>({})

  const [codigo,    setCodigo]    = useState(equipamento?.codigo     ?? '')
  const [nome,      setNome]      = useState(equipamento?.nome       ?? '')
  const [descricao, setDescricao] = useState(equipamento?.descricao  ?? '')
  const [categoria, setCategoria] = useState<CategoriaEquipamento>(equipamento?.categoria ?? 'CFTV')
  const [unidade,   setUnidade]   = useState(equipamento?.unidade    ?? 'un')
  const [ativo,     setAtivo]     = useState(equipamento?.ativo      ?? true)

  // Novos campos de preço
  const [fornecedor, setFornecedor] = useState(
    equipamento?.precoFornecedor != null
      ? String(equipamento.precoFornecedor)
      : equipamento ? String(Number(equipamento.precoBase)) : ''
  )
  const [margem, setMargem] = useState(
    equipamento?.margem != null ? String(equipamento.margem) : ''
  )

  // Preço final calculado em tempo real
  const fornecedorNum = parseFloat(fornecedor) || 0
  const margemNum     = parseFloat(margem)     || 0
  const precoFinal    = fornecedorNum > 0
    ? (margemNum > 0 ? fornecedorNum * (1 + margemNum / 100) : fornecedorNum)
    : 0

  function validate() {
    const e: Record<string, string> = {}
    if (!nome.trim())           e.nome      = 'Nome é obrigatório.'
    if (fornecedorNum <= 0)     e.fornecedor = 'Preço do fornecedor deve ser maior que zero.'
    if (margem && (margemNum < 0 || margemNum > 200)) e.margem = 'Margem deve ser entre 0 e 200%.'
    setErros(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    const data: EquipamentoFormData = {
      codigo, nome, descricao, categoria, unidade, ativo,
      precoFornecedor: fornecedorNum,
      margem:          margem ? margemNum : undefined,
      precoBase:       precoFinal > 0 ? precoFinal : fornecedorNum,
    }
    startTransition(async () => {
      const res = equipamento
        ? await atualizarEquipamento(equipamento.id, data)
        : await criarEquipamento(data)
      if (res && 'erro' in res && res.erro) { setErros({ geral: res.erro }); return }
      onSalvo()
      onFechar()
    })
  }

  const inp = (err?: boolean): React.CSSProperties => ({
    background: '#1a1a1a', border: `1px solid ${err ? '#cc0000' : '#333'}`,
    borderRadius: '6px', padding: '9px 12px', color: '#f0f0f0',
    fontSize: '0.875rem', width: '100%', outline: 'none', boxSizing: 'border-box',
  })
  const lbl: React.CSSProperties = {
    fontSize: '0.78rem', color: '#999', fontWeight: 500,
    display: 'block', marginBottom: '4px',
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }} onClick={onFechar} />
      <div style={{ position: 'relative', background: '#111', border: '1px solid #333', borderRadius: '12px', width: '100%', maxWidth: '520px', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #222', position: 'sticky', top: 0, background: '#111', zIndex: 1 }}>
          <h2 style={{ fontFamily: 'var(--font-barlow-condensed),sans-serif', fontWeight: 600, fontSize: '1.1rem', color: '#f0f0f0', margin: 0, letterSpacing: '0.02em' }}>
            {equipamento ? 'Editar Equipamento' : 'Novo Equipamento'}
          </h2>
          <button onClick={onFechar} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Código */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={lbl}>Código do Produto</label>
            <input value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder='Ex: 9970147'
              style={{ ...inp(!!erros.codigo), fontVariantNumeric: 'tabular-nums', color: '#ffffff' }} />
          </div>

          {/* Nome */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={lbl}>Nome *</label>
            <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder='Ex: Câmera IP 2MP Dome' style={inp(!!erros.nome)} />
            {erros.nome && <span style={{ fontSize: '0.72rem', color: '#f87171' }}>{erros.nome}</span>}
          </div>

          {/* Categoria + Unidade */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={lbl}>Categoria</label>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaEquipamento)} style={inp()}>
                {CATEGORIAS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={lbl}>Unidade</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                {UNIDADES.map((u) => (
                  <button key={u} type='button' onClick={() => setUnidade(u)}
                    style={{ padding: '7px 6px', borderRadius: '5px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: unidade === u ? 700 : 400,
                      background: unidade === u ? 'rgba(204,0,0,0.15)' : '#1a1a1a',
                      border: `1px solid ${unidade === u ? '#cc000044' : '#2a2a2a'}`,
                      color: unidade === u ? '#cc0000' : '#666',
                    }}>
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preços */}
          <div style={{ background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ fontSize: '0.72rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, margin: 0 }}>
              Precificação
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {/* Preço Fornecedor */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={lbl}>Preço Fornecedor (R$) *</label>
                <input type='number' min='0.01' step='0.01' value={fornecedor}
                  onChange={(e) => setFornecedor(e.target.value)} placeholder='0,00'
                  style={inp(!!erros.fornecedor)} />
                {erros.fornecedor && <span style={{ fontSize: '0.72rem', color: '#f87171' }}>{erros.fornecedor}</span>}
              </div>

              {/* Margem */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={lbl}>Margem de Lucro (%)</label>
                <input type='number' min='0' max='200' step='0.5' value={margem}
                  onChange={(e) => setMargem(e.target.value)} placeholder='ex: 30'
                  style={inp(!!erros.margem)} />
                {erros.margem && <span style={{ fontSize: '0.72rem', color: '#f87171' }}>{erros.margem}</span>}
              </div>
            </div>

            {/* Preço Final (leitura) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(204,0,0,0.06)', border: '1px solid rgba(204,0,0,0.2)', borderRadius: '6px', padding: '10px 14px' }}>
              <span style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Preço Final (calculado)
              </span>
              <span style={{ fontFamily: 'var(--font-heading),sans-serif', fontWeight: 900, fontSize: '1.15rem', color: precoFinal > 0 ? '#cc0000' : '#444', letterSpacing: '0.02em' }}>
                {precoFinal > 0 ? fmt(precoFinal) : '—'}
              </span>
            </div>

            {fornecedorNum > 0 && margemNum > 0 && (
              <p style={{ fontSize: '0.72rem', color: '#444', margin: 0 }}>
                {fmt(fornecedorNum)} × (1 + {margemNum}÷100) = {fmt(precoFinal)}
              </p>
            )}
          </div>

          {/* Descrição */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={lbl}>Descrição (opcional)</label>
            <input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder='Especificações técnicas...' style={inp()} />
          </div>

          {/* Status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={lbl}>Status</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[true, false].map((val) => (
                <button key={String(val)} type='button' onClick={() => setAtivo(val)}
                  style={{ flex: 1, padding: '9px', borderRadius: '6px', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                    background: ativo === val ? (val ? '#14532d' : '#450a0a') : '#1a1a1a',
                    border: `1px solid ${ativo === val ? (val ? '#22c55e44' : '#cc000044') : '#2a2a2a'}`,
                    color: ativo === val ? (val ? '#22c55e' : '#f87171') : '#555',
                  }}>
                  {val ? 'Ativo' : 'Inativo'}
                </button>
              ))}
            </div>
          </div>

          {erros.geral && (
            <div style={{ background: '#450a0a', border: '1px solid #cc000044', borderRadius: '6px', padding: '10px 14px' }}>
              <span style={{ fontSize: '0.875rem', color: '#f87171' }}>{erros.geral}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '4px' }}>
            <button type='button' onClick={onFechar} style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', padding: '9px 22px', color: '#aaa', fontSize: '0.875rem', cursor: 'pointer' }}>
              Cancelar
            </button>
            <button type='submit' disabled={pending} style={{ background: '#cc0000', border: 'none', borderRadius: '6px', padding: '9px 28px', color: '#fff', fontSize: '0.875rem', fontWeight: 700, cursor: pending ? 'not-allowed' : 'pointer', opacity: pending ? 0.65 : 1 }}>
              {pending ? 'Salvando...' : equipamento ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
