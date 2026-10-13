import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

// ── Cores ──────────────────────────────────────────────────────────────────────
const COR_VERMELHO: [number, number, number] = [204, 0,   0  ]
const COR_TEXTO:    [number, number, number] = [34,  34,  34 ]
const COR_CINZA:    [number, number, number] = [120, 120, 120]
const COR_BG_BOX:   [number, number, number] = [245, 245, 245]
const COR_BG_THEAD: [number, number, number] = [34,  34,  34 ]

// ── Tipo ───────────────────────────────────────────────────────────────────────
export type PropostaPDFData = {
  numero:              number
  status:              string
  apresentacaoEmpresa: string | null
  escopoInstalacao:    string | null
  observacoes:         string | null
  validadeDias:        number
  totalGeral:          number
  createdAt:           Date | string
  cliente: {
    nome:        string
    responsavel: string | null
    cnpj:        string | null
    telefone:    string | null
    email:       string | null
  }
  secoes: Array<{
    nome:  string
    itens: Array<{
      descricao:     string
      quantidade:    number
      valorUnitario: number
      valorTotal:    number
    }>
  }>
  condicoes: Array<{
    titulo:    string
    valor:     number
    descricao: string | null
  }>
  configuracao: {
    nomeEmpresa: string
    cnpj:        string | null
    telefone:    string | null
    email:       string | null
    site:        string | null
    endereco:    string | null
    cidade:      string | null
    estado:      string | null
    cep:         string | null
    logoUrl:     string | null
  } | null
}

// ── Utilitários ────────────────────────────────────────────────────────────────

function formatBRL(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}
function formatData(d: Date | string) {
  return new Date(d).toLocaleDateString('pt-BR')
}
function formatHora(d: Date) {
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}
function formatNumero(n: number) {
  return `PROP-${String(n).padStart(3, '0')}`
}
function slugify(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'cliente'
}

// ── Parser do escopo ───────────────────────────────────────────────────────────
// Suporta: "1.\tTítulo" + "• subitem" (formato do banco)
function parsearEscopo(texto: string): Array<{ titulo: string; itens: string[] }> {
  const linhas = texto.split('\n').map(l => l.trim())
  const secoes: Array<{ titulo: string; itens: string[] }> = []
  let atual: { titulo: string; itens: string[] } | null = null

  for (const linha of linhas) {
    if (!linha) {
      if (atual) { secoes.push(atual); atual = null }
      continue
    }
    const mTitulo = linha.match(/^(\d+)\.\s+(.+)/)
    if (mTitulo) {
      if (atual) secoes.push(atual)
      atual = { titulo: mTitulo[2].trim(), itens: [] }
      continue
    }
    // bullet com ou sem espaço após o símbolo
    const mBullet = linha.match(/^[•‣◦\-\*]\s*(.+)/)
    if (mBullet) {
      if (!atual) atual = { titulo: '', itens: [] }
      atual.itens.push(mBullet[1].trim())
      continue
    }
    if (!atual) atual = { titulo: linha, itens: [] }
    else atual.itens.push(linha)
  }
  if (atual) secoes.push(atual)
  return secoes.filter(s => s.titulo || s.itens.length > 0)
}

// ── Helpers de layout ──────────────────────────────────────────────────────────

async function carregarLogo(url: string): Promise<{ data: string; format: 'PNG' | 'JPEG' } | null> {
  try {
    const res = await fetch(url, { mode: 'cors' })
    if (!res.ok) return null
    const blob = await res.blob()
    const format: 'PNG' | 'JPEG' = blob.type.includes('jpeg') || blob.type.includes('jpg') ? 'JPEG' : 'PNG'
    const data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror  = () => reject(new Error('Falha ao ler logo'))
      reader.readAsDataURL(blob)
    })
    return { data, format }
  } catch {
    return null
  }
}

function verificarEspaco(doc: jsPDF, y: number, necessario: number, margin: number): number {
  const pageH = doc.internal.pageSize.getHeight()
  if (y + necessario > pageH - 28) {
    doc.addPage()
    return margin
  }
  return y
}

// ── Função principal ───────────────────────────────────────────────────────────

export async function gerarPropostaPDF(prop: PropostaPDFData): Promise<void> {
  const doc   = new jsPDF()
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 14
  let y = margin

  const empresa = prop.configuracao

  // ── CABEÇALHO ────────────────────────────────────────────────────────────────

  let logoH = 0
  if (empresa?.logoUrl) {
    const logo = await carregarLogo(empresa.logoUrl)
    if (logo) {
      doc.addImage(logo.data, logo.format, margin, y, 22, 22)
      logoH = 22
    }
  }

  const leftX = logoH > 0 ? margin + 28 : margin

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(...COR_TEXTO)
  doc.text(empresa?.nomeEmpresa ?? 'PortariaPro', leftX, y + 7)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...COR_CINZA)

  const linhaContato = [
    empresa?.cnpj    && `CNPJ ${empresa.cnpj}`,
    empresa?.telefone,
    empresa?.email,
    empresa?.site,
  ].filter(Boolean).join('  ·  ')
  if (linhaContato) doc.text(linhaContato, leftX, y + 12)

  const linhaEnd = [
    empresa?.endereco,
    [empresa?.cidade, empresa?.estado].filter(Boolean).join(' - '),
    empresa?.cep,
  ].filter(Boolean).join('  ·  ')
  if (linhaEnd) doc.text(linhaEnd, leftX, y + 16.5)

  y += Math.max(logoH, 20) + 4

  // Linha separadora vermelha
  doc.setDrawColor(...COR_VERMELHO)
  doc.setLineWidth(1.2)
  doc.line(margin, y, pageW - margin, y)
  y += 8

  // Título
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(...COR_TEXTO)
  doc.text('PROPOSTA COMERCIAL', margin, y + 5)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...COR_VERMELHO)
  doc.text(formatNumero(prop.numero), pageW - margin, y, { align: 'right' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...COR_CINZA)
  doc.text(`Emitida em ${formatData(prop.createdAt)}`, pageW - margin, y + 5,  { align: 'right' })
  doc.text(`Válida por ${prop.validadeDias} dias`,     pageW - margin, y + 10, { align: 'right' })

  y += 14

  // ── DADOS DO CLIENTE ──────────────────────────────────────────────────────────

  doc.setFillColor(...COR_BG_BOX)
  doc.rect(margin, y, pageW - 2 * margin, 26, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...COR_VERMELHO)
  doc.text('DESTINATÁRIO', margin + 4, y + 6)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...COR_TEXTO)
  doc.text(prop.cliente.nome, margin + 4, y + 13)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...COR_CINZA)
  const infoCliente = [
    prop.cliente.responsavel && `Resp.: ${prop.cliente.responsavel}`,
    prop.cliente.cnpj        && `CNPJ: ${prop.cliente.cnpj}`,
    prop.cliente.telefone    && prop.cliente.telefone,
    prop.cliente.email       && prop.cliente.email,
  ].filter(Boolean).join('  ·  ')
  if (infoCliente) doc.text(infoCliente, margin + 4, y + 20)

  y += 32

  // ── APRESENTAÇÃO DA EMPRESA ───────────────────────────────────────────────────

  if (prop.apresentacaoEmpresa?.trim()) {
    y = verificarEspaco(doc, y, 30, margin)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...COR_VERMELHO)
    doc.text('SOBRE NÓS', margin, y)
    y += 5

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...COR_TEXTO)
    const linhasApres = doc.splitTextToSize(prop.apresentacaoEmpresa.trim(), pageW - 2 * margin)
    doc.text(linhasApres, margin, y)
    y += linhasApres.length * 4.5 + 8
  }

  // ── SEÇÕES DE EQUIPAMENTOS ────────────────────────────────────────────────────

  for (const secao of prop.secoes) {
    if (secao.itens.length === 0) continue
    const subtotal = secao.itens.reduce((a, i) => a + i.valorTotal, 0)

    y = verificarEspaco(doc, y, 24, margin)

    doc.setFillColor(...COR_BG_THEAD)
    doc.rect(margin, y, pageW - 2 * margin, 8, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(255, 255, 255)
    doc.text(secao.nome.toUpperCase(), margin + 4, y + 5.5)
    doc.text(formatBRL(subtotal), pageW - margin - 4, y + 5.5, { align: 'right' })

    y += 8

    autoTable(doc, {
      startY: y,
      head: [['Descrição', 'Qtd', 'Valor Unit.', 'Total']],
      body: secao.itens.map(i => [
        i.descricao,
        String(i.quantidade),
        formatBRL(i.valorUnitario),
        formatBRL(i.valorTotal),
      ]),
      margin: { left: margin, right: margin },
      styles:      { fontSize: 9, cellPadding: 2.5 },
      headStyles:  { fillColor: COR_VERMELHO, textColor: 255, fontStyle: 'bold', fontSize: 8.5 },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      columnStyles: {
        1: { cellWidth: 14, halign: 'center' },
        2: { cellWidth: 28, halign: 'right'  },
        3: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
      },
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = ((doc as any).lastAutoTable?.finalY ?? y) + 6
  }

  // ── TOTAL GERAL ───────────────────────────────────────────────────────────────

  y = verificarEspaco(doc, y, 20, margin)

  doc.setDrawColor(...COR_VERMELHO)
  doc.setLineWidth(0.5)
  doc.line(pageW - margin - 80, y, pageW - margin, y)
  y += 6

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...COR_VERMELHO)
  doc.text('TOTAL GERAL:', pageW - margin - 80, y, { align: 'left' })
  doc.text(formatBRL(prop.totalGeral), pageW - margin, y, { align: 'right' })
  y += 10

  // ── CONDIÇÕES COMERCIAIS ──────────────────────────────────────────────────────

  if (prop.condicoes.length > 0) {
    y = verificarEspaco(doc, y, 30, margin)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...COR_VERMELHO)
    doc.text('CONDIÇÕES COMERCIAIS', margin, y)
    y += 5

    autoTable(doc, {
      startY: y,
      head: [['Modalidade', 'Descrição', 'Valor']],
      body: prop.condicoes.map(c => [c.titulo, c.descricao ?? '—', formatBRL(c.valor)]),
      margin: { left: margin, right: margin },
      styles:      { fontSize: 9, cellPadding: 2.5 },
      headStyles:  { fillColor: COR_VERMELHO, textColor: 255, fontStyle: 'bold', fontSize: 8.5 },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      columnStyles: { 2: { halign: 'right', fontStyle: 'bold', cellWidth: 30 } },
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = ((doc as any).lastAutoTable?.finalY ?? y) + 8
  }

  // ── ESCOPO DE INSTALAÇÃO ──────────────────────────────────────────────────────

  if (prop.escopoInstalacao?.trim()) {
    y = verificarEspaco(doc, y, 30, margin)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...COR_VERMELHO)
    doc.text('ESCOPO DE INSTALAÇÃO', margin, y)
    y += 3

    doc.setDrawColor(...COR_VERMELHO)
    doc.setLineWidth(0.5)
    doc.line(margin, y, pageW - margin, y)
    y += 5

    const secoesParsed = parsearEscopo(prop.escopoInstalacao.trim())

    // ── Constantes do layout ────────────────────────────────────────────────────
    const COR_CARD_BG: [number, number, number] = [230, 230, 235]  // R≠B → RGB, mais escuro
    const COR_CARD_BD: [number, number, number] = [200, 200, 210]  // borda cinza marcada
    const COR_ITEM:    [number, number, number] = [85,  85,  90 ]  // texto itens

    const colGap      = 4
    const colW        = (pageW - 2 * margin - colGap) / 2
    const brdW        = 2      // borda vermelha esquerda (mm)
    const padH        = 4      // padding horizontal interno
    const larguraUtil = colW - 10  // largura útil para texto (colW - paddings)
    const padTop      = 8      // espaço acima do título (inclui a área do título)
    const titleH      = 6      // altura da linha de título
    const lineH       = 4.5    // altura por linha de texto de item
    const padBot      = 6      // padding base do card

    // ── Pré-calcular linhas quebradas e alturas reais de cada seção ─────────────
    // Precisa do font definido para splitTextToSize funcionar corretamente
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)

    type SecaoPrec = {
      titulo:        string
      linhasPorItem: string[][]  // linhas quebradas por subitem
      altCard:       number      // altura real do card
    }

    const secoesPrec: SecaoPrec[] = secoesParsed.map(s => {
      const linhasPorItem = s.itens.map(item =>
        doc.splitTextToSize('•  ' + item, larguraUtil) as string[]
      )
      const totalLinhas = linhasPorItem.reduce((acc, l) => acc + l.length, 0)
      // Fórmula: 8 (pad top) + 6 (título) + linhas×4.5 + 6 (pad bottom)
      const altCard = padTop + titleH + totalLinhas * lineH + padBot
      return { titulo: s.titulo, linhasPorItem, altCard }
    })

    // ── Função de desenho de um card ────────────────────────────────────────────
    const desenharCard = (
      sec: SecaoPrec,
      cx: number, cy: number, cw: number, ch: number, num: number
    ) => {
      // ── Fundo + borda: fill ANTES de qualquer text, stroke logo após ──────────

      // 1. Preparar cores de fill e stroke antes do primeiro rect
      doc.setDrawColor(...COR_CARD_BD)
      doc.setLineWidth(0.4)
      doc.setFillColor(...COR_CARD_BG)

      // 2. Fill (fundo cinza) — imediatamente seguido de Stroke (borda)
      doc.rect(cx, cy, cw, ch, 'F')
      doc.rect(cx, cy, cw, ch, 'S')

      // 3. Borda esquerda vermelha 2mm — fill próprio, rect imediato, sem texto entre eles
      doc.setFillColor(204, 0, 0)
      doc.rect(cx, cy, brdW, ch, 'F')

      // ── Texto: somente após todos os rects desenhados ─────────────────────────

      const xT   = cx + brdW + padH
      const yHdr = cy + padTop

      // Número vermelho + título negrito na mesma linha
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8.5)
      doc.setTextColor(...COR_VERMELHO)
      doc.text(String(num) + '.', xT, yHdr)
      const numW = doc.getTextWidth(String(num) + '. ')

      if (sec.titulo) {
        doc.setTextColor(...COR_TEXTO)
        doc.text(
          doc.splitTextToSize(sec.titulo, cw - brdW - padH * 2 - numW),
          xT + numW,
          yHdr
        )
      }

      // Subitens — cada linha a 4.5mm de intervalo, sem setFillColor entre elas
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(...COR_ITEM)

      let yIt = cy + padTop + titleH
      for (const linhas of sec.linhasPorItem) {
        for (const linha of linhas) {
          doc.text(linha, xT, yIt)
          yIt += lineH
        }
      }
    }

    // ── Loop 2 colunas ──────────────────────────────────────────────────────────
    for (let i = 0; i < secoesPrec.length; i += 2) {
      const sA   = secoesPrec[i]
      const sB   = secoesPrec[i + 1] ?? null
      const rowH = Math.max(sA.altCard, sB ? sB.altCard : 0)

      y = verificarEspaco(doc, y, rowH + 2, margin)

      desenharCard(sA, margin,                    y, colW, rowH, i + 1)
      if (sB) desenharCard(sB, margin + colW + colGap, y, colW, rowH, i + 2)

      y += rowH + 2
    }
    y += 3
  }

  // ── OBSERVAÇÕES ───────────────────────────────────────────────────────────────

  if (prop.observacoes?.trim()) {
    y = verificarEspaco(doc, y, 24, margin)

    const linhasObs = doc.splitTextToSize(prop.observacoes.trim(), pageW - 2 * margin - 8)
    const obsH = linhasObs.length * 4.5 + 12

    doc.setFillColor(...COR_BG_BOX)
    doc.rect(margin, y, pageW - 2 * margin, obsH, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...COR_VERMELHO)
    doc.text('OBSERVAÇÕES', margin + 4, y + 6)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...COR_TEXTO)
    doc.text(linhasObs, margin + 4, y + 11)

    y += obsH + 4
  }

  // ── RODAPÉ ────────────────────────────────────────────────────────────────────

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalPaginas = (doc as any).internal.getNumberOfPages()
  const agora = new Date()

  for (let p = 1; p <= totalPaginas; p++) {
    doc.setPage(p)
    const yRodape = pageH - 18

    doc.setDrawColor(220, 220, 220)
    doc.setLineWidth(0.3)
    doc.line(margin, yRodape, pageW - margin, yRodape)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...COR_CINZA)

    doc.text(
      `Esta proposta é válida por ${prop.validadeDias} dias a partir da emissão.`,
      margin, yRodape + 4
    )
    const contato = [empresa?.telefone, empresa?.email].filter(Boolean).join(' | ')
    if (contato) doc.text(`Contato: ${contato}`, margin, yRodape + 8)
    doc.text(`Gerado em ${formatData(agora)} às ${formatHora(agora)}`, margin, yRodape + 12)
    doc.text(`Página ${p} de ${totalPaginas}`, pageW - margin, yRodape + 12, { align: 'right' })
  }

  // ── DOWNLOAD ──────────────────────────────────────────────────────────────────

  doc.save(`proposta-${formatNumero(prop.numero)}-${slugify(prop.cliente.nome)}.pdf`)
}
