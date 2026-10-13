export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Copy } from 'lucide-react'
import { buscarProposta } from '@/app/(app)/propostas/actions'
import { BotaoExportarPDFProposta } from '@/components/propostas/BotaoExportarPDFProposta'
import { BotaoStatusProposta } from '@/components/propostas/BotaoStatusProposta'
import { formatCurrency } from '@/lib/utils'
import type { StatusProposta } from '@prisma/client'

const STATUS_CFG: Record<StatusProposta, { label: string; cor: string; bg: string; borda: string }> = {
  RASCUNHO: { label: 'Rascunho', cor: '#888',    bg: '#1a1a1a', borda: '#333'          },
  ENVIADA:  { label: 'Enviada',  cor: '#60a5fa', bg: '#1e3a5f', borda: '#60a5fa33'     },
  APROVADA: { label: 'Aprovada', cor: '#22c55e', bg: '#14532d', borda: '#22c55e33'     },
  RECUSADA: { label: 'Recusada', cor: '#f87171', bg: '#450a0a', borda: '#cc000033'     },
}

function formatNumero(n: number) {
  return `PROP-${String(n).padStart(3, '0')}`
}

function formatData(d: Date | string) {
  return new Date(d).toLocaleDateString('pt-BR')
}

export default async function PropostaDetalhePage({ params }: { params: { id: string } }) {
  const proposta = await buscarProposta(params.id)
  if (!proposta) notFound()

  const cfg = STATUS_CFG[proposta.status]

  const totalGeral = proposta.secoes.reduce(
    (acc, s) => acc + s.itens.reduce((a, i) => a + Number(i.valorTotal), 0),
    0
  )

  const card: React.CSSProperties = {
    background: '#111', border: '1px solid #222', borderRadius: '8px', padding: '20px 24px',
  }
  const label: React.CSSProperties = {
    fontSize: '0.7rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.07em',
    fontWeight: 600, marginBottom: '6px',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '900px', paddingBottom: '48px' }}>

      {/* Header */}
      <div>
        <Link href='/propostas' style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#555', textDecoration: 'none', marginBottom: '12px' }}>
          <ArrowLeft size={13} /> Voltar para Propostas
        </Link>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <h1 style={{ fontFamily: 'var(--font-barlow-condensed),sans-serif', fontWeight: 700, fontSize: '1.6rem', color: '#f0f0f0', margin: 0 }}>
                {formatNumero(proposta.numero)}
              </h1>
              <span style={{ background: cfg.bg, border: `1px solid ${cfg.borda}`, borderRadius: '5px', padding: '3px 12px', fontSize: '0.72rem', color: cfg.cor, fontWeight: 700, textTransform: 'uppercase' }}>
                {cfg.label}
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#666', margin: '4px 0 0' }}>{proposta.cliente.nome}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <BotaoStatusProposta propostaId={proposta.id} statusAtual={proposta.status} />
            <BotaoExportarPDFProposta propostaId={proposta.id} />
          </div>
        </div>
      </div>

      {/* Metadados */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
        {[
          { label: 'Emitida em',    val: formatData(proposta.createdAt) },
          { label: 'Validade',      val: `${proposta.validadeDias} dias` },
          { label: 'Total geral',   val: formatCurrency(totalGeral) },
          { label: 'Seções',        val: `${proposta.secoes.length} seção(ões)` },
        ].map(({ label: l, val }) => (
          <div key={l} style={card}>
            <p style={label}>{l}</p>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e0e0e0', margin: 0 }}>{val}</p>
          </div>
        ))}
      </div>

      {/* Cliente */}
      <div style={card}>
        <p style={label}>Cliente</p>
        <p style={{ fontSize: '1rem', fontWeight: 600, color: '#f0f0f0', margin: '0 0 8px' }}>{proposta.cliente.nome}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 20px' }}>
          {proposta.cliente.responsavel && <span style={{ fontSize: '0.82rem', color: '#777' }}>Responsável: <span style={{ color: '#ccc' }}>{proposta.cliente.responsavel}</span></span>}
          {proposta.cliente.cnpj        && <span style={{ fontSize: '0.82rem', color: '#777' }}>CNPJ: <span style={{ color: '#ccc' }}>{proposta.cliente.cnpj}</span></span>}
          {proposta.cliente.telefone    && <span style={{ fontSize: '0.82rem', color: '#777' }}>Telefone: <span style={{ color: '#ccc' }}>{proposta.cliente.telefone}</span></span>}
          {proposta.cliente.email       && <span style={{ fontSize: '0.82rem', color: '#777' }}>E-mail: <span style={{ color: '#ccc' }}>{proposta.cliente.email}</span></span>}
        </div>
      </div>

      {/* Apresentação */}
      {proposta.apresentacaoEmpresa && (
        <div style={card}>
          <p style={label}>Apresentação da Empresa</p>
          <p style={{ fontSize: '0.875rem', color: '#aaa', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>
            {proposta.apresentacaoEmpresa}
          </p>
        </div>
      )}

      {/* Seções de equipamentos */}
      {proposta.secoes.map((secao) => {
        const subtotal = secao.itens.reduce((a, i) => a + Number(i.valorTotal), 0)
        return (
          <div key={secao.id} style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #1e1e1e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-barlow-condensed),sans-serif', fontWeight: 700, fontSize: '1rem', color: '#f0f0f0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {secao.nome}
              </span>
              <span style={{ fontFamily: 'var(--font-barlow-condensed),sans-serif', fontSize: '1rem', fontWeight: 700, color: '#cc0000' }}>
                {formatCurrency(subtotal)}
              </span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.855rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                  {['Descrição', 'Qtd', 'Valor Unit.', 'Total'].map((h) => (
                    <th key={h} style={{ padding: '9px 18px', textAlign: h === 'Descrição' ? 'left' : 'right', fontSize: '0.65rem', color: '#444', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {secao.itens.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #181818' }}>
                    <td style={{ padding: '11px 18px', color: '#e0e0e0' }}>{item.descricao}</td>
                    <td style={{ padding: '11px 18px', color: '#888', textAlign: 'right' }}>{item.quantidade}</td>
                    <td style={{ padding: '11px 18px', color: '#888', textAlign: 'right' }}>{formatCurrency(Number(item.valorUnitario))}</td>
                    <td style={{ padding: '11px 18px', color: '#fff', fontWeight: 700, textAlign: 'right' }}>{formatCurrency(Number(item.valorTotal))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      })}

      {/* Total Geral */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ background: '#111', border: '1px solid #cc000033', borderRadius: '8px', padding: '16px 28px', textAlign: 'right' }}>
          <p style={{ fontSize: '0.7rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 4px' }}>Total Geral</p>
          <p style={{ fontFamily: 'var(--font-barlow-condensed),sans-serif', fontSize: '1.6rem', fontWeight: 900, color: '#cc0000', margin: 0 }}>
            {formatCurrency(totalGeral)}
          </p>
        </div>
      </div>

      {/* Condições comerciais */}
      {proposta.condicoes.length > 0 && (
        <div style={card}>
          <p style={label}>Condições Comerciais</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
            {proposta.condicoes.map((c) => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0d0d0d', border: '1px solid #222', borderRadius: '6px', padding: '12px 16px', gap: '12px' }}>
                <div>
                  <p style={{ fontWeight: 600, color: '#e0e0e0', margin: '0 0 2px', fontSize: '0.9rem' }}>{c.titulo}</p>
                  {c.descricao && <p style={{ fontSize: '0.8rem', color: '#666', margin: 0 }}>{c.descricao}</p>}
                </div>
                <span style={{ fontFamily: 'var(--font-barlow-condensed),sans-serif', fontSize: '1.1rem', fontWeight: 700, color: '#cc0000', whiteSpace: 'nowrap' }}>
                  {formatCurrency(Number(c.valor))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Escopo de Instalação */}
      {proposta.escopoInstalacao && (
        <div style={card}>
          <p style={label}>Escopo de Instalação</p>
          <p style={{ fontSize: '0.875rem', color: '#aaa', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>
            {proposta.escopoInstalacao}
          </p>
        </div>
      )}

      {/* Observações */}
      {proposta.observacoes && (
        <div style={card}>
          <p style={label}>Observações</p>
          <p style={{ fontSize: '0.875rem', color: '#aaa', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>
            {proposta.observacoes}
          </p>
        </div>
      )}
    </div>
  )
}
