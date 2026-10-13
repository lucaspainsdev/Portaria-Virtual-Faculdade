import { AlertTriangle, Clock, FileText, DollarSign, type LucideIcon } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { TipoNotificacao } from '@prisma/client'

type CorInfo = { cor: string; bg: string; borda: string; label: string; icon: LucideIcon }

export const NOTIFICACAO_INFO: Record<TipoNotificacao, CorInfo> = {
  CONTRATO_URGENTE: {
    cor:   '#cc0000',
    bg:    'rgba(204,0,0,0.12)',
    borda: 'rgba(204,0,0,0.35)',
    label: 'Contrato urgente',
    icon:  AlertTriangle,
  },
  CONTRATO_VENCENDO: {
    cor:   '#f59e0b',
    bg:    'rgba(245,158,11,0.12)',
    borda: 'rgba(245,158,11,0.35)',
    label: 'Contrato vencendo',
    icon:  Clock,
  },
  MENSALIDADE_ATRASADA: {
    cor:   '#f97316',
    bg:    'rgba(249,115,22,0.12)',
    borda: 'rgba(249,115,22,0.35)',
    label: 'Mensalidade atrasada',
    icon:  DollarSign,
  },
  ORCAMENTO_SEM_RESPOSTA: {
    cor:   '#3b82f6',
    bg:    'rgba(59,130,246,0.12)',
    borda: 'rgba(59,130,246,0.35)',
    label: 'Orçamento sem resposta',
    icon:  FileText,
  },
}

export function tempoRelativo(d: Date | string): string {
  return formatDistanceToNow(new Date(d), { addSuffix: true, locale: ptBR })
}

export function agruparPorDia<T extends { createdAt: Date | string }>(itens: T[]): Array<{ titulo: string; itens: T[] }> {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const ontem = new Date(hoje)
  ontem.setDate(ontem.getDate() - 1)

  const grupos = new Map<string, T[]>()
  for (const item of itens) {
    const d = new Date(item.createdAt)
    d.setHours(0, 0, 0, 0)
    let titulo: string
    if (d.getTime() === hoje.getTime())       titulo = 'Hoje'
    else if (d.getTime() === ontem.getTime()) titulo = 'Ontem'
    else                                       titulo = d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
    if (!grupos.has(titulo)) grupos.set(titulo, [])
    grupos.get(titulo)!.push(item)
  }
  return Array.from(grupos.entries()).map(([titulo, itens]) => ({ titulo, itens }))
}
