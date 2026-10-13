'use client'

import { useState, useTransition } from 'react'
import { X } from 'lucide-react'
import { criarContrato, atualizarContrato, type ContratoFormData } from '@/app/(app)/contratos/actions'
import { formatCEP, toDateInput } from '@/lib/utils'
import type { Contrato, StatusContrato } from '@prisma/client'

type ClienteOpt = { id: string; nome: string }

type Props = {
  onFechar:  () => void
  onSalvo:   () => void
  clientes:  ClienteOpt[]
  contrato?: Contrato
}

const STATUS_OPTS: { value: StatusContrato; label: string }[] = [
  { value: 'ATIVO',     label: 'Ativo'     },
  { value: 'SUSPENSO',  label: 'Suspenso'  },
  { value: 'ENCERRADO', label: 'Encerrado' },
]

export function ContratoFormModal({ onFechar, onSalvo, clientes, contrato }: Props) {
  const [pending, startTransition] = useTransition()
  const [erros, setErros] = useState<Record<string, string>>({})

  const [clienteId,   setClienteId]   = useState(contrato?.clienteId   ?? '')
  const [numero,      setNumero]      = useState(contrato?.numero       ?? '')
  const [descricao,   setDescricao]   = useState(contrato?.descricao    ?? '')
  const [valor,       setValor]       = useState(contrato ? String(Number(contrato.valorMensal)) : '')
  const [dataInicio,  setDataInicio]  = useState(contrato ? toDateInput(contrato.dataInicio) : '')
  const [dataFim,     setDataFim]     = useState(contrato?.dataFim ? toDateInput(contrato.dataFim) : '')
  const [status,      setStatus]      = useState<StatusContrato>(contrato?.status ?? 'ATIVO')
  const [obs,         setObs]         = useState(contrato?.observacoes ?? '')
  const [clausulas,   setClausulas]   = useState(contrato?.clausulasPersonalizadas ?? '')

  function validate() {
    const e: Record<string, string> = {}
    if (!contrato && !clienteId) e.clienteId = 'Selecione um cliente.'
    if (!numero.trim())          e.numero    = 'Número é obrigatório.'
    if (!valor || parseFloat(valor) <= 0) e.valor = 'Valor deve ser maior que zero.'
    if (!dataInicio)             e.dataInicio = 'Data de início é obrigatória.'
    setErros(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    const data: ContratoFormData = {
      clienteId, numero, descricao,
      valorMensal: parseFloat(valor),
      dataInicio, dataFim: dataFim || undefined,
      status, observacoes: obs,
      clausulasPersonalizadas: clausulas || undefined,
    }
    startTransition(async () => {
      const res = contrato
        ? await atualizarContrato(contrato.id, data)
        : await criarContrato(data)
      if (res && 'erro' in res && res.erro) { setErros({ geral: res.erro }); return }
      onSalvo(); onFechar()
    })
  }

  const inp = (err?: boolean) => ({
    background: '#1a1a1a',
    border: `1px solid ${err ? '#cc0000' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: '8px', padding: '9px 12px',
    color: '#f0f0f0', fontSize: '0.875rem',
    width: '100%', outline: 'none', boxSizing: 'border-box' as const,
  })
  const lbl = { fontSize: '0.75rem', color: '#888', fontWeight: 500, display: 'block', marginBottom: '4px', textTransform: 'uppercase' as const, letterSpacing: '0.04em' }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }} onClick={onFechar} />
      <div style={{ position: 'relative', background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', width: '100%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 style={{ fontFamily: 'var(--font-heading),sans-serif', fontWeight: 600, fontSize: '1.1rem', color: '#f0f0f0', margin: 0, letterSpacing: '0.02em' }}>
            {contrato ? 'Editar Contrato' : 'Novo Contrato'}
          </h2>
          <button onClick={onFechar} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Cliente (só no create) */}
          {!contrato && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={lbl}>Cliente *</label>
              <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} style={inp(!!erros.clienteId)}>
                <option value=''>Selecione um cliente...</option>
                {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
              {erros.clienteId && <span style={{ fontSize: '0.72rem', color: '#f87171' }}>{erros.clienteId}</span>}
            </div>
          )}

          {/* Número + Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={lbl}>Número *</label>
              <input value={numero} onChange={(e) => setNumero(e.target.value)} placeholder='CTR-2026-001' style={inp(!!erros.numero)} />
              {erros.numero && <span style={{ fontSize: '0.72rem', color: '#f87171' }}>{erros.numero}</span>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={lbl}>Status</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {STATUS_OPTS.map((s) => {
                  const ativo = status === s.value
                  const cor = s.value === 'ATIVO' ? '#22c55e' : s.value === 'SUSPENSO' ? '#fb923c' : '#888'
                  return (
                    <button key={s.value} type='button' onClick={() => setStatus(s.value)}
                      style={{ flex: 1, padding: '8px 4px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.12s',
                        background: ativo ? `${cor}18` : '#1a1a1a',
                        border: `1px solid ${ativo ? cor + '44' : 'rgba(255,255,255,0.1)'}`,
                        color: ativo ? cor : '#555',
                      }}>
                      {s.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Valor mensal */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={lbl}>Valor Mensal (R$) *</label>
            <input type='number' min='0.01' step='0.01' value={valor} onChange={(e) => setValor(e.target.value)} placeholder='0,00' style={inp(!!erros.valor)} />
            {erros.valor && <span style={{ fontSize: '0.72rem', color: '#f87171' }}>{erros.valor}</span>}
          </div>

          {/* Datas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={lbl}>Início *</label>
              <input type='date' value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} style={inp(!!erros.dataInicio)} />
              {erros.dataInicio && <span style={{ fontSize: '0.72rem', color: '#f87171' }}>{erros.dataInicio}</span>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={lbl}>Término (opcional)</label>
              <input type='date' value={dataFim} onChange={(e) => setDataFim(e.target.value)} style={inp()} />
            </div>
          </div>

          {/* Descrição */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={lbl}>Descrição</label>
            <input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder='Contrato de monitoramento e portaria virtual' style={inp()} />
          </div>

          {/* Cláusulas adicionais */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={lbl}>Observações / Cláusulas adicionais <span style={{ color: '#555', textTransform: 'none', fontWeight: 400 }}>(opcional — aparece como Cláusula 10 no PDF)</span></label>
            <textarea value={clausulas} onChange={(e) => setClausulas(e.target.value)} rows={3} placeholder='Ex.: O presente contrato inclui monitoramento de 4 câmeras externas...' style={{ ...inp(), resize: 'vertical' }} />
          </div>

          {/* Observações */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={lbl}>Observações internas <span style={{ color: '#555', textTransform: 'none', fontWeight: 400 }}>(não aparece no PDF)</span></label>
            <textarea value={obs} onChange={(e) => setObs(e.target.value)} rows={2} style={{ ...inp(), resize: 'vertical' }} />
          </div>

          {erros.geral && (
            <div style={{ background: 'rgba(204,0,0,0.1)', border: '1px solid rgba(204,0,0,0.3)', borderRadius: '6px', padding: '10px 14px' }}>
              <span style={{ fontSize: '0.875rem', color: '#f87171' }}>{erros.geral}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '4px' }}>
            <button type='button' onClick={onFechar} style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '9px 22px', color: '#aaa', fontSize: '0.875rem', cursor: 'pointer' }}>
              Cancelar
            </button>
            <button type='submit' disabled={pending} style={{ background: '#cc0000', border: 'none', borderRadius: '8px', padding: '9px 28px', color: '#fff', fontSize: '0.875rem', fontWeight: 700, cursor: pending ? 'not-allowed' : 'pointer', opacity: pending ? 0.65 : 1 }}>
              {pending ? 'Salvando...' : contrato ? 'Salvar' : 'Criar Contrato'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
