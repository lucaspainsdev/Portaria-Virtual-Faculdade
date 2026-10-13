export const dynamic = 'force-dynamic'

import { buscarConfiguracao } from './actions'
import { listarUsuarios } from './usuarios-actions'
import { ConfiguracoesForm } from '@/components/configuracoes/ConfiguracoesForm'
import { GestaoUsuarios } from '@/components/configuracoes/GestaoUsuarios'

export default async function ConfiguracoesPage() {
  const [configuracao, resultadoUsuarios] = await Promise.all([
    buscarConfiguracao(),
    listarUsuarios(),
  ])

  const usuarios = 'usuarios' in resultadoUsuarios ? resultadoUsuarios.usuarios : []
  const erroUsuarios = 'erro' in resultadoUsuarios ? resultadoUsuarios.erro : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', paddingBottom: '48px' }}>
      <ConfiguracoesForm configuracao={configuracao} />
      <GestaoUsuarios usuarios={usuarios} erroCarregamento={erroUsuarios} />
    </div>
  )
}
