'use client'

import { usePathname, useRouter } from 'next/navigation'
import { ChevronDown, LogOut, Settings, User } from 'lucide-react'
import { SinoNotificacoes } from '@/components/notificacoes/SinoNotificacoes'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { CARGO_LABEL, CARGO_CORES, type Cargo } from '@/lib/usuario'
import { CommandPalette } from '@/components/header/CommandPalette'

const TITULOS: Record<string, string> = {
  '/dashboard':     'Dashboard',
  '/financeiro':    'Financeiro',
  '/clientes':      'Clientes',
  '/equipamentos':  'Equipamentos',
  '/contratos':     'Contratos',
  '/relatorios':    'Relatórios',
  '/configuracoes': 'Configurações',
}

function lerCargo(meta: Record<string, unknown> | null | undefined): Cargo {
  const c = meta?.cargo
  return c === 'DONO' || c === 'GERENTE' || c === 'OPERADOR' ? c : 'OPERADOR'
}

function getTitulo(pathname: string): string {
  for (const [rota, titulo] of Object.entries(TITULOS)) {
    if (pathname === rota || pathname.startsWith(rota + '/')) return titulo
  }
  return 'PortariaPro'
}

function getIniciais(nome: string): string {
  return nome.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('')
}

export function Header() {
  const pathname = usePathname()
  const router   = useRouter()
  const titulo   = getTitulo(pathname)

  const [nomeUsuario, setNomeUsuario] = useState<string | null>(null)
  const [cargo, setCargo] = useState<Cargo | null>(null)

  useEffect(() => {
    const supabase = createSupabaseClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      const meta = session.user.user_metadata
      setNomeUsuario(meta?.full_name ?? meta?.name ?? session.user.email?.split('@')[0] ?? null)
      setCargo(lerCargo(meta))
    })
  }, [])

  async function handleLogout() {
    const supabase = createSupabaseClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const iniciais = nomeUsuario ? getIniciais(nomeUsuario) : '?'

  return (
    <header className="sticky top-0 z-30 flex h-[60px] items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-xl">
      <h1 className="font-heading text-xl font-semibold uppercase tracking-wide text-foreground">
        {titulo}
      </h1>

      <div className="flex items-center gap-3">
        {/* Command palette (Ctrl+K) */}
        <CommandPalette />

        {/* Badge cargo */}
        {cargo && (
          <span
            className="rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.07em]"
            style={{
              background:  CARGO_CORES[cargo].bg,
              borderColor: CARGO_CORES[cargo].borda,
              color:       CARGO_CORES[cargo].cor,
            }}
          >
            {CARGO_LABEL[cargo]}
          </span>
        )}

        {/* Notificações */}
        <SinoNotificacoes />

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted outline-none">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 font-heading text-xs font-semibold text-primary">
                {iniciais}
              </div>
              {nomeUsuario && (
                <span className="hidden text-sm font-medium text-foreground lg:block max-w-[120px] truncate">
                  {nomeUsuario}
                </span>
              )}
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {nomeUsuario && (
              <>
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium text-foreground truncate">{nomeUsuario}</p>
                </div>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" /> Meu Perfil
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" /> Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
