export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { FinanceiroPageClient } from '@/components/financeiro/FinanceiroPageClient'
import { buscarResumoMes, buscarLancamentos, buscarGrafico, listarClientesSelect } from './actions'
import { getUserCargo } from '@/lib/usuario-server'

type Props = { searchParams: { mes?: string; ano?: string } }

export default async function FinanceiroPage({ searchParams }: Props) {
  const agora = new Date()
  const mes = parseInt(searchParams.mes ?? String(agora.getMonth() + 1))
  const ano = parseInt(searchParams.ano ?? String(agora.getFullYear()))

  const [resumo, lancamentos, grafico, clientes, cargo] = await Promise.all([
    buscarResumoMes(mes, ano),
    buscarLancamentos(mes, ano),
    buscarGrafico(mes, ano),
    listarClientesSelect(),
    getUserCargo(),
  ])

  return (
    <Suspense>
      <FinanceiroPageClient
        mes={mes} ano={ano}
        resumo={resumo} lancamentos={lancamentos}
        grafico={grafico} clientes={clientes}
        cargo={cargo}
      />
    </Suspense>
  )
}
