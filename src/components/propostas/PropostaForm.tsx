'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, ArrowLeft, ArrowRight, Check, ChevronDown } from 'lucide-react'
import { criarProposta } from '@/app/(app)/propostas/actions'
import { formatCurrency } from '@/lib/utils'

// ── Tipos ─────────────────────────────────────────────────────────────────────

type EqOpcao = {
  id: string
  codigo: string | null
  nome: string
  precoBase: unknown
  unidade: string
}

type ClienteOpcao = { id: string; nome: string }

type ItemLocal = {
  uid: string
  equipamentoId: string
  descricao: string
  quantidade: number
  valorUnitario: number
}

type SecaoLocal = {
  uid: string
  nome: string
  itens: ItemLocal[]
}

type CondicaoLocal = {
  uid: string
  titulo: string
  valor: number
  descricao: string
}

// ── Constantes ────────────────────────────────────────────────────────────────

const SUGESTOES_SECAO = [
  'Portão da Rua', 'Portão de Veículo', 'Elevador', 'CFTV Externo',
  'Cerca Elétrica', 'Controle de Acesso', 'Interfonia', 'Alarme', 'Mão de Obra',
]

const APRESENTACAO_DEFAULT = `A empresa é especializada em portaria virtual e segurança eletrônica, atendendo condomínios residenciais e comerciais com soluções modernas de controle de acesso, monitoramento 24 horas e portaria remota.

Nossa equipe é formada por profissionais treinados e certificados, comprometidos em oferecer tecnologia de ponta com atendimento personalizado, reduzindo custos operacionais e aumentando a eficiência e segurança do seu condomínio.`

function uid() { return Math.random().toString(36).slice(2) }

function itemVazio(): ItemLocal {
  return { uid: uid(), equipamentoId: '', descricao: '', quantidade: 1, valorUnitario: 0 }
}

function secaoVazia(nome = ''): SecaoLocal {
  return { uid: uid(), nome, itens: [itemVazio()] }
}

function condicaoVazia(): CondicaoLocal {
  return { uid: uid(), titulo: '', valor: 0, descricao: '' }
}

// ── Estilos compartilhados ────────────────────────────────────────────────────

const inp: React.CSSProperties = {
  background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px',
  padding: '9px 12px', color: '#f0f0f0', fontSize: '0.875rem',
  width: '100%', outline: 'none', boxSizing: 'border-box',
}
const inpErr: React.CSSProperties = { ...inp, border: '1px solid #cc0000' }
const lbl: React.CSSProperties = {
  fontSize: '0.78rem', color: '#999', fontWeight: 500, display: 'block', marginBottom: '4px',
}
const card: React.CSSProperties = {
  background: '#111', border: '1px solid #222', borderRadius: '8px', padding: '20px',
}

// ── Componente principal ──────────────────────────────────────────────────────

export function PropostaForm({ clientes, equipamentos }: { clientes: ClienteOpcao[]; equipamentos: EqOpcao[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  // Step
  const [etapa, setEtapa] = useState(1)
  const [erros, setErros] = useState<Record<string, string>>({})

  // Etapa 1
  const [clienteId,            setClienteId]            = useState('')
  const [validadeDias,         setValidadeDias]         = useState(15)
  const [observacoes,          setObservacoes]          = useState('')
  const [apresentacaoEmpresa,  setApresentacaoEmpresa]  = useState(APRESENTACAO_DEFAULT)
  const [escopoInstalacao,     setEscopoInstalacao]     = useState('')

  // Etapa 2
  const [secoes, setSecoes] = useState<SecaoLocal[]>([secaoVazia()])

  // Etapa 3
  const [condicoes, setCondicoes] = useState<CondicaoLocal[]>([condicaoVazia()])

  // ── Cálculos ────────────────────────────────────────────────────────────────

  const totalGeral = secoes.reduce(
    (acc, s) => acc + s.itens.reduce((a, i) => a + i.quantidade * i.valorUnitario, 0),
    0
  )

  // ── Validações por etapa ────────────────────────────────────────────────────

  function validarEtapa1() {
    const e: Record<string, string> = {}
    if (!clienteId) e.clienteId = 'Selecione um cliente.'
    setErros(e)
    return Object.keys(e).length === 0
  }

  function validarEtapa2() {
    const e: Record<string, string> = {}
    if (secoes.length === 0) { e.secoes = 'Adicione ao menos uma seção.'; setErros(e); return false }
    for (const s of secoes) {
      if (!s.nome.trim()) { e.secoes = 'Todas as seções precisam de um nome.'; setErros(e); return false }
      if (s.itens.length === 0) { e.secoes = `A seção "${s.nome}" não tem itens.`; setErros(e); return false }
      for (const i of s.itens) {
        if (!i.descricao.trim()) { e.secoes = 'Todos os itens precisam de uma descrição.'; setErros(e); return false }
        if (i.quantidade < 1)    { e.secoes = 'Quantidade deve ser maior que zero.'; setErros(e); return false }
      }
    }
    setErros({})
    return true
  }

  function avancar() {
    if (etapa === 1 && !validarEtapa1()) return
    if (etapa === 2 && !validarEtapa2()) return
    setEtapa((e) => Math.min(e + 1, 4))
  }

  function voltar() {
    setErros({})
    setEtapa((e) => Math.max(e - 1, 1))
  }

  // ── Manipuladores de seções ──────────────────────────────────────────────────

  function adicionarSecao(nome = '') {
    setSecoes((prev) => [...prev, secaoVazia(nome)])
  }

  function removerSecao(uid: string) {
    setSecoes((prev) => prev.filter((s) => s.uid !== uid))
  }

  function atualizarNomeSecao(uid: string, nome: string) {
    setSecoes((prev) => prev.map((s) => s.uid === uid ? { ...s, nome } : s))
  }

  function adicionarItem(secaoUid: string) {
    setSecoes((prev) => prev.map((s) =>
      s.uid === secaoUid ? { ...s, itens: [...s.itens, itemVazio()] } : s
    ))
  }

  function removerItem(secaoUid: string, itemUid: string) {
    setSecoes((prev) => prev.map((s) =>
      s.uid === secaoUid ? { ...s, itens: s.itens.filter((i) => i.uid !== itemUid) } : s
    ))
  }

  function atualizarItem(secaoUid: string, itemUid: string, campo: Partial<ItemLocal>) {
    setSecoes((prev) => prev.map((s) =>
      s.uid === secaoUid
        ? { ...s, itens: s.itens.map((i) => i.uid === itemUid ? { ...i, ...campo } : i) }
        : s
    ))
  }

  function selecionarEquipamento(secaoUid: string, itemUid: string, eqId: string) {
    const eq = equipamentos.find((e) => e.id === eqId)
    if (!eq) { atualizarItem(secaoUid, itemUid, { equipamentoId: '', descricao: '', valorUnitario: 0 }); return }
    atualizarItem(secaoUid, itemUid, {
      equipamentoId: eq.id,
      descricao:     eq.nome,
      valorUnitario: Number(eq.precoBase),
    })
  }

  // ── Manipuladores de condições ────────────────────────────────────────────────

  function adicionarCondicao() { setCondicoes((prev) => [...prev, condicaoVazia()]) }
  function removerCondicao(uid: string) { setCondicoes((prev) => prev.filter((c) => c.uid !== uid)) }
  function atualizarCondicao(uid: string, campo: Partial<CondicaoLocal>) {
    setCondicoes((prev) => prev.map((c) => c.uid === uid ? { ...c, ...campo } : c))
  }

  // ── Submit ────────────────────────────────────────────────────────────────────

  function handleSubmit() {
    startTransition(async () => {
      const res = await criarProposta({
        clienteId,
        apresentacaoEmpresa,
        escopoInstalacao,
        observacoes,
        validadeDias,
        secoes: secoes.map((s, i) => ({
          nome:  s.nome,
          ordem: i,
          itens: s.itens.map((item) => ({
            equipamentoId: item.equipamentoId || undefined,
            descricao:     item.descricao,
            quantidade:    item.quantidade,
            valorUnitario: item.valorUnitario,
          })),
        })),
        condicoes: condicoes
          .filter((c) => c.titulo.trim())
          .map((c) => ({ titulo: c.titulo, valor: c.valor, descricao: c.descricao })),
      })
      if (res && 'erro' in res && res.erro) {
        setErros({ geral: res.erro })
      }
    })
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  const clienteSel = clientes.find((c) => c.id === clienteId)

  return (
    <div style={{ maxWidth: '820px', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '48px' }}>

      {/* Header */}
      <div>
        <button onClick={() => router.push('/propostas')} style={{ background: 'none', border: 'none', color: '#555', fontSize: '0.8rem', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
          <ArrowLeft size={13} /> Voltar para Propostas
        </button>
        <h1 style={{ fontFamily: 'var(--font-barlow-condensed),sans-serif', fontWeight: 700, fontSize: '1.5rem', color: '#f0f0f0', margin: 0 }}>
          Nova Proposta Comercial
        </h1>
      </div>

      {/* Indicador de etapas */}
      <div style={{ display: 'flex', gap: '0', alignItems: 'center' }}>
        {[
          { n: 1, label: 'Dados Gerais' },
          { n: 2, label: 'Equipamentos' },
          { n: 3, label: 'Condições' },
          { n: 4, label: 'Revisão' },
        ].map(({ n, label }, idx) => {
          const ativo    = etapa === n
          const completo = etapa > n
          return (
            <div key={n} style={{ display: 'flex', alignItems: 'center', flex: idx < 3 ? 1 : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.78rem', fontWeight: 700,
                  background: ativo ? '#cc0000' : completo ? '#14532d' : '#1a1a1a',
                  border: `1px solid ${ativo ? '#cc0000' : completo ? '#22c55e44' : '#333'}`,
                  color: ativo || completo ? '#fff' : '#555',
                }}>
                  {completo ? <Check size={13} /> : n}
                </div>
                <span style={{ fontSize: '0.8rem', color: ativo ? '#f0f0f0' : completo ? '#22c55e' : '#555', fontWeight: ativo ? 600 : 400, whiteSpace: 'nowrap' }}>
                  {label}
                </span>
              </div>
              {idx < 3 && <div style={{ flex: 1, height: '1px', background: completo ? '#22c55e44' : '#222', margin: '0 10px' }} />}
            </div>
          )
        })}
      </div>

      {/* ── ETAPA 1 ── */}
      {etapa === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div style={card}>
            <h2 style={{ fontFamily: 'var(--font-barlow-condensed),sans-serif', fontWeight: 700, fontSize: '1rem', color: '#f0f0f0', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Dados Gerais
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              <div>
                <label style={lbl}>Cliente *</label>
                <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} style={erros.clienteId ? inpErr : inp}>
                  <option value=''>Selecione o cliente...</option>
                  {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
                {erros.clienteId && <span style={{ fontSize: '0.72rem', color: '#f87171' }}>{erros.clienteId}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={lbl}>Validade (dias)</label>
                  <input type='number' min={1} value={validadeDias} onChange={(e) => setValidadeDias(Number(e.target.value))} style={inp} />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <p style={{ fontSize: '0.8rem', color: '#555', margin: 0 }}>
                    Proposta válida por <strong style={{ color: '#888' }}>{validadeDias} dias</strong> a partir da emissão.
                  </p>
                </div>
              </div>

              <div>
                <label style={lbl}>Observações Gerais</label>
                <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={3} placeholder='Observações que aparecerão na proposta...' style={{ ...inp, resize: 'vertical' }} />
              </div>
            </div>
          </div>

          <div style={card}>
            <h2 style={{ fontFamily: 'var(--font-barlow-condensed),sans-serif', fontWeight: 700, fontSize: '1rem', color: '#f0f0f0', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Apresentação da Empresa
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={lbl}>Texto de apresentação</label>
                <textarea value={apresentacaoEmpresa} onChange={(e) => setApresentacaoEmpresa(e.target.value)} rows={5} style={{ ...inp, resize: 'vertical' }} />
              </div>
              <div>
                <label style={lbl}>Escopo de instalação</label>
                <textarea value={escopoInstalacao} onChange={(e) => setEscopoInstalacao(e.target.value)} rows={4} placeholder='Descreva o escopo dos serviços de instalação...' style={{ ...inp, resize: 'vertical' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ETAPA 2 ── */}
      {etapa === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {secoes.map((secao, si) => {
            const subtotal = secao.itens.reduce((a, i) => a + i.quantidade * i.valorUnitario, 0)
            return (
              <div key={secao.uid} style={{ ...card, padding: 0, overflow: 'hidden' }}>
                {/* Cabeçalho da seção */}
                <div style={{ padding: '14px 18px', borderBottom: '1px solid #1e1e1e', display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    value={secao.nome}
                    onChange={(e) => atualizarNomeSecao(secao.uid, e.target.value)}
                    placeholder='Nome da seção...'
                    style={{ ...inp, flex: 1, fontWeight: 600 }}
                  />
                  <span style={{ fontFamily: 'var(--font-barlow-condensed),sans-serif', fontWeight: 700, color: '#cc0000', whiteSpace: 'nowrap', fontSize: '1rem' }}>
                    {formatCurrency(subtotal)}
                  </span>
                  {secoes.length > 1 && (
                    <button onClick={() => removerSecao(secao.uid)} title='Remover seção' style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', display: 'flex', padding: '4px' }}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {/* Sugestões de nome */}
                {!secao.nome && (
                  <div style={{ padding: '10px 18px', borderBottom: '1px solid #1a1a1a', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {SUGESTOES_SECAO.map((s) => (
                      <button key={s} onClick={() => atualizarNomeSecao(secao.uid, s)}
                        style={{ padding: '3px 10px', borderRadius: '4px', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#666', fontSize: '0.75rem', cursor: 'pointer' }}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                {/* Tabela de itens */}
                <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 32px', gap: '8px', marginBottom: '4px' }}>
                    {['Equipamento / Descrição', 'Qtd', 'Valor Unit.', 'Total', ''].map((h, i) => (
                      <span key={i} style={{ fontSize: '0.65rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{h}</span>
                    ))}
                  </div>

                  {secao.itens.map((item) => (
                    <div key={item.uid} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 32px', gap: '8px', alignItems: 'center' }}>

                      {/* Equipamento/descrição */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ position: 'relative' }}>
                          <select
                            value={item.equipamentoId}
                            onChange={(e) => selecionarEquipamento(secao.uid, item.uid, e.target.value)}
                            style={{ ...inp, paddingRight: '28px', appearance: 'none', fontSize: '0.78rem', color: item.equipamentoId ? '#e0e0e0' : '#555' }}
                          >
                            <option value=''>Selecionar do catálogo...</option>
                            {equipamentos.map((eq) => (
                              <option key={eq.id} value={eq.id}>
                                {eq.codigo ? `[${eq.codigo}] ` : ''}{eq.nome}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={12} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: '#555', pointerEvents: 'none' }} />
                        </div>
                        <input
                          value={item.descricao}
                          onChange={(e) => atualizarItem(secao.uid, item.uid, { descricao: e.target.value, equipamentoId: '' })}
                          placeholder='Ou descrever manualmente...'
                          style={{ ...inp, fontSize: '0.82rem' }}
                        />
                      </div>

                      {/* Qtd */}
                      <input
                        type='number' min={1} value={item.quantidade}
                        onChange={(e) => atualizarItem(secao.uid, item.uid, { quantidade: Number(e.target.value) })}
                        style={{ ...inp, textAlign: 'center' }}
                      />

                      {/* Valor unitário */}
                      <input
                        type='number' min={0} step='0.01' value={item.valorUnitario || ''}
                        onChange={(e) => atualizarItem(secao.uid, item.uid, { valorUnitario: Number(e.target.value) })}
                        placeholder='0,00'
                        style={inp}
                      />

                      {/* Total */}
                      <span style={{ fontFamily: 'var(--font-barlow-condensed),sans-serif', fontSize: '0.95rem', fontWeight: 700, color: '#cc0000', textAlign: 'right' }}>
                        {formatCurrency(item.quantidade * item.valorUnitario)}
                      </span>

                      {/* Remover item */}
                      <button
                        onClick={() => removerItem(secao.uid, item.uid)}
                        disabled={secao.itens.length === 1}
                        style={{ background: 'none', border: 'none', color: '#555', cursor: secao.itens.length === 1 ? 'not-allowed' : 'pointer', display: 'flex', padding: '4px', opacity: secao.itens.length === 1 ? 0.3 : 1 }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}

                  <button onClick={() => adicionarItem(secao.uid)}
                    style={{ alignSelf: 'flex-start', marginTop: '4px', background: 'none', border: '1px dashed #333', borderRadius: '5px', padding: '6px 14px', color: '#555', fontSize: '0.8rem', cursor: 'pointer' }}>
                    + Adicionar item
                  </button>
                </div>
              </div>
            )
          })}

          {/* Total geral */}
          {secoes.length > 1 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ background: '#111', border: '1px solid #cc000033', borderRadius: '8px', padding: '12px 22px', textAlign: 'right' }}>
                <p style={{ fontSize: '0.7rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 2px' }}>Total Geral</p>
                <p style={{ fontFamily: 'var(--font-barlow-condensed),sans-serif', fontSize: '1.4rem', fontWeight: 900, color: '#cc0000', margin: 0 }}>
                  {formatCurrency(totalGeral)}
                </p>
              </div>
            </div>
          )}

          {/* Adicionar seção */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button onClick={() => adicionarSecao()}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', padding: '9px 18px', color: '#aaa', fontSize: '0.875rem', cursor: 'pointer', alignSelf: 'flex-start' }}>
              <Plus size={14} /> Nova Seção
            </button>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {SUGESTOES_SECAO.map((s) => (
                <button key={s} onClick={() => adicionarSecao(s)}
                  style={{ padding: '4px 12px', borderRadius: '4px', background: '#161616', border: '1px solid #2a2a2a', color: '#555', fontSize: '0.75rem', cursor: 'pointer' }}>
                  + {s}
                </button>
              ))}
            </div>
          </div>

          {erros.secoes && (
            <div style={{ background: '#450a0a', border: '1px solid #cc000044', borderRadius: '6px', padding: '10px 14px' }}>
              <span style={{ fontSize: '0.875rem', color: '#f87171' }}>{erros.secoes}</span>
            </div>
          )}
        </div>
      )}

      {/* ── ETAPA 3 ── */}
      {etapa === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={card}>
            <h2 style={{ fontFamily: 'var(--font-barlow-condensed),sans-serif', fontWeight: 700, fontSize: '1rem', color: '#f0f0f0', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Condições Comerciais
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#555', margin: '0 0 16px' }}>
              Adicione opções de pagamento (ex: à vista, parcelado, comodato). Opcional — deixe em branco para omitir.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {condicoes.map((c) => (
                <div key={c.uid} style={{ background: '#0d0d0d', border: '1px solid #222', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 32px', gap: '10px', alignItems: 'end' }}>
                    <div>
                      <label style={lbl}>Título</label>
                      <input value={c.titulo} onChange={(e) => atualizarCondicao(c.uid, { titulo: e.target.value })} placeholder='Ex: Compra à Vista' style={inp} />
                    </div>
                    <div>
                      <label style={lbl}>Valor (R$)</label>
                      <input type='number' min={0} step='0.01' value={c.valor || ''} onChange={(e) => atualizarCondicao(c.uid, { valor: Number(e.target.value) })} placeholder='0,00' style={inp} />
                    </div>
                    <button onClick={() => removerCondicao(c.uid)} disabled={condicoes.length === 1}
                      style={{ background: 'none', border: 'none', color: '#555', cursor: condicoes.length === 1 ? 'not-allowed' : 'pointer', opacity: condicoes.length === 1 ? 0.3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '38px' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div>
                    <label style={lbl}>Descrição (opcional)</label>
                    <input value={c.descricao} onChange={(e) => atualizarCondicao(c.uid, { descricao: e.target.value })} placeholder='Ex: Parcelado em 6x sem juros' style={inp} />
                  </div>
                </div>
              ))}

              <button onClick={adicionarCondicao}
                style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '7px', background: '#1a1a1a', border: '1px dashed #333', borderRadius: '6px', padding: '8px 16px', color: '#777', fontSize: '0.82rem', cursor: 'pointer' }}>
                <Plus size={13} /> Adicionar opção de pagamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ETAPA 4 — Revisão ── */}
      {etapa === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={card}>
            <h2 style={{ fontFamily: 'var(--font-barlow-condensed),sans-serif', fontWeight: 700, fontSize: '1rem', color: '#f0f0f0', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Revisão da Proposta
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

              <InfoRow label='Cliente'  val={clienteSel?.nome ?? '—'} />
              <InfoRow label='Validade' val={`${validadeDias} dias`} />
              <InfoRow label='Seções'   val={`${secoes.length} seção(ões) com ${secoes.reduce((a, s) => a + s.itens.length, 0)} item(ns)`} />
              <InfoRow label='Condições' val={condicoes.filter((c) => c.titulo).length > 0 ? condicoes.filter((c) => c.titulo).map((c) => c.titulo).join(', ') : '—'} />

              <div style={{ borderTop: '1px solid #222', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Geral</span>
                <span style={{ fontFamily: 'var(--font-barlow-condensed),sans-serif', fontSize: '1.4rem', fontWeight: 900, color: '#cc0000' }}>
                  {formatCurrency(totalGeral)}
                </span>
              </div>

              <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: '12px' }}>
                <p style={{ fontSize: '0.72rem', color: '#555', margin: '0 0 8px' }}>SEÇÕES</p>
                {secoes.map((s) => (
                  <div key={s.uid} style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e0e0e0' }}>{s.nome}</span>
                      <span style={{ fontSize: '0.85rem', color: '#cc0000', fontWeight: 700 }}>
                        {formatCurrency(s.itens.reduce((a, i) => a + i.quantidade * i.valorUnitario, 0))}
                      </span>
                    </div>
                    {s.itens.map((i) => (
                      <div key={i.uid} style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '12px' }}>
                        <span style={{ fontSize: '0.78rem', color: '#666' }}>{i.quantidade}× {i.descricao}</span>
                        <span style={{ fontSize: '0.78rem', color: '#555' }}>{formatCurrency(i.quantidade * i.valorUnitario)}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {erros.geral && (
            <div style={{ background: '#450a0a', border: '1px solid #cc000044', borderRadius: '6px', padding: '10px 14px' }}>
              <span style={{ fontSize: '0.875rem', color: '#f87171' }}>{erros.geral}</span>
            </div>
          )}
        </div>
      )}

      {/* Navegação entre etapas */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px' }}>
        <button
          onClick={etapa === 1 ? () => router.push('/propostas') : voltar}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', padding: '9px 20px', color: '#aaa', fontSize: '0.875rem', cursor: 'pointer' }}
        >
          <ArrowLeft size={14} /> {etapa === 1 ? 'Cancelar' : 'Voltar'}
        </button>

        {etapa < 4 ? (
          <button onClick={avancar}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: '#cc0000', border: '1px solid #aa000066', borderRadius: '6px', padding: '9px 20px', color: '#fff', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
            Próximo <ArrowRight size={14} />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={pending}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: '#cc0000', border: '1px solid #aa000066', borderRadius: '6px', padding: '9px 24px', color: '#fff', fontSize: '0.875rem', fontWeight: 700, cursor: pending ? 'not-allowed' : 'pointer', opacity: pending ? 0.65 : 1 }}>
            <Check size={15} /> {pending ? 'Salvando...' : 'Criar Proposta'}
          </button>
        )}
      </div>
    </div>
  )
}

// ── Aux ───────────────────────────────────────────────────────────────────────

function InfoRow({ label, val }: { label: string; val: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid #181818', paddingBottom: '8px' }}>
      <span style={{ fontSize: '0.78rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      <span style={{ fontSize: '0.875rem', color: '#e0e0e0', fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{val}</span>
    </div>
  )
}
