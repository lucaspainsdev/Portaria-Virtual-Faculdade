import { jsPDF } from 'jspdf'

const COR_VERMELHO: [number, number, number] = [204, 0, 0]
const COR_TEXTO:    [number, number, number] = [34,  34, 34]
const COR_CINZA:    [number, number, number] = [120, 120, 120]
const COR_BG_BOX:   [number, number, number] = [245, 245, 245]

const STATUS_LABEL: Record<string, string> = {
  ATIVO:     'Ativo',
  SUSPENSO:  'Suspenso',
  ENCERRADO: 'Encerrado',
}

const CLAUSULAS_FIXAS = [
  {
    titulo: 'CLÁUSULA 1 – DO OBJETO',
    texto: 'O presente contrato tem por objeto a prestação de serviços de portaria virtual e segurança eletrônica pela CONTRATADA ao CONTRATANTE, compreendendo: (a) monitoramento remoto das dependências do condomínio 24 horas por dia, 7 dias por semana, inclusive feriados; (b) controle de acesso digital com reconhecimento facial, cartão de proximidade e controle remoto; (c) operação e manutenção dos equipamentos de CFTV, interfonia e cerca elétrica instalados; (d) suporte técnico especializado; (e) fornecimento de relatórios mensais de ocorrências e acessos.',
  },
  {
    titulo: 'CLÁUSULA 2 – DO PRAZO',
    texto: 'O presente contrato vigorará pelo prazo mínimo de 36 (trinta e seis) meses, contados da data de início dos serviços. Findo o prazo mínimo, o contrato será automaticamente prorrogado por prazo indeterminado, salvo manifestação contrária de qualquer das partes, mediante notificação por escrito com antecedência mínima de 30 (trinta) dias. A rescisão imotivada durante o prazo mínimo sujeitará a parte infratora às penalidades previstas na Cláusula 6.',
  },
  {
    titulo: 'CLÁUSULA 3 – DO VALOR E FORMA DE PAGAMENTO',
    texto: 'O CONTRATANTE pagará à CONTRATADA o valor mensal estabelecido nos dados do contrato, mediante boleto bancário ou transferência, com vencimento no dia acordado de cada mês. O atraso no pagamento implicará em multa de 2% (dois por cento) sobre o valor da parcela, acrescida de juros moratórios de 1% (um por cento) ao mês e correção monetária pelo IPCA. O valor mensal será reajustado anualmente na data de aniversário do contrato pelo índice IPCA acumulado nos 12 meses anteriores, ou pelo índice oficial que o substitua. Em caso de inadimplência superior a 30 (trinta) dias, a CONTRATADA poderá suspender os serviços até regularização, sem prejuízo das penalidades cabíveis.',
  },
  {
    titulo: 'CLÁUSULA 4 – DAS OBRIGAÇÕES DA CONTRATADA',
    texto: 'São obrigações da CONTRATADA:\na) Prestar os serviços de monitoramento remoto ininterruptamente, 24 horas por dia, 7 dias por semana, incluindo finais de semana e feriados;\nb) Manter central de monitoramento própria com operadores treinados e certificados em segurança patrimonial;\nc) Realizar manutenção preventiva mensal nos equipamentos instalados, incluindo limpeza, lubrificação, ajustes e testes de funcionamento;\nd) Prestar atendimento técnico corretivo em até 4 horas para falhas críticas (sistema fora do ar) e até 24 horas para demais chamados;\ne) Manter sigilo absoluto sobre todas as informações, imagens e dados do CONTRATANTE, conforme a Lei Geral de Proteção de Dados (LGPD – Lei nº 13.709/2018);\nf) Disponibilizar equipe técnica própria, qualificada e certificada para instalação, manutenção e atendimento;\ng) Fornecer relatórios mensais detalhados de acessos, ocorrências e serviços realizados;\nh) Comunicar o CONTRATANTE imediatamente em caso de qualquer ocorrência ou irregularidade detectada no monitoramento;\ni) Manter cobertura de seguro de responsabilidade civil para os serviços prestados.',
  },
  {
    titulo: 'CLÁUSULA 5 – DAS OBRIGAÇÕES DO CONTRATANTE',
    texto: 'São obrigações do CONTRATANTE:\na) Efetuar o pagamento das mensalidades nas datas acordadas, conforme Cláusula 3;\nb) Garantir acesso às instalações do condomínio para realização de manutenções preventivas e corretivas, mediante agendamento prévio;\nc) Comunicar imediatamente à CONTRATADA qualquer falha, dano ou irregularidade observada nos equipamentos;\nd) Não permitir que terceiros não autorizados pela CONTRATADA interfiram, alterem, removam ou danifiquem os equipamentos instalados;\ne) Manter as instalações elétricas do condomínio em condições adequadas para o pleno funcionamento dos equipamentos;\nf) Informar à CONTRATADA com antecedência mínima de 5 (cinco) dias úteis sobre obras ou reformas que possam afetar os equipamentos instalados;\ng) Designar um responsável no condomínio (síndico ou administrador) como ponto de contato para comunicação com a CONTRATADA;\nh) Não ceder, transferir ou sublocar os serviços objeto deste contrato a terceiros sem prévia autorização por escrito da CONTRATADA.',
  },
  {
    titulo: 'CLÁUSULA 6 – DA RESCISÃO E MULTA',
    texto: '6.1. O presente contrato poderá ser rescindido: (a) por mútuo acordo entre as partes, formalizado por escrito; (b) por qualquer das partes, após o prazo mínimo de 36 meses, mediante aviso prévio por escrito de 30 dias; (c) por descumprimento das obrigações contratuais por qualquer das partes.\n6.2. A rescisão antecipada imotivada pelo CONTRATANTE antes do término do prazo mínimo de 36 meses implicará em multa equivalente a 30% (trinta por cento) do valor total das mensalidades restantes até o fim do prazo mínimo, com vencimento imediato.\n6.3. A CONTRATADA poderá rescindir o contrato sem ônus em caso de inadimplência do CONTRATANTE superior a 30 (trinta) dias, mediante notificação por escrito.\n6.4. Em caso de descumprimento de obrigações contratuais por qualquer das partes, a parte prejudicada deverá notificar a infratora por escrito, concedendo prazo de 15 (quinze) dias para regularização, antes de proceder à rescisão.',
  },
  {
    titulo: 'CLÁUSULA 7 – DO NÍVEL DE SERVIÇO (SLA)',
    texto: 'A CONTRATADA garante os seguintes níveis mínimos de serviço:\na) Disponibilidade do monitoramento remoto: mínimo de 99% (noventa e nove por cento) ao mês, excluídas manutenções programadas previamente comunicadas;\nb) Atendimento a chamados críticos (sistema de monitoramento fora do ar): até 4 (quatro) horas após abertura do chamado;\nc) Atendimento a chamados de manutenção corretiva não crítica: até 24 (vinte e quatro) horas após abertura do chamado;\nd) Manutenção preventiva: mínimo de 1 (uma) visita mensal agendada, com emissão de relatório técnico;\ne) Tempo de resposta para acionamentos de emergência (invasão, incêndio, pânico): até 3 (três) minutos para contato com o condomínio e acionamento das autoridades competentes.\nO descumprimento reiterado dos níveis de serviço acima, após notificação formal, facultará ao CONTRATANTE a rescisão sem multa.',
  },
  {
    titulo: 'CLÁUSULA 8 – DA PROTEÇÃO DE DADOS (LGPD)',
    texto: 'As partes se comprometem a cumprir todas as obrigações decorrentes da Lei Geral de Proteção de Dados (Lei nº 13.709/2018). A CONTRATADA, na qualidade de operadora dos dados, tratará as imagens e dados pessoais coletados exclusivamente para a finalidade de prestação dos serviços contratados, adotando medidas técnicas e organizacionais adequadas para garantir a segurança e confidencialidade das informações. Os dados coletados serão armazenados pelo prazo mínimo legal e descartados de forma segura após o encerramento contratual.',
  },
  {
    titulo: 'CLÁUSULA 9 – DO FORO',
    texto: 'As partes elegem o foro da Comarca de Campinas, Estado de São Paulo, como competente para dirimir quaisquer dúvidas, controvérsias ou litígios decorrentes do presente contrato, renunciando expressamente a qualquer outro, por mais privilegiado que seja. Antes de recorrer ao Poder Judiciário, as partes comprometem-se a buscar solução amigável mediante negociação direta ou mediação.',
  },
]

export type ContratoPDFData = {
  numero:                  string
  descricao:               string | null
  valorMensal:             number
  dataInicio:              Date | string
  dataFim:                 Date | string | null
  status:                  string
  observacoes:             string | null
  clausulasPersonalizadas: string | null
  createdAt:               Date | string
  cliente: {
    nome:        string
    responsavel: string | null
    cnpj:        string | null
    cpf:         string | null
    endereco:    string | null
    numero:      string | null
    bairro:      string | null
    cidade:      string | null
    estado:      string | null
    cep:         string | null
  }
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

// ─── Formatadores BR ─────────────────────────────────────────────────────────

function formatBRL(v: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function formatData(d: Date | string): string {
  return new Date(d).toLocaleDateString('pt-BR')
}

function formatDataExtenso(d: Date): string {
  return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatHora(d: Date): string {
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function slugify(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'cliente'
}

function montarEnderecoCliente(c: ContratoPDFData['cliente']): string {
  const linha1 = [
    c.endereco,
    c.numero && `nº ${c.numero}`,
    c.bairro,
  ].filter(Boolean).join(', ')
  const linha2 = [
    [c.cidade, c.estado].filter(Boolean).join(' - '),
    c.cep,
  ].filter(Boolean).join('  ·  ')
  return [linha1, linha2].filter(Boolean).join('  —  ')
}

function montarEnderecoEmpresa(e: NonNullable<ContratoPDFData['configuracao']>): string {
  const linha1 = e.endereco
  const linha2 = [
    [e.cidade, e.estado].filter(Boolean).join(' - '),
    e.cep,
  ].filter(Boolean).join('  ·  ')
  return [linha1, linha2].filter(Boolean).join('  —  ')
}

// ─── Carregar logo em base64 ─────────────────────────────────────────────────

async function carregarLogoBase64(
  url: string
): Promise<{ data: string; format: 'PNG' | 'JPEG' } | null> {
  try {
    const res = await fetch(url, { mode: 'cors' })
    if (!res.ok) return null
    const blob = await res.blob()
    const format: 'PNG' | 'JPEG' = blob.type.includes('jpeg') || blob.type.includes('jpg')
      ? 'JPEG'
      : 'PNG'
    const data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error('Falha ao ler logo'))
      reader.readAsDataURL(blob)
    })
    return { data, format }
  } catch {
    return null
  }
}

// ─── Função principal ────────────────────────────────────────────────────────

export async function gerarContratoPDF(contrato: ContratoPDFData): Promise<void> {
  const doc = new jsPDF()
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 14
  let y = margin

  const empresa = contrato.configuracao
  const dataInicio = new Date(contrato.dataInicio)
  const dataFim = contrato.dataFim ? new Date(contrato.dataFim) : null
  const diaVencimento = dataInicio.getDate()

  // ═══════════════════════════════════════════════════════════════════════════
  // PÁGINA 1 — CAPA
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Cabeçalho ─────────────────────────────────────────────────────────────

  let logoH = 0
  if (empresa?.logoUrl) {
    const logo = await carregarLogoBase64(empresa.logoUrl)
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
    empresa?.cnpj && `CNPJ ${empresa.cnpj}`,
    empresa?.telefone,
    empresa?.email,
    empresa?.site,
  ].filter(Boolean).join('  ·  ')
  if (linhaContato) doc.text(linhaContato, leftX, y + 12)

  y += Math.max(logoH, 20) + 4

  // Linha vermelha divisória
  doc.setDrawColor(...COR_VERMELHO)
  doc.setLineWidth(1.2)
  doc.line(margin, y, pageW - margin, y)
  y += 9

  // Título + número/data
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(...COR_TEXTO)
  doc.text('CONTRATO DE PRESTAÇÃO DE SERVIÇOS', margin, y + 5)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...COR_VERMELHO)
  doc.text(contrato.numero, pageW - margin, y, { align: 'right' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...COR_CINZA)
  doc.text(`Emitido em ${formatData(contrato.createdAt)}`, pageW - margin, y + 5, { align: 'right' })

  y += 14

  // ── Qualificação das partes ───────────────────────────────────────────────

  function desenharBoxParte(titulo: string, linhas: string[]): void {
    const linhasReais = linhas.filter(Boolean)
    const boxH = 8 + linhasReais.length * 5 + 4

    doc.setFillColor(...COR_BG_BOX)
    doc.rect(margin, y, pageW - 2 * margin, boxH, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...COR_VERMELHO)
    doc.text(titulo, margin + 4, y + 6)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...COR_TEXTO)
    linhasReais.forEach((linha, i) => {
      doc.text(linha, margin + 4, y + 12 + i * 5)
    })

    y += boxH + 4
  }

  desenharBoxParte('CONTRATANTE', [
    contrato.cliente.nome,
    contrato.cliente.cnpj        ? `CNPJ: ${contrato.cliente.cnpj}`                      : '',
    contrato.cliente.responsavel ? `Responsável: ${contrato.cliente.responsavel}`         : '',
    contrato.cliente.cpf         ? `CPF do Responsável: ${contrato.cliente.cpf}`         : '',
    montarEnderecoCliente(contrato.cliente),
  ])

  desenharBoxParte('CONTRATADA', [
    empresa?.nomeEmpresa ?? 'PortariaPro',
    empresa?.cnpj ? `CNPJ: ${empresa.cnpj}` : '',
    empresa ? montarEnderecoEmpresa(empresa) : '',
  ])

  // ── Dados do contrato ─────────────────────────────────────────────────────

  const dadosLinhas = [
    `Período: ${formatData(dataInicio)}${dataFim ? ` até ${formatData(dataFim)}` : ' (vigência indeterminada)'}`,
    `Valor mensal: ${formatBRL(contrato.valorMensal)}`,
    `Vencimento: todo dia ${diaVencimento} do mês`,
    `Status: ${STATUS_LABEL[contrato.status] ?? contrato.status}`,
  ]
  const dadosH = 8 + dadosLinhas.length * 5 + 4

  doc.setFillColor(...COR_BG_BOX)
  doc.rect(margin, y, pageW - 2 * margin, dadosH, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...COR_VERMELHO)
  doc.text('DADOS DO CONTRATO', margin + 4, y + 6)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...COR_TEXTO)
  dadosLinhas.forEach((linha, i) => {
    doc.text(linha, margin + 4, y + 12 + i * 5)
  })

  y += dadosH + 5

  // ── Resumo visual — 3 cards ───────────────────────────────────────────────

  const cardGap = 4
  const cardW = (pageW - 2 * margin - 2 * cardGap) / 3
  const cardH = 16
  const resumoCards = [
    { label: 'PRAZO',        valor: '36 meses' },
    { label: 'VALOR MENSAL', valor: formatBRL(contrato.valorMensal) },
    { label: 'VENCIMENTO',   valor: `Todo dia ${diaVencimento}` },
  ]

  resumoCards.forEach((card, i) => {
    const cx = margin + i * (cardW + cardGap)
    doc.setFillColor(240, 240, 245)
    doc.rect(cx, y, cardW, cardH, 'F')
    doc.setFillColor(...COR_VERMELHO)
    doc.rect(cx, y, cardW, 2, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...COR_CINZA)
    doc.text(card.label, cx + cardW / 2, y + 7, { align: 'center' })
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...COR_TEXTO)
    doc.text(card.valor, cx + cardW / 2, y + 13.5, { align: 'center' })
  })

  y += cardH + 5

  // ── Serviços inclusos ─────────────────────────────────────────────────────

  const servicos = [
    { nome: 'Monitoramento remoto 24h',     desc: '7 dias por semana, inclusive feriados' },
    { nome: 'Controle de acesso digital',   desc: 'reconhecimento facial, cartão e controle remoto' },
    { nome: 'CFTV',                         desc: 'gravação e acesso remoto às imagens' },
    { nome: 'Manutenção preventiva',        desc: 'visita mensal com relatório técnico' },
    { nome: 'Suporte técnico',              desc: 'atendimento corretivo em até 24 horas' },
    { nome: 'Relatórios mensais',           desc: 'acessos, ocorrências e serviços realizados' },
  ]

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...COR_VERMELHO)
  doc.text('SERVIÇOS INCLUSOS', margin, y)
  doc.setDrawColor(...COR_VERMELHO)
  doc.setLineWidth(0.4)
  doc.line(margin, y + 1.5, pageW - margin, y + 1.5)
  y += 7

  doc.setFontSize(9)
  for (const s of servicos) {
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...COR_TEXTO)
    const boldStr = `• ${s.nome}`
    doc.text(boldStr, margin, y)
    const boldW = doc.getTextWidth(boldStr)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...COR_CINZA)
    doc.text(` — ${s.desc}`, margin + boldW, y)
    y += 4.5
  }

  y += 3

  // ═══════════════════════════════════════════════════════════════════════════
  // PÁGINAS 2+ — CLÁUSULAS CONTRATUAIS
  // ═══════════════════════════════════════════════════════════════════════════

  function paginaClausulas(): void {
    doc.addPage()
    y = margin
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(185, 185, 185)
    doc.text(
      `CONTRATO Nº ${contrato.numero}  —  CLÁUSULAS CONTRATUAIS`,
      pageW / 2, y + 3.5, { align: 'center' }
    )
    doc.setDrawColor(210, 210, 210)
    doc.setLineWidth(0.2)
    doc.line(margin, y + 5.5, pageW - margin, y + 5.5)
    y += 12
  }

  function renderClausula(titulo: string, texto: string): void {
    if (y > pageH - 35) { paginaClausulas() }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(...COR_VERMELHO)
    doc.text(titulo, margin, y)
    y += 5

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(...COR_TEXTO)

    const paragrafos = texto.split('\n')
    for (const para of paragrafos) {
      if (!para.trim()) continue
      const isSubItem = /^[a-z0-9]\)/.test(para.trim())
      const xInicio = isSubItem ? margin + 4 : margin
      const largura = pageW - margin - xInicio
      const linhas = doc.splitTextToSize(para.trim(), largura)
      for (const linha of linhas) {
        if (y > pageH - 25) { paginaClausulas() }
        doc.text(linha, xInicio, y)
        y += 4.5
      }
    }

    y += 2
    doc.setDrawColor(210, 210, 210)
    doc.setLineWidth(0.2)
    doc.line(margin, y, pageW - margin, y)
    y += 4
  }

  paginaClausulas()

  for (const c of CLAUSULAS_FIXAS) {
    renderClausula(c.titulo, c.texto)
  }

  if (contrato.clausulasPersonalizadas?.trim()) {
    renderClausula('CLÁUSULA 10 – DISPOSIÇÕES ESPECÍFICAS', contrato.clausulasPersonalizadas.trim())
  }

  // ── Assinaturas — última página das cláusulas ─────────────────────────────

  if (y + 46 > pageH - 20) { paginaClausulas() }

  y += 6
  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.3)
  doc.line(margin, y, pageW - margin, y)
  y += 8

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...COR_TEXTO)
  doc.text(`Campinas, ${formatDataExtenso(new Date())}`, margin, y)
  y += 18

  const assinColW    = (pageW - 2 * margin - 12) / 2
  const assinColLeft = margin
  const assinColRight = margin + assinColW + 12

  doc.setDrawColor(...COR_TEXTO)
  doc.setLineWidth(0.3)
  doc.line(assinColLeft,  y, assinColLeft  + assinColW, y)
  doc.line(assinColRight, y, assinColRight + assinColW, y)

  doc.setFontSize(8.5)
  doc.setTextColor(...COR_TEXTO)
  doc.setFont('helvetica', 'bold')
  doc.text('CONTRATANTE', assinColLeft  + assinColW / 2, y + 5, { align: 'center' })
  doc.text('CONTRATADA',  assinColRight + assinColW / 2, y + 5, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...COR_CINZA)
  doc.text(contrato.cliente.responsavel ?? contrato.cliente.nome, assinColLeft  + assinColW / 2, y + 10, { align: 'center' })
  doc.text(empresa?.nomeEmpresa ?? 'PortariaPro',                 assinColRight + assinColW / 2, y + 10, { align: 'center' })

  // ── Rodapé em todas as páginas ────────────────────────────────────────────

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

    const periodo = `Contrato válido de ${formatData(dataInicio)}${dataFim ? ` até ${formatData(dataFim)}` : ' (sem prazo final)'}.`
    doc.text(periodo, margin, yRodape + 4)
    doc.text(
      `Gerado em ${formatData(agora)} às ${formatHora(agora)} por Luciano Pains`,
      margin,
      yRodape + 8
    )
    doc.text(`Página ${p} de ${totalPaginas}`, pageW - margin, yRodape + 8, { align: 'right' })
  }

  // ── Download ──────────────────────────────────────────────────────────────

  const nome = `contrato-${contrato.numero}-${slugify(contrato.cliente.nome)}.pdf`
  doc.save(nome)
}
