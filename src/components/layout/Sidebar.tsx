'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, FileText, DollarSign, Building2,
  Package, FileSignature, BarChart3, Settings, LogOut,
} from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase/client'

// itens de navegação principal
const navItems = [
  { href: '/dashboard',      label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/propostas',      label: 'Propostas',    icon: FileText        },
  { href: '/financeiro',     label: 'Financeiro',   icon: DollarSign      },
  { href: '/clientes',       label: 'Clientes',     icon: Building2       },
  { href: '/equipamentos',   label: 'Equipamentos', icon: Package         },
  { href: '/contratos',      label: 'Contratos',    icon: FileSignature   },
  { href: '/relatorios',     label: 'Relatórios',   icon: BarChart3       },
  { href: '/configuracoes',  label: 'Configurações',icon: Settings        },
]

export function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()

  async function handleLogout() {
    const supabase = createSupabaseClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside style={{
      width: '240px', minWidth: '240px', minHeight: '100vh',
      background: '#111111', borderRight: '1px solid #222222',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #222222' }}>
        <span style={{
          fontFamily: 'var(--font-barlow-condensed),sans-serif',
          fontWeight: 900, fontSize: '1.25rem', color: '#ffffff',
          letterSpacing: '0.05em', textTransform: 'uppercase',
        }}>
          Portaria<span style={{ color: '#cc0000' }}>Pro</span>
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '6px',
                fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none',
                transition: 'background 0.15s, color 0.15s',
                background: active ? 'rgba(204,0,0,0.1)' : 'transparent',
                color:      active ? '#cc0000' : '#888888',
                border:     active ? '1px solid rgba(204,0,0,0.2)' : '1px solid transparent',
              }}
              onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.color = '#f0f0f0' } }}
              onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#888888' } }}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Rodapé: logout */}
      <div style={{ padding: '12px', borderTop: '1px solid #1a1a1a' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', borderRadius: '6px', border: '1px solid transparent',
            background: 'transparent', color: '#555555', fontSize: '0.875rem',
            fontWeight: 500, cursor: 'pointer', textAlign: 'left',
            transition: 'background 0.15s, color 0.15s, border-color 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background    = 'rgba(204,0,0,0.08)'
            e.currentTarget.style.color         = '#cc0000'
            e.currentTarget.style.borderColor   = 'rgba(204,0,0,0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background    = 'transparent'
            e.currentTarget.style.color         = '#555555'
            e.currentTarget.style.borderColor   = 'transparent'
          }}
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </aside>
  )
}
