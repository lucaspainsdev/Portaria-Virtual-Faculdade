'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, X, Mail, CheckCircle2 } from 'lucide-react'
import { convidarUsuario, type UsuarioRow } from '@/app/(app)/configuracoes/usuarios-actions'
import { CARGO_LABEL, CARGO_CORES } from '@/lib/usuario'

type Props = { usuarios: UsuarioRow[]; erroCarregamento?: string | null }

export function GestaoUsuarios({ usuarios, erroCarregamento }: Props) {
  const [modalAberto, setModalAberto] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '780px' }}>

      {/* Header da seção */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-barlow-condensed),sans-serif', fontWeight: 600, fontSize: '1.25rem', color: '#f0f0f0', margin: 0 }}>
            Usuários
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#555', margin: '2px 0 0' }}>
            Gerencie quem tem acesso ao sistema e qual cargo possui.
          </p>
        </div>
        <button
          onClick={() => setModalAberto(true)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            background: '#cc0000', border: 'none', borderRadius: '6px',
            padding: '9px 18px', color: '#fff', fontSize: '0.875rem', fontWeight: 700,
            cursor: 'pointer', letterSpacing: '0.04em',
          }}
        >
          <UserPlus size={15} /> Convidar Usuário
        </button>
      </div>

      {/* Tabela */}
      <div style={{ background: '#111', border: '1px solid #222', borderRadius: '8px', overflow: 'hidden' }}>
        {erroCarregamento ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: '#f87171', fontSize: '0.875rem' }}>
            Não foi possível listar os usuários: {erroCarregamento}
          </div>
        ) : usuarios.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center', color: '#555' }}>
            Nenhum usuário encontrado.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1e1e1e' }}>
                {['Nome', 'E-mail', 'Cargo', 'Status'].map((h) => (
                  <th key={h} style={{ padding: '11px 18px', textAlign: 'left', fontSize: '0.68rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => {
                const cor = CARGO_CORES[u.cargo]
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid #181818' }}>
                    <td style={{ padding: '14px 18px', color: '#e0e0e0', fontWeight: 500 }}>
                      {u.nome || <span style={{ color: '#555' }}>—</span>}
                    </td>
                    <td style={{ padding: '14px 18px', color: '#888' }}>{u.email}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        background: cor.bg,
                        border: `1px solid ${cor.borda}`,
                        borderRadius: '5px',
                        padding: '3px 10px',
                        fontSize: '0.72rem',
                        color: cor.cor,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>
                        {CARGO_LABEL[u.cargo]}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        background: u.confirmado ? '#14532d' : '#1a1a1a',
                        border: `1px solid ${u.confirmado ? '#22c55e44' : '#2a2a2a'}`,
                        borderRadius: '4px',
                        padding: '2px 10px',
                        fontSize: '0.72rem',
                        color: u.confirmado ? '#22c55e' : '#666',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}>
                        {u.confirmado ? 'Ativo' : 'Convite pendente'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {modalAberto && (
        <ModalConvite onFechar={() => setModalAberto(false)} />
      )}
    </div>
  )
}

// ─── Modal de convite ────────────────────────────────────────────────────────

function ModalConvite({ onFechar }: { onFechar: () => void }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [email, setEmail] = useState('')
  const [cargo, setCargo] = useState<'GERENTE' | 'OPERADOR'>('OPERADOR')
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    startTransition(async () => {
      const res = await convidarUsuario(email, cargo)
      if ('erro' in res) { setErro(res.erro); return }
      setSucesso(true)
      router.refresh()
      setTimeout(() => onFechar(), 1200)
    })
  }

  const inp: React.CSSProperties = {
    background: '#1a1a1a', border: '1px solid #333',
    borderRadius: '6px', padding: '9px 12px', color: '#f0f0f0',
    fontSize: '0.875rem', width: '100%', outline: 'none', boxSizing: 'border-box',
  }
  const lbl: React.CSSProperties = { fontSize: '0.78rem', color: '#999', fontWeight: 500, display: 'block', marginBottom: '4px' }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }} onClick={() => !pending && onFechar()} />
      <div style={{ position: 'relative', background: '#111', border: '1px solid #333', borderRadius: '12px', width: '100%', maxWidth: '460px', boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #222' }}>
          <h2 style={{ fontFamily: 'var(--font-barlow-condensed),sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#f0f0f0', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Convidar Usuário
          </h2>
          <button onClick={onFechar} disabled={pending} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={lbl}>E-mail *</label>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='novo.usuario@empresa.com'
              required
              autoFocus
              style={inp}
            />
            <span style={{ fontSize: '0.72rem', color: '#555', marginTop: '4px', display: 'block' }}>
              O Supabase enviará um convite por e-mail para esse endereço.
            </span>
          </div>

          <div>
            <label style={lbl}>Cargo *</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {(['OPERADOR', 'GERENTE'] as const).map((c) => {
                const ativo = cargo === c
                const cor   = CARGO_CORES[c]
                return (
                  <button
                    key={c}
                    type='button'
                    onClick={() => setCargo(c)}
                    style={{
                      padding: '10px',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      background: ativo ? cor.bg : '#1a1a1a',
                      border:     ativo ? `1.5px solid ${cor.borda}` : '1.5px solid #2a2a2a',
                      color:      ativo ? cor.cor : '#666',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {CARGO_LABEL[c]}
                  </button>
                )
              })}
            </div>
            <span style={{ fontSize: '0.72rem', color: '#555', marginTop: '6px', display: 'block' }}>
              Para criar outro DONO, edite o cargo no painel do Supabase.
            </span>
          </div>

          {erro && (
            <div style={{ background: '#450a0a', border: '1px solid #cc000044', borderRadius: '6px', padding: '10px 14px' }}>
              <span style={{ fontSize: '0.875rem', color: '#f87171' }}>{erro}</span>
            </div>
          )}

          {sucesso && (
            <div style={{ background: '#14532d', border: '1px solid #22c55e44', borderRadius: '6px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} style={{ color: '#22c55e' }} />
              <span style={{ fontSize: '0.875rem', color: '#22c55e' }}>Convite enviado.</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type='button' onClick={onFechar} disabled={pending}
              style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', padding: '9px 22px', color: '#aaa', fontSize: '0.875rem', cursor: 'pointer' }}>
              Cancelar
            </button>
            <button type='submit' disabled={pending}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                background: '#cc0000', border: 'none', borderRadius: '6px',
                padding: '9px 22px', color: '#fff', fontSize: '0.875rem', fontWeight: 700,
                cursor: pending ? 'not-allowed' : 'pointer', opacity: pending ? 0.65 : 1,
              }}>
              <Mail size={14} />
              {pending ? 'Enviando...' : 'Enviar convite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
