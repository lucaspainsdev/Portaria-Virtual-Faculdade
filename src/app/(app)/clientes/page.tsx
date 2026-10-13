export const dynamic = 'force-dynamic'

import { ClientesPageClient } from '@/components/clientes/ClientesPageClient'
import { listarClientes } from './actions'
import { getUserCargo } from '@/lib/usuario-server'

export default async function ClientesPage() {
  const [clientes, cargo] = await Promise.all([listarClientes(), getUserCargo()])
  return <ClientesPageClient clientes={clientes} cargo={cargo} />
}
