'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Check, RefreshCw, Bell } from 'lucide-react'
import {
  gerarNotificacoes,
  marcarComoLida,
  marcarTodasComoLidas,
} from '@/app/(app)/notificacoes/actions'
import { NOTIFICACAO_INFO, tempoRelativo, agruparPorDia } from '@/lib/notificacao'
import type { Notificacao } from '@prisma/client'

type Props = { notificacoes: Notificacao[] }

export function PainelNotificacoes({ notificacoes }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const grupos = agruparPorDia(notificacoes)
  const naoLidas = notificacoes.filter((n) => !n.lida).length

  function handleGerar() {
    startTransition(async () => { await gerarNotificacoes(); router.refresh() })
  }
  function handleMarcarTodas() {
    startTransition(async () => { await marcarTodasComoLidas(); router.refresh() })
  }
  function handleMarcarUma(id: string) {
    startTransition(async () => { await marcarComoLida(id); router.refresh() })
  }

  return (
    <div className='space-y-6'>

      {/* Header */}
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h1 className='font-heading text-2xl font-semibold text-foreground'>
            Notificações
          </h1>
          <p className='text-sm text-muted-foreground'>
            {naoLidas > 0 ? `${naoLidas} não lida${naoLidas !== 1 ? 's' : ''}` : 'Tudo em dia.'}
          </p>
        </div>
        <div className='flex flex-wrap gap-2'>
          <button
            onClick={handleGerar}
            disabled={pending}
            className='inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-50'
          >
            <RefreshCw className={`h-3.5 w-3.5 ${pending ? 'animate-spin' : ''}`} />
            Gerar alertas agora
          </button>
          {naoLidas > 0 && (
            <button
              onClick={handleMarcarTodas}
              disabled={pending}
              className='inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50'
            >
              <Check className='h-3.5 w-3.5' /> Marcar todas como lidas
            </button>
          )}
        </div>
      </div>

      {/* Lista */}
      {notificacoes.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-20 text-center'>
          <Bell className='mb-3 h-10 w-10 text-muted-foreground/30' />
          <p className='text-base font-semibold text-foreground'>Nenhuma notificação. Tudo em dia! ✅</p>
          <p className='mt-1 text-sm text-muted-foreground'>Clique em &quot;Gerar alertas agora&quot; para verificar alertas pendentes.</p>
        </div>
      ) : (
        <div className='space-y-5'>
          {grupos.map((grupo) => (
            <div key={grupo.titulo}>
              <p className='mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground'>
                {grupo.titulo}
              </p>
              <div className='space-y-2'>
                {grupo.itens.map((n) => {
                  const info = NOTIFICACAO_INFO[n.tipo]
                  const Icon = info.icon
                  const wrapperClass = `flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors ${n.lida ? 'opacity-50' : 'hover:border-border/60'}`
                  const Body = (
                    <>
                      <div
                        className='h-9 w-9 shrink-0 rounded-lg flex items-center justify-center'
                        style={{ background: info.bg, border: `1px solid ${info.borda}` }}
                      >
                        <Icon className='h-4 w-4' style={{ color: info.cor }} />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-start justify-between gap-2'>
                          <p className='text-sm font-semibold text-foreground'>{n.titulo}</p>
                          <span className='text-[10px] text-muted-foreground whitespace-nowrap'>
                            {tempoRelativo(n.createdAt)}
                          </span>
                        </div>
                        <p className='mt-0.5 text-xs text-muted-foreground'>{n.mensagem}</p>
                      </div>
                      {!n.lida && (
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleMarcarUma(n.id) }}
                          disabled={pending}
                          title='Marcar como lida'
                          className='rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
                        >
                          <Check className='h-3.5 w-3.5' />
                        </button>
                      )}
                    </>
                  )
                  return n.link
                    ? <Link key={n.id} href={n.link} className={wrapperClass}>{Body}</Link>
                    : <div key={n.id} className={wrapperClass}>{Body}</div>
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
