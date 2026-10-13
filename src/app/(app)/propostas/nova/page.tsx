import { PropostaForm } from '@/components/propostas/PropostaForm'
import { listarClientesSelect, listarEquipamentosSelect } from '@/app/(app)/propostas/actions'

export default async function NovaPropostaPage() {
  const [clientes, equipamentos] = await Promise.all([
    listarClientesSelect(),
    listarEquipamentosSelect(),
  ])
  return <PropostaForm clientes={clientes} equipamentos={equipamentos} />
}
