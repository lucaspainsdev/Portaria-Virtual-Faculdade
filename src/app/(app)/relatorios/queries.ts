import { prisma } from '@/lib/prisma'

export async function buscarDadosRelatorios(ano: number) {
  const inicioAno = new Date(ano, 0, 1)
  const fimAno    = new Date(ano, 11, 31, 23, 59, 59)

  const [
    lancamentos,
    contratos,
    clientes,
  ] = await Promise.all([

    // Todos os lançamentos do ano
    prisma.lancamento.findMany({
      where: { data: { gte: inicioAno, lte: fimAno } },
      include: { cliente: { select: { nome: true } } },
      orderBy: { data: 'asc' },
    }),

    // Contratos ativos
    prisma.contrato.findMany({
      where: { status: 'ATIVO' },
      include: { cliente: { select: { nome: true } } },
    }),

    // Contagem de clientes
    prisma.cliente.count({ where: { ativo: true } }),
  ])

  // ── Receita x Despesa por mês ─────────────────────────────────────────────
  const meses = Array.from({ length: 12 }, (_, i) => {
    const label = new Date(ano, i).toLocaleDateString('pt-BR', { month: 'short' })
    const ini   = new Date(ano, i, 1)
    const fim   = new Date(ano, i + 1, 0, 23, 59, 59)
    const rows  = lancamentos.filter((l) => l.data >= ini && l.data <= fim)
    const receitas = rows.filter((l) => l.tipo === 'RECEITA').reduce((s, l) => s + Number(l.valor), 0)
    const despesas = rows.filter((l) => l.tipo === 'DESPESA').reduce((s, l) => s + Number(l.valor), 0)
    return { label, receitas, despesas, saldo: receitas - despesas }
  })

  // ── Despesas por categoria ─────────────────────────────────────────────────
  const despPorCategoria: Record<string, number> = {}
  lancamentos
    .filter((l) => l.tipo === 'DESPESA')
    .forEach((l) => {
      despPorCategoria[l.categoria] = (despPorCategoria[l.categoria] ?? 0) + Number(l.valor)
    })

  // ── KPIs gerais ───────────────────────────────────────────────────────────
  const totalReceita      = lancamentos.filter((l) => l.tipo === 'RECEITA').reduce((s, l) => s + Number(l.valor), 0)
  const totalDespesa      = lancamentos.filter((l) => l.tipo === 'DESPESA').reduce((s, l) => s + Number(l.valor), 0)
  const receitaRecorrente = contratos.reduce((s, c) => s + Number(c.valorMensal), 0)

  return {
    meses,
    despPorCategoria,
    lancamentos,
    contratos,
    kpis: {
      totalReceita,
      totalDespesa,
      saldoAno: totalReceita - totalDespesa,
      receitaRecorrente,
      clientesAtivos:  clientes,
      contratosAtivos: contratos.length,
    },
  }
}
