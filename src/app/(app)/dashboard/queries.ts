import { prisma } from '@/lib/prisma'

export async function buscarDadosDashboard() {
  const agora    = new Date()
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1)
  const fimMes    = new Date(agora.getFullYear(), agora.getMonth() + 1, 0, 23, 59, 59)
  const em30Dias  = new Date(agora.getTime() + 30 * 86_400_000)

  const [
    receitaMesRows,
    despesaMesRows,
    grafico3meses,
    contratosAtivos,
    contratosVencendo,
    mensalidadesAtrasadas,
  ] = await Promise.all([

    // Receita do mês (lançamentos)
    prisma.lancamento.findMany({
      where: { tipo: 'RECEITA', data: { gte: inicioMes, lte: fimMes } },
      select: { valor: true },
    }),

    // Despesa do mês
    prisma.lancamento.findMany({
      where: { tipo: 'DESPESA', data: { gte: inicioMes, lte: fimMes } },
      select: { valor: true },
    }),

    // Gráfico: últimos 3 meses
    (async () => {
      const meses = []
      for (let i = 2; i >= 0; i--) {
        const d   = new Date(agora.getFullYear(), agora.getMonth() - i, 1)
        const ini = new Date(d.getFullYear(), d.getMonth(), 1)
        const fim = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
        const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
        const rows = await prisma.lancamento.findMany({
          where: { data: { gte: ini, lte: fim } },
          select: { tipo: true, valor: true },
        })
        const receitas = rows.filter((r) => r.tipo === 'RECEITA').reduce((s, r) => s + Number(r.valor), 0)
        const despesas = rows.filter((r) => r.tipo === 'DESPESA').reduce((s, r) => s + Number(r.valor), 0)
        meses.push({ label, receitas, despesas })
      }
      return meses
    })(),

    // Contratos ativos → receita recorrente mensal
    prisma.contrato.findMany({
      where: { status: 'ATIVO' },
      select: { id: true, valorMensal: true },
    }),

    // Contratos vencendo nos próximos 30 dias
    prisma.contrato.count({
      where: {
        status: 'ATIVO',
        dataFim: { gte: agora, lte: em30Dias },
      },
    }),

    // Mensalidades atrasadas
    (async () => {
      const ativosComCliente = await prisma.contrato.findMany({
        where:   { status: 'ATIVO' },
        select:  { id: true, clienteId: true },
      })
      if (ativosComCliente.length === 0) return 0

      const mensalidadesPagas = await prisma.lancamento.findMany({
        where: {
          categoria: 'MENSALIDADE',
          tipo:      'RECEITA',
          data:      { gte: inicioMes, lte: fimMes },
          clienteId: { in: ativosComCliente.map((c) => c.clienteId) },
        },
        select: { clienteId: true },
      })
      const clientesPagaram = new Set(mensalidadesPagas.map((l) => l.clienteId))
      return ativosComCliente.filter((c) => !clientesPagaram.has(c.clienteId)).length
    })(),
  ])

  const receitaMes        = receitaMesRows.reduce((s, r) => s + Number(r.valor), 0)
  const despesaMes        = despesaMesRows.reduce((s, r) => s + Number(r.valor), 0)
  const receitaRecorrente = contratosAtivos.reduce((s, c) => s + Number(c.valorMensal), 0)

  return {
    receitaMes,
    despesaMes,
    grafico3meses,
    contratosAtivosCount: contratosAtivos.length,
    contratosVencendo,
    mensalidadesAtrasadas,
    receitaRecorrente,
  }
}
