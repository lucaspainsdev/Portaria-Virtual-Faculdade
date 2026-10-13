'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { Bell, Check, ArrowRight } from 'lucide-react'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
} from '@/components/ui/dropdown-menu'
import {
  contarNaoLidas,
  listarNotificacoesRecentes,
  gerarNotificacoes,
  marcarComoLida,
  marcarTodasComoLidas,
} from '@/app/(app)/notificacoes/actions'
import { NOTIFICACAO_INFO, tempoRelativo } from '@/lib/notificacao'
import type { Notificacao } from '@prisma/client'

export function SinoNotificacoes() {
  const [count, setCount] = useState<number>(0)
  const [itens, setItens] = useState<Notificacao[]>([])
  const [loading, setLoading] = useState(false)
  const [, startTransition] = useTransition()

  // Carrega contagem ao montar
  useEffect(() => {
    contarNaoLidas().then(setCount).catch(() => {})
  }, [])

  async function carregar() {
    setLoading(true)
    try {
      await gerarNotificacoes()
      const [recentes, n] = await Promise.all([
        listarNotificacoesRecentes(5),
        contarNaoLidas(),
      ])
      setItens(recentes)
      setCount(n)
    } finally {
      setLoading(false)
    }
  }

  function handleOpenChange(open: boolean) {
    if (open) carregar()
  }

  function handleMarcarLida(id: string) {
    startTransition(async () => {
      await marcarComoLida(id)
      setItens((prev) => prev.filter((i) => i.id !== id))
      setCount((c) => Math.max(0, c - 1))
    })
  }

  function handleMarcarTodas() {
    startTransition(async () => {
      await marcarTodasComoLidas()
      setItens([])
      setCount(0)
    })
  }

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button className='relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'>
          <Bell className='h-5 w-5' />
          {count > 0 && (
            <span className='absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white'>
              {count > 99 ? '99+' : count}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[360px] p-0'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-border px-4 py-3'>
          <p className='font-display text-sm font-bold uppercase tracking-wide text-foreground'>
            Notificações
          </p>
          {count > 0 && (
            <button
              onClick={handleMarcarTodas}
              className='inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors'
            >
              <Check className='h-3 w-3' /> Marcar todas
            </button>
          )}
        </div>

        {/* Lista */}
        <div className='max-h-[420px] overflow-y-auto'>
          {loading ? (
            <p className='py-8 text-center text-xs text-muted-foreground'>Carregando...</p>
          ) : itens.length === 0 ? (
            <p className='py-10 text-center text-sm text-muted-foreground'>Nenhuma notificação.</p>
          ) : (
            itens.map((n) => {
              const info = NOTIFICACAO_INFO[n.tipo]
              const Icon = info.icon
              const Body = (
                <div className='flex gap-3 px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer'>
                  <div
                    className='h-8 w-8 shrink-0 rounded-lg flex items-center justify-center'
                    style={{ background: info.bg, border: `1px solid ${info.borda}` }}
                  >
                    <Icon className='h-4 w-4' style={{ color: info.cor }} />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-semibold text-foreground truncate'>{n.titulo}</p>
                    <p className='text-xs text-muted-foreground line-clamp-2'>{n.mensagem}</p>
                    <p className='text-[10px] text-muted-foreground mt-1'>{tempoRelativo(n.createdAt)}</p>
                  </div>
                </div>
              )
              return (
                <div key={n.id} className='border-b border-border last:border-b-0' onClick={() => handleMarcarLida(n.id)}>
                  {n.link ? <Link href={n.link}>{Body}</Link> : Body}
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className='border-t border-border px-4 py-2'>
          <Link
            href='/notificacoes'
            className='inline-flex w-full items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold text-primary hover:bg-muted transition-colors'
          >
            Ver todas <ArrowRight className='h-3 w-3' />
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
