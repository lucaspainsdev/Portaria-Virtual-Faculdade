'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, Plus, Building2, Phone, Mail, MapPin, Pencil, History, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { staggerContainer, staggerItem, spring } from '@/lib/animations'
import { ClienteFormModal } from './ClienteFormModal'
import type { Cliente } from '@prisma/client'
import type { Cargo } from '@/lib/usuario'

type ClienteRow = Cliente & { _count: { contratos: number; propostas: number } }

export function ClientesPageClient({ clientes: inicial, cargo }: { clientes: ClienteRow[]; cargo: Cargo }) {
  const podeEditar = cargo !== 'OPERADOR'
  const router = useRouter()
  const clientes = inicial
  const [busca,    setBusca]    = useState('')
  const [modal,    setModal]    = useState<'novo' | ClienteRow | null>(null)

  const filtrados = useMemo(() => {
    const q = busca.toLowerCase().trim()
    if (!q) return clientes
    return clientes.filter(
      (c) =>
        c.nome.toLowerCase().includes(q) ||
        c.responsavel?.toLowerCase().includes(q) ||
        c.cidade?.toLowerCase().includes(q) ||
        c.cnpj?.includes(q)
    )
  }, [clientes, busca])

  const total   = clientes.length
  const ativos  = clientes.filter((c) => c.ativo).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontFamily: 'var(--font-barlow-condensed),sans-serif', fontWeight: 600, fontSize: '1.5rem', color: '#f0f0f0', margin: 0 }}>
              Clientes
            </h1>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '20px', padding: '3px 12px', fontSize: '0.78rem', color: '#888', fontWeight: 600 }}>
                {total} total
              </span>
              <span style={{ background: '#14532d', border: '1px solid #22c55e33', borderRadius: '20px', padding: '3px 12px', fontSize: '0.78rem', color: '#22c55e', fontWeight: 600 }}>
                {ativos} ativos
              </span>
            </div>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#555', margin: '4px 0 0' }}>
            Condomínios e clientes cadastrados
          </p>
        </div>
        {podeEditar && (
          <button
            onClick={() => setModal('novo')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: '#cc0000', border: '1px solid #aa000066', borderRadius: '6px', padding: '9px 18px', color: '#fff', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
          >
            <Plus size={15} /> Novo Cliente
          </button>
        )}
      </div>

      {/* ── Busca ── */}
      <div style={{ position: 'relative' }}>
        <Search size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#555', pointerEvents: 'none' }} />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder='Buscar por nome, responsável, cidade ou CNPJ...'
          style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '10px 14px 10px 38px', color: '#f0f0f0', fontSize: '0.875rem', width: '100%', outline: 'none', boxSizing: 'border-box' }}
        />
        {busca && (
          <button onClick={() => setBusca('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: '2px', display: 'flex' }}>
            <X size={14} />
          </button>
        )}
      </div>

      {/* ── Resultado da busca ── */}
      {busca && (
        <p style={{ fontSize: '0.8rem', color: '#555', margin: '-12px 0 -8px' }}>
          {filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''} para &quot;{busca}&quot;
        </p>
      )}

      {/* ── Grid ── */}
      {filtrados.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', textAlign: 'center' }}>
          <Building2 size={40} style={{ color: '#2a2a2a', marginBottom: '16px' }} />
          <p style={{ color: '#555', fontWeight: 500, margin: 0 }}>
            {busca ? 'Nenhum cliente encontrado para essa busca.' : 'Nenhum cliente cadastrado.'}
          </p>
          {!busca && (
            <p style={{ color: '#333', fontSize: '0.875rem', marginTop: '6px' }}>
              Clique em &quot;NOVO CLIENTE&quot; para começar.
            </p>
          )}
        </div>
      ) : (
        <motion.div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}
          variants={staggerContainer}
          initial='initial'
          animate='animate'
        >
          {filtrados.map((c) => (
            <motion.div key={c.id} variants={staggerItem}>
              <ClienteCard cliente={c} onEditar={podeEditar ? () => setModal(c) : undefined} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ── Modal ── */}
      {modal && (
        <ClienteFormModal
          cliente={modal === 'novo' ? undefined : modal}
          onFechar={() => setModal(null)}
          onSalvo={() => { router.refresh(); setModal(null) }}
        />
      )}
    </div>
  )
}

// ─── Card ───────────────────────────────────────────────────────────────────

function ClienteCard({ cliente: c, onEditar }: { cliente: ClienteRow; onEditar?: () => void }) {
  const localizacao = [c.cidade, c.estado].filter(Boolean).join(', ')

  return (
    <motion.div
      style={{ background: '#111', border: '1px solid #222', borderRadius: '10px', overflow: 'hidden', borderTop: `2px solid ${c.ativo ? '#cc0000' : '#333'}`, display: 'flex', flexDirection: 'column' }}
      whileHover={{ y: -3, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', borderColor: '#333' }}
      transition={spring}
    >
      {/* Corpo */}
      <div style={{ padding: '20px', flex: 1 }}>
        {/* Nome + badge */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#1a1a1a', border: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Building2 size={16} style={{ color: '#cc0000' }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f0f0f0', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.nome}</p>
              {c.cnpj && <p style={{ fontSize: '0.72rem', color: '#555', margin: '2px 0 0' }}>{c.cnpj}</p>}
            </div>
          </div>
          <span style={{ background: c.ativo ? '#14532d' : '#1a1a1a', border: `1px solid ${c.ativo ? '#22c55e44' : '#333'}`, borderRadius: '4px', padding: '2px 10px', fontSize: '0.72rem', color: c.ativo ? '#22c55e' : '#666', fontWeight: 700, flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {c.ativo ? 'Ativo' : 'Inativo'}
          </span>
        </div>

        {/* Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
          {c.responsavel && (
            <InfoLinha icon={<History size={12} />} texto={c.responsavel} />
          )}
          {c.telefone && (
            <InfoLinha icon={<Phone size={12} />} texto={c.telefone} />
          )}
          {c.email && (
            <InfoLinha icon={<Mail size={12} />} texto={c.email} truncar />
          )}
          {localizacao && (
            <InfoLinha icon={<MapPin size={12} />} texto={localizacao} />
          )}
        </div>

        {/* Contadores */}
        <div style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid #1e1e1e' }}>
          {c._count.contratos > 0 && (
            <Link href='/contratos' style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '5px', padding: '4px 10px' }}>
              <span style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600 }}>
                {c._count.contratos} contrato{c._count.contratos !== 1 ? 's' : ''}
              </span>
            </Link>
          )}
          {c._count.propostas > 0 && (
            <Link href='/propostas' style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '5px', padding: '4px 10px' }}>
              <span style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600 }}>
                {c._count.propostas} proposta{c._count.propostas !== 1 ? 's' : ''}
              </span>
            </Link>
          )}
        </div>
      </div>

      {/* Rodapé com ações */}
      <div style={{ display: 'flex', borderTop: '1px solid #1e1e1e' }}>
        {onEditar && (
          <button
            onClick={onEditar}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '11px', background: 'none', border: 'none', borderRight: '1px solid #1e1e1e', cursor: 'pointer', color: '#666', fontSize: '0.8rem', fontWeight: 500 }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.color = '#f0f0f0' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#666' }}
          >
            <Pencil size={13} /> Editar
          </button>
        )}
        <Link
          href={`/clientes/${c.id}`}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '11px', color: '#666', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 500, transition: 'background 0.15s, color 0.15s' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.color = '#f0f0f0' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#666' }}
        >
          <History size={13} /> Ver histórico
        </Link>
      </div>
    </motion.div>
  )
}

function InfoLinha({ icon, texto, truncar }: { icon: React.ReactNode; texto: string; truncar?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#666' }}>
      <span style={{ flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: '0.8rem', ...(truncar ? { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } : {}) }}>
        {texto}
      </span>
    </div>
  )
}
