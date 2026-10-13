'use client'

import { useState, useTransition } from 'react'
import { X } from 'lucide-react'
import { criarCliente, atualizarCliente, type ClienteFormData } from '@/app/(app)/clientes/actions'
import { formatCNPJ, formatCPF, formatTelefone, formatCEP } from '@/lib/utils'
import type { Cliente } from '@prisma/client'

type Props = {
  onFechar: () => void
  onSalvo:  () => void
  cliente?: Cliente
}

export function ClienteFormModal({ onFechar, onSalvo, cliente }: Props) {
  const [pending, startTransition] = useTransition()
  const [erros, setErros] = useState<Record<string, string>>({})

  const [nome,        setNome]        = useState(cliente?.nome        ?? '')
  const [cnpj,        setCnpj]        = useState(cliente?.cnpj        ?? '')
  const [cpf,         setCpf]         = useState(cliente?.cpf         ?? '')
  const [responsavel, setResponsavel] = useState(cliente?.responsavel ?? '')
  const [telefone,    setTelefone]    = useState(cliente?.telefone    ?? '')
  const [email,       setEmail]       = useState(cliente?.email       ?? '')
  const [endereco,    setEndereco]    = useState(cliente?.endereco    ?? '')
  const [numero,      setNumero]      = useState((cliente as Cliente & { numero?: string })?.numero ?? '')
  const [bairro,      setBairro]      = useState((cliente as Cliente & { bairro?: string })?.bairro ?? '')
  const [cidade,      setCidade]      = useState(cliente?.cidade      ?? '')
  const [estado,      setEstado]      = useState(cliente?.estado      ?? '')
  const [cep,         setCep]         = useState(cliente?.cep         ?? '')
  const [ativo,       setAtivo]       = useState(cliente?.ativo       ?? true)
  const [obs,         setObs]         = useState(cliente?.observacoes ?? '')

  function validate() {
    const e: Record<string, string> = {}
    if (!nome.trim()) e.nome = 'Nome é obrigatório.'
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'E-mail inválido.'
    setErros(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    const data: ClienteFormData = { nome, cnpj, cpf, responsavel, telefone, email, endereco, numero, bairro, cidade, estado, cep, ativo, observacoes: obs }
    startTransition(async () => {
      const res = cliente
        ? await atualizarCliente(cliente.id, data)
        : await criarCliente(data)
      if (res && 'erro' in res && res.erro) { setErros({ geral: res.erro }); return }
      onSalvo()
      onFechar()
    })
  }

  const inp = (hasErr?: boolean): React.CSSProperties => ({
    background: '#1a1a1a', border: `1px solid ${hasErr ? '#cc0000' : '#333'}`,
    borderRadius: '6px', padding: '9px 12px', color: '#f0f0f0',
    fontSize: '0.875rem', width: '100%', outline: 'none', boxSizing: 'border-box',
  })
  const lbl: React.CSSProperties = { fontSize: '0.78rem', color: '#999', fontWeight: 500, display: 'block', marginBottom: '4px' }
  const fld: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '4px' }
  const err = (campo: string) => erros[campo]
    ? <span style={{ fontSize: '0.72rem', color: '#f87171' }}>{erros[campo]}</span>
    : null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }} onClick={onFechar} />

      <div style={{ position: 'relative', background: '#111', border: '1px solid #333', borderRadius: '12px', width: '100%', maxWidth: '600px', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}>
        {/* Topo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #222', position: 'sticky', top: 0, background: '#111', zIndex: 1 }}>
          <h2 style={{ fontFamily: 'var(--font-barlow-condensed),sans-serif', fontWeight: 600, fontSize: '1.15rem', color: '#f0f0f0', margin: 0, letterSpacing: '0.02em' }}>
            {cliente ? 'Editar Cliente' : 'Novo Cliente'}
          </h2>
          <button onClick={onFechar} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: '4px', display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Identificação */}
          <Secao titulo='Identificação'>
            <div style={{ gridColumn: '1/-1', ...fld }}>
              <label style={lbl}>Nome do condomínio *</label>
              <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder='Ex: Residencial Jardins das Acácias' style={inp(!!erros.nome)} />
              {err('nome')}
            </div>
            <div style={fld}>
              <label style={lbl}>CNPJ</label>
              <input value={cnpj} onChange={(e) => setCnpj(formatCNPJ(e.target.value))} placeholder='00.000.000/0000-00' maxLength={18} style={inp()} />
            </div>
            <div style={fld}>
              <label style={lbl}>CPF do Responsável</label>
              <input value={cpf} onChange={(e) => setCpf(formatCPF(e.target.value))} placeholder='000.000.000-00' maxLength={14} style={inp()} />
            </div>
            <div style={{ gridColumn: '1/-1', ...fld }}>
              <label style={lbl}>Status</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[true, false].map((val) => (
                  <button key={String(val)} type='button' onClick={() => setAtivo(val)}
                    style={{ flex: 1, padding: '9px', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
                      background: ativo === val ? (val ? '#14532d' : '#450a0a') : '#1a1a1a',
                      border: `1px solid ${ativo === val ? (val ? '#22c55e44' : '#cc000044') : '#2a2a2a'}`,
                      color: ativo === val ? (val ? '#22c55e' : '#f87171') : '#555',
                    }}>
                    {val ? 'Ativo' : 'Inativo'}
                  </button>
                ))}
              </div>
            </div>
          </Secao>

          {/* Contato */}
          <Secao titulo='Contato'>
            <div style={fld}>
              <label style={lbl}>Responsável (síndico)</label>
              <input value={responsavel} onChange={(e) => setResponsavel(e.target.value)} placeholder='Nome completo' style={inp()} />
            </div>
            <div style={fld}>
              <label style={lbl}>Telefone</label>
              <input value={telefone} onChange={(e) => setTelefone(formatTelefone(e.target.value))} placeholder='(00) 00000-0000' maxLength={15} style={inp()} />
            </div>
            <div style={{ gridColumn: '1/-1', ...fld }}>
              <label style={lbl}>E-mail</label>
              <input type='email' value={email} onChange={(e) => setEmail(e.target.value)} placeholder='contato@condominio.com.br' style={inp(!!erros.email)} />
              {err('email')}
            </div>
          </Secao>

          {/* Endereço */}
          <Secao titulo='Endereço' cols={3}>
            <div style={{ gridColumn: 'span 2', ...fld }}>
              <label style={lbl}>Rua / Avenida</label>
              <input value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder='Ex: Rua das Flores' style={inp()} />
            </div>
            <div style={fld}>
              <label style={lbl}>Número</label>
              <input value={numero} onChange={(e) => setNumero(e.target.value)} placeholder='123' style={inp()} />
            </div>
            <div style={{ gridColumn: 'span 2', ...fld }}>
              <label style={lbl}>Bairro</label>
              <input value={bairro} onChange={(e) => setBairro(e.target.value)} placeholder='Centro' style={inp()} />
            </div>
            <div style={fld}>
              <label style={lbl}>CEP</label>
              <input value={cep} onChange={(e) => setCep(formatCEP(e.target.value))} placeholder='00000-000' maxLength={9} style={inp()} />
            </div>
            <div style={{ gridColumn: 'span 2', ...fld }}>
              <label style={lbl}>Cidade</label>
              <input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder='São Paulo' style={inp()} />
            </div>
            <div style={fld}>
              <label style={lbl}>UF</label>
              <input value={estado} onChange={(e) => setEstado(e.target.value.toUpperCase())} placeholder='SP' maxLength={2} style={inp()} />
            </div>
          </Secao>

          {/* Observações */}
          <div style={fld}>
            <label style={lbl}>Observações</label>
            <textarea value={obs} onChange={(e) => setObs(e.target.value)} rows={2} placeholder='Informações adicionais...' style={{ ...inp(), resize: 'vertical' }} />
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
              {pending ? 'Salvando...' : cliente ? 'Salvar Alterações' : 'Criar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Secao({ titulo, children, cols = 2 }: { titulo: string; children: React.ReactNode; cols?: number }) {
  return (
    <div>
      <p style={{ fontSize: '0.7rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '12px' }}>{titulo}</p>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '12px' }}>
        {children}
      </div>
    </div>
  )
}
