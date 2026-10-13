'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, Presentation, DollarSign, Users,
  Monitor, FileSignature, BarChart3, Settings, LogOut, Bell,
  type LucideIcon,
} from 'lucide-react'
import { contarNaoLidas } from '@/app/(app)/notificacoes/actions'

type NavItem = { label: string; href: string; icon: LucideIcon; badge?: boolean }

const navItems: NavItem[] = [
  { label: 'Dashboard',     href: '/dashboard',     icon: LayoutDashboard },
  { label: 'Propostas',     href: '/propostas',     icon: Presentation    },
  { label: 'Financeiro',    href: '/financeiro',    icon: DollarSign      },
  { label: 'Clientes',      href: '/clientes',      icon: Users           },
  { label: 'Equipamentos',  href: '/equipamentos',  icon: Monitor         },
  { label: 'Contratos',     href: '/contratos',     icon: FileSignature   },
  { label: 'Relatórios',    href: '/relatorios',    icon: BarChart3       },
  { label: 'Notificações',  href: '/notificacoes',  icon: Bell, badge: true },
  { label: 'Configurações', href: '/configuracoes', icon: Settings        },
]

export function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const [nome,  setNome]  = useState('...')
  const [email, setEmail] = useState('')
  const [naoLidas, setNaoLidas] = useState(0)

  useEffect(() => {
    const supabase = createSupabaseClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      const meta = session.user.user_metadata
      const n = meta?.full_name ?? meta?.name ?? session.user.email?.split('@')[0] ?? 'Usuário'
      setNome(n)
      setEmail(session.user.email ?? '')
    })
  }, [])

  useEffect(() => {
    contarNaoLidas().then(setNaoLidas).catch(() => {})
  }, [pathname])

  const iniciais = nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p: string) => p[0].toUpperCase())
    .join('')

  async function handleLogout() {
    const supabase = createSupabaseClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside style={{
      position:    'fixed',
      left:        0,
      top:         0,
      zIndex:      40,
      height:      '100vh',
      width:       '260px',
      background:  '#0a0a0a',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display:     'flex',
      flexDirection: 'column',
      flexShrink:  0,
    }}>

      {/* Logo */}
      <div style={{
        display:      'flex',
        alignItems:   'center',
        gap:          '6px',
        height:       '60px',
        padding:      '0 24px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        flexShrink:   0,
      }}>
        <Image
          src="/logo.png"
          width={36}
          height={36}
          alt="Virtual Camp"
          style={{ borderRadius: '8px', flexShrink: 0 }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          <span style={{
            fontFamily:    'var(--font-heading), sans-serif',
            fontSize:      '18px',
            fontWeight:    900,
            color:         '#ffffff',
            lineHeight:    1,
          }}>
            Virtual Camp
          </span>
          <span style={{
            fontSize:      '10px',
            color:         '#666',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            lineHeight:    1,
          }}>
            Portaria Virtual
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  prefetch={true}
                  style={{
                    display:        'flex',
                    alignItems:     'center',
                    gap:            '10px',
                    padding:        '10px 12px',
                    borderRadius:   '8px',
                    textDecoration: 'none',
                    fontSize:       '0.875rem',
                    fontWeight:     500,
                    transition:     'background 0.15s, color 0.15s',
                    borderLeft:     `3px solid ${isActive ? '#cc0000' : 'transparent'}`,
                    background:     isActive ? 'rgba(204,0,0,0.1)' : 'transparent',
                    color:          isActive ? '#f0f0f0' : '#888',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                      e.currentTarget.style.color = '#f0f0f0'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = '#888'
                    }
                  }}
                >
                  <Icon
                    size={17}
                    style={{ color: isActive ? '#cc0000' : 'inherit', flexShrink: 0 }}
                  />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge && naoLidas > 0 && (
                    <span style={{
                      background: '#cc0000',
                      color: '#fff',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: '10px',
                      minWidth: '18px',
                      textAlign: 'center',
                      lineHeight: 1.4,
                    }}>
                      {naoLidas > 99 ? '99+' : naoLidas}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Usuário / Logout */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding:   '14px 16px',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Avatar */}
          <div style={{
            width:          '36px',
            height:         '36px',
            borderRadius:   '50%',
            background:     'rgba(204,0,0,0.15)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            flexShrink:     0,
            fontFamily:     'var(--font-heading), sans-serif',
            fontSize:       '0.8rem',
            fontWeight:     700,
            color:          '#cc0000',
          }}>
            {iniciais}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#f0f0f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {nome}
            </p>
            <p style={{ margin: 0, fontSize: '0.72rem', color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {email}
            </p>
          </div>

          <button
            onClick={handleLogout}
            title="Sair"
            style={{
              background: 'none',
              border:     'none',
              cursor:     'pointer',
              color:      '#555',
              padding:    '6px',
              borderRadius: '6px',
              display:    'flex',
              transition: 'color 0.15s, background 0.15s',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#f0f0f0'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#555';    e.currentTarget.style.background = 'none' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
