'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, LayoutDashboard, DollarSign, Users,
  Monitor, FileSignature, BarChart3, Bell, Settings,
} from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

const ITENS = [
  { label: 'Dashboard',     href: '/dashboard',     icon: LayoutDashboard },
  { label: 'Financeiro',    href: '/financeiro',    icon: DollarSign      },
  { label: 'Clientes',      href: '/clientes',      icon: Users           },
  { label: 'Equipamentos',  href: '/equipamentos',  icon: Monitor         },
  { label: 'Contratos',     href: '/contratos',     icon: FileSignature   },
  { label: 'Relatórios',    href: '/relatorios',    icon: BarChart3       },
  { label: 'Notificações',  href: '/notificacoes',  icon: Bell            },
  { label: 'Configurações', href: '/configuracoes', icon: Settings        },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  function navegar(href: string) {
    setOpen(false)
    router.push(href)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className='inline-flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground'
      >
        <Search className='h-3.5 w-3.5' />
        <span className='hidden sm:inline'>Buscar...</span>
        <kbd className='ml-1 hidden h-5 select-none items-center rounded border border-border bg-background px-1.5 font-mono text-[10px] sm:inline-flex'>
          Ctrl K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder='Buscar página...' />
        <CommandList>
          <CommandEmpty>Nada encontrado.</CommandEmpty>
          <CommandGroup heading='Navegação'>
            {ITENS.map((item) => {
              const Icon = item.icon
              return (
                <CommandItem
                  key={item.href}
                  value={item.label}
                  onSelect={() => navegar(item.href)}
                >
                  <Icon className='mr-2 h-4 w-4' />
                  <span>{item.label}</span>
                </CommandItem>
              )
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
