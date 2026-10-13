export const dynamic = 'force-dynamic'

import { EquipamentosPageClient } from '@/components/equipamentos/EquipamentosPageClient'
import { listarEquipamentos } from './actions'
import { getUserCargo } from '@/lib/usuario-server'

export default async function EquipamentosPage() {
  const [equipamentos, cargo] = await Promise.all([listarEquipamentos(), getUserCargo()])
  return <EquipamentosPageClient equipamentos={equipamentos} cargo={cargo} />
}
