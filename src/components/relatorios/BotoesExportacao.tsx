'use client'

import { FileText, Sheet } from 'lucide-react'

type Lancamento = {
  data: Date | string
  descricao: string
  tipo: string
  categoria: string
  valor: { toNumber?(): number } | number | string
  cliente: { nome: string } | null
}

function toNum(v: { toNumber?(): number } | number | string): number {
  if (typeof v === 'object' && v !== null && 'toNumber' in v && typeof v.toNumber === 'function') return v.toNumber()
  return Number(v)
}

function formatBRL(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function formatData(d: Date | string) {
  return new Date(d).toLocaleDateString('pt-BR')
}

function downloadCSV(filename: string, headers: string[], rows: string[][]) {
  const bom  = '﻿'
  const sep  = ';'
  const lines = [headers.join(sep), ...rows.map((r) => r.join(sep))]
  const blob  = new Blob([bom + lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url   = URL.createObjectURL(blob)
  const a     = document.createElement('a')
  a.href      = url
  a.download  = filename
  a.click()
  URL.revokeObjectURL(url)
}

function downloadPDF(titulo: string, html: string) {
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
    <title>${titulo}</title>
    <style>
      body { font-family: Arial, sans-serif; font-size: 12px; color: #000; padding: 24px; }
      h1   { font-size: 20px; margin-bottom: 4px; }
      p    { margin: 2px 0 12px; color: #555; }
      table { width: 100%; border-collapse: collapse; }
      th   { background: #f0f0f0; padding: 6px 10px; text-align: left; font-size: 11px; text-transform: uppercase; }
      td   { padding: 6px 10px; border-bottom: 1px solid #e5e5e5; }
      .red { color: #cc0000; }
    </style>
  </head><body>${html}<script>window.onload=()=>{window.print();window.close()}<\/script></body></html>`)
  win.document.close()
}

type Props = {
  lancamentos: Lancamento[]
  ano:         number
}

export function BotoesExportacao({ lancamentos, ano }: Props) {

  function exportarCSVFinanceiro() {
    const headers = ['Data', 'Descrição', 'Tipo', 'Categoria', 'Cliente', 'Valor (R$)']
    const rows = lancamentos.map((l) => [
      formatData(l.data),
      `"${l.descricao}"`,
      l.tipo,
      l.categoria,
      l.cliente?.nome ?? '',
      toNum(l.valor).toFixed(2).replace('.', ','),
    ])
    downloadCSV(`financeiro-${ano}.csv`, headers, rows)
  }

  function exportarPDFFinanceiro() {
    const totalRec  = lancamentos.filter((l) => l.tipo === 'RECEITA').reduce((s, l) => s + toNum(l.valor), 0)
    const totalDesp = lancamentos.filter((l) => l.tipo === 'DESPESA').reduce((s, l) => s + toNum(l.valor), 0)
    const rows = lancamentos
      .slice(0, 50)
      .map((l) => `<tr>
        <td>${formatData(l.data)}</td>
        <td>${l.descricao}</td>
        <td>${l.tipo}</td>
        <td>${l.categoria}</td>
        <td>${l.cliente?.nome ?? '—'}</td>
        <td${l.tipo === 'RECEITA' ? ' class="red"' : ''}>${formatBRL(toNum(l.valor))}</td>
      </tr>`).join('')

    downloadPDF(`Relatório Financeiro ${ano}`, `
      <h1>Relatório Financeiro — ${ano}</h1>
      <p>Total Receitas: <strong>${formatBRL(totalRec)}</strong> &nbsp;|&nbsp;
         Total Despesas: <strong>${formatBRL(totalDesp)}</strong> &nbsp;|&nbsp;
         Saldo: <strong>${formatBRL(totalRec - totalDesp)}</strong></p>
      <table>
        <thead><tr><th>Data</th><th>Descrição</th><th>Tipo</th><th>Categoria</th><th>Cliente</th><th>Valor</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      ${lancamentos.length > 50 ? `<p><em>Exibindo os 50 primeiros de ${lancamentos.length} registros.</em></p>` : ''}
    `)
  }

  const btnBase: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: '7px',
    padding: '8px 16px', borderRadius: '7px', border: 'none',
    fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
    color: '#fff', letterSpacing: '0.03em', transition: 'opacity 0.15s',
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      <button onClick={exportarPDFFinanceiro}
        style={{ ...btnBase, background: '#cc0000' }}
        title="Exportar relatório financeiro em PDF"
      >
        <FileText size={14} /> PDF Financeiro
      </button>
      <button onClick={exportarCSVFinanceiro}
        style={{ ...btnBase, background: '#166534' }}
        title="Exportar lançamentos em CSV (Excel)"
      >
        <Sheet size={14} /> CSV Financeiro
      </button>
    </div>
  )
}
