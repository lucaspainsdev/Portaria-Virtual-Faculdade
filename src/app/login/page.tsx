'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { createSupabaseClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)

  const isLoading = pending

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    startTransition(async () => {
      const supabase = createSupabaseClient()
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (authError) {
        const msg = authError.message.includes('Invalid login credentials')
          ? 'Credenciais inválidas. Verifique seu email e senha.'
          : authError.message.includes('Email not confirmed')
          ? 'Confirme seu e-mail antes de entrar.'
          : 'Erro ao entrar. Tente novamente.'
        setError(msg)
        setShake(true)
        setTimeout(() => setShake(false), 500)
        return
      }
      router.push('/dashboard')
      router.refresh()
    })
  }

  const features = [
    'Orçamentos profissionais',
    'Controle financeiro completo',
    'Gestão de clientes e contratos',
  ]

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Branding */}
      <div
        className="relative hidden w-1/2 flex-col justify-between overflow-hidden lg:flex"
        style={{ backgroundColor: '#080808' }}
      >
        {/* Dot Grid Pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Red Diagonal Accent */}
        <div
          className="absolute -right-32 -top-32 h-96 w-96 rotate-45 opacity-20"
          style={{
            background: 'linear-gradient(135deg, #cc0000 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute -bottom-32 -left-32 h-96 w-96 rotate-45 opacity-10"
          style={{
            background: 'linear-gradient(315deg, #cc0000 0%, transparent 70%)',
          }}
        />

        {/* Centered Content */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-12">
          {/* Logo */}
          <div className="mb-8 flex items-center gap-1">
            <span className="font-[var(--font-barlow-condensed)] text-5xl font-black uppercase tracking-tight text-foreground">
              PORTARIA
            </span>
            <span className="rounded bg-primary px-2 py-1 font-[var(--font-barlow-condensed)] text-3xl font-black uppercase tracking-tight text-primary-foreground">
              PRO
            </span>
          </div>

          {/* Tagline */}
          <p className="mb-12 text-lg text-muted-foreground">
            Gestão inteligente de portaria virtual
          </p>

          {/* Features */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
                  <Check className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-foreground/80">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Text */}
        <div className="relative z-10 pb-8 text-center">
          <p className="text-sm text-muted-foreground">
            Confiado por{' '}
            <span className="font-semibold text-foreground">+50 condomínios</span>
          </p>
        </div>

        {/* Divider Line with Red Gradient */}
        <div
          className="absolute bottom-0 right-0 top-0 w-px"
          style={{
            background:
              'linear-gradient(180deg, transparent 0%, rgba(204,0,0,0.3) 30%, rgba(204,0,0,0.5) 50%, rgba(204,0,0,0.3) 70%, transparent 100%)',
          }}
        />
      </div>

      {/* Right Side - Login Form */}
      <div className="flex w-full flex-col items-center justify-center bg-background px-6 lg:w-1/2">
        {/* Mobile Logo */}
        <div className="mb-8 flex items-center gap-1 lg:hidden">
          <span className="font-[var(--font-barlow-condensed)] text-3xl font-black uppercase tracking-tight text-foreground">
            PORTARIA
          </span>
          <span className="rounded bg-primary px-1.5 py-0.5 font-[var(--font-barlow-condensed)] text-xl font-black uppercase tracking-tight text-primary-foreground">
            PRO
          </span>
        </div>

        {/* Login Card */}
        <div
          className={cn(
            'w-full max-w-[400px] rounded-lg border border-border bg-card p-8 transition-colors',
            'focus-within:border-primary/30',
            shake && 'animate-shake'
          )}
        >
          {/* Title */}
          <h1 className="mb-2 font-[var(--font-barlow-condensed)] text-2xl font-semibold text-foreground">
            Bem-vindo de volta
          </h1>
          <p className="mb-8 text-muted-foreground">Entre com suas credenciais</p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className={cn(
                    'w-full rounded-md border bg-secondary py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground',
                    'transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
                    error ? 'border-primary' : 'border-border'
                  )}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={cn(
                    'w-full rounded-md border bg-secondary py-3 pl-10 pr-12 text-foreground placeholder:text-muted-foreground',
                    'transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
                    error ? 'border-primary' : 'border-border'
                  )}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                href="/recuperar-senha"
                className="text-sm text-primary transition-colors hover:text-primary/80"
              >
                Esqueci minha senha
              </Link>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-md border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'w-full rounded-md bg-primary py-3 font-semibold text-primary-foreground',
                'transition-colors duration-200',
                'hover:bg-primary/90',
                'disabled:cursor-not-allowed disabled:opacity-70',
                'flex items-center justify-center gap-2'
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'ENTRAR'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Não tem uma conta?{' '}
          <Link href="/contato" className="text-primary transition-colors hover:text-primary/80">
            Entre em contato
          </Link>
        </p>
      </div>

      {/* Shake Animation */}
      <style jsx global>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-4px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(4px);
          }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}
