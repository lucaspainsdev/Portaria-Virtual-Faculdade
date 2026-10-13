export const dynamic = 'force-dynamic'

import { listarContratos, listarClientesSelect } from './actions'
import { ContratosPageClient } from '@/components/contratos/ContratosPageClient'
import { getUserCargo } from '@/lib/usuario-server'

export default async function ContratosPage() {
  const [contratos, clientes, cargo] = await Promise.all([
    listarContratos(),
    listarClientesSelect(),
    getUserCargo(),
  ])
  return <ContratosPageClient contratos={contratos} clientes={clientes} cargo={cargo} />
}
