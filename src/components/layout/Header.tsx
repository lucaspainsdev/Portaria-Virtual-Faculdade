'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { User } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const rotulos: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/orcamentos': 'Orçamentos',
  '/financeiro': 'Financeiro',
  '/clientes': 'Clientes',
  '/equipamentos': 'Equipamentos',
  '/contratos': 'Contratos',
  '/relatorios': 'Relatórios',
  '/configuracoes': 'Configurações',
}

function getTitulo(pathname: string): string {
  for (const [rota, titulo] of Object.entries(rotulos)) {
    if (pathname === rota || pathname.startsWith(rota + '/')) return titulo
  }
  return 'PortariaPro'
}

function getIniciais(nome: string): string {
  return nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('')
}

export function Header() {
  const pathname = usePathname()
  const titulo = getTitulo(pathname)

  const [nomeUsuario, setNomeUsuario] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      const meta = session.user.user_metadata
      const nome =
        meta?.full_name ??
        meta?.name ??
        session.user.email?.split('@')[0] ??
        'Usuário'
      setNomeUsuario(nome)
      setEmail(session.user.email ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          setNomeUsuario(null)
          setEmail(null)
          return
        }
        const meta = session.user.user_metadata
        const nome =
          meta?.full_name ??
          meta?.name ??
          session.user.email?.split('@')[0] ??
          'Usuário'
        setNomeUsuario(nome)
        setEmail(session.user.email ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <header
      style={{
        height: '56px',
        minHeight: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        background: '#111111',
        borderBottom: '2px solid #cc0000',
        flexShrink: 0,
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--font-barlow-condensed), sans-serif',
          fontWeight: 700,
          fontSize: '1.1rem',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: '#f0f0f0',
          margin: 0,
        }}
      >
        {titulo}
      </h2>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {nomeUsuario ? (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.3 }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#f0f0f0' }}>
                {nomeUsuario}
              </span>
              {email && (
                <span style={{ fontSize: '0.7rem', color: '#666666' }}>{email}</span>
              )}
            </div>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#cc0000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  fontFamily: 'var(--font-barlow-condensed), sans-serif',
                }}
              >
                {getIniciais(nomeUsuario)}
              </span>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#555555' }}>
            <User size={16} />
            <span style={{ fontSize: '0.875rem' }}>Não autenticado</span>
          </div>
        )}
      </div>
    </header>
  )
}
