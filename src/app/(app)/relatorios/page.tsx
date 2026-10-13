export const dynamic = 'force-dynamic'

import { buscarDadosRelatorios } from './queries'
import { GraficoReceitaDespesa }    from '@/components/relatorios/GraficoReceitaDespesa'
import { GraficoDespesasCategoria } from '@/components/relatorios/GraficoDespesasCategoria'
import { BotoesExportacao }         from '@/components/relatorios/BotoesExportacao'
import { formatCurrency } from '@/lib/utils'
import {
  TrendingUp, TrendingDown, Wallet,
  Building2, FileSignature,
} from 'lucide-react'

type Props = { searchParams: { ano?: string } }

function KpiCard({ label, valor, cor, icon, sub }: {
  label: string; valor: string; cor: string
  icon: React.ReactNode; sub?: string
}) {
  return (
    <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', color: '#666' }}>
        <span style={{ color: cor }}>{icon}</span>
        <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>{label}</span>
      </div>
      <p style={{ fontFamily: 'var(--font-heading),sans-serif', fontWeight: 900, fontSize: '1.6rem', color: cor, margin: '0 0 3px', letterSpacing: '0.02em', lineHeight: 1 }}>
        {valor}
      </p>
      {sub && <p style={{ fontSize: '0.72rem', color: '#555', margin: 0 }}>{sub}</p>}
    </div>
  )
}

function Section({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <h3 style={{ fontFamily: 'var(--font-heading),sans-serif', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#888', margin: 0 }}>
          {titulo}
        </h3>
      </div>
      <div style={{ padding: '20px' }}>{children}</div>
    </div>
  )
}

export default async function RelatoriosPage({ searchParams }: Props) {
  const ano = parseInt(searchParams.ano ?? String(new Date().getFullYear()))
  const dados = await buscarDadosRelatorios(ano)
  const { meses, despPorCategoria, lancamentos, kpis } = dados

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '48px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading),sans-serif', fontWeight: 600, fontSize: '1.5rem', color: '#f0f0f0', margin: 0 }}>
            Relatórios
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#666', margin: '4px 0 0' }}>Ano fiscal {ano}</p>
        </div>
        <BotoesExportacao lancamentos={lancamentos as Parameters<typeof BotoesExportacao>[0]['lancamentos']} ano={ano} />
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
        <KpiCard label="Receita total"     valor={formatCurrency(kpis.totalReceita)}      cor="#22c55e" icon={<TrendingUp size={14} />}    sub={`Ano ${ano}`} />
        <KpiCard label="Despesa total"     valor={formatCurrency(kpis.totalDespesa)}      cor="#f87171" icon={<TrendingDown size={14} />}   sub={`Ano ${ano}`} />
        <KpiCard label="Saldo do ano"      valor={formatCurrency(kpis.saldoAno)}          cor={kpis.saldoAno >= 0 ? '#22c55e' : '#f87171'} icon={<Wallet size={14} />} sub="Receita − Despesa" />
        <KpiCard label="Rec. recorrente"   valor={formatCurrency(kpis.receitaRecorrente)} cor="#3b82f6" icon={<FileSignature size={14} />}  sub="Contratos ativos/mês" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
        <KpiCard label="Clientes ativos"   valor={String(kpis.clientesAtivos)}   cor="#22c55e" icon={<Building2 size={14} />} />
        <KpiCard label="Contratos ativos"  valor={String(kpis.contratosAtivos)}  cor="#3b82f6" icon={<FileSignature size={14} />} />
      </div>

      {/* Gráfico principal: Receita x Despesa */}
      <Section titulo={`Receita × Despesa por mês — ${ano}`}>
        <GraficoReceitaDespesa dados={meses} />
      </Section>

      {/* Despesas por categoria */}
      <Section titulo="Despesas por categoria">
        <GraficoDespesasCategoria dados={despPorCategoria} />
      </Section>

      {/* Tabela: saldo mensal */}
      <Section titulo="Saldo mensal detalhado">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['Mês', 'Receitas', 'Despesas', 'Saldo'].map((h) => (
                <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '0.68rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {meses.map((m) => (
              <tr key={m.label} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '10px 12px', fontFamily: 'var(--font-heading),sans-serif', fontWeight: 700, color: '#888', textTransform: 'uppercase' }}>{m.label}</td>
                <td style={{ padding: '10px 12px', color: '#22c55e', fontWeight: 600 }}>{m.receitas > 0 ? formatCurrency(m.receitas) : '—'}</td>
                <td style={{ padding: '10px 12px', color: '#f87171', fontWeight: 600 }}>{m.despesas > 0 ? formatCurrency(m.despesas) : '—'}</td>
                <td style={{ padding: '10px 12px', fontFamily: 'var(--font-heading),sans-serif', fontWeight: 700, color: m.saldo >= 0 ? '#22c55e' : '#f87171' }}>
                  {m.receitas === 0 && m.despesas === 0 ? '—' : (m.saldo >= 0 ? '+' : '') + formatCurrency(m.saldo)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: '2px solid rgba(204,0,0,0.3)', background: 'rgba(204,0,0,0.05)' }}>
              <td style={{ padding: '12px 12px', fontFamily: 'var(--font-heading),sans-serif', fontWeight: 700, color: '#cc0000', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.06em' }}>Total</td>
              <td style={{ padding: '12px 12px', color: '#22c55e', fontWeight: 700 }}>{formatCurrency(kpis.totalReceita)}</td>
              <td style={{ padding: '12px 12px', color: '#f87171', fontWeight: 700 }}>{formatCurrency(kpis.totalDespesa)}</td>
              <td style={{ padding: '12px 12px', fontFamily: 'var(--font-heading),sans-serif', fontWeight: 900, fontSize: '1rem', color: kpis.saldoAno >= 0 ? '#22c55e' : '#f87171' }}>
                {formatCurrency(kpis.saldoAno)}
              </td>
            </tr>
          </tfoot>
        </table>
      </Section>

    </div>
  )
}
