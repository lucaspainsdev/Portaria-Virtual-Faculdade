export const dynamic = 'force-dynamic'

import { PropostasPageClient } from '@/components/propostas/PropostasPageClient'
import { listarPropostas } from './actions'
import { getUserCargo } from '@/lib/usuario-server'

export default async function PropostasPage() {
  const [propostas, cargo] = await Promise.all([listarPropostas(), getUserCargo()])
  return <PropostasPageClient propostas={propostas} cargo={cargo} />
}
