export const dynamic = 'force-dynamic'

import { listarNotificacoes } from './actions'
import { PainelNotificacoes } from '@/components/notificacoes/PainelNotificacoes'

export default async function NotificacoesPage() {
  const notificacoes = await listarNotificacoes()
  return <PainelNotificacoes notificacoes={notificacoes} />
}
