'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Save, CheckCircle2 } from 'lucide-react'
import { salvarConfiguracao, type ConfiguracaoFormData } from '@/app/(app)/configuracoes/actions'
import { formatCNPJ, formatTelefone, formatCEP } from '@/lib/utils'
import type { Configuracao } from '@prisma/client'

type Props = { configuracao: Configuracao | null }

export function ConfiguracoesForm({ configuracao }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [erros, setErros] = useState<Record<string, string>>({})
  const [salvouAgora, setSalvouAgora] = useState(false)

  const [nomeEmpresa, setNomeEmpresa] = useState(configuracao?.nomeEmpresa ?? '')
  const [cnpj,        setCnpj]        = useState(configuracao?.cnpj        ?? '')
  const [telefone,    setTelefone]    = useState(configuracao?.telefone    ?? '')
  const [email,       setEmail]       = useState(configuracao?.email       ?? '')
  const [site,        setSite]        = useState(configuracao?.site        ?? '')
  const [endereco,    setEndereco]    = useState(configuracao?.endereco    ?? '')
  const [cidade,      setCidade]      = useState(configuracao?.cidade      ?? '')
  const [estado,      setEstado]      = useState(configuracao?.estado      ?? '')
  const [cep,         setCep]         = useState(configuracao?.cep         ?? '')
  const [logoUrl,     setLogoUrl]     = useState(configuracao?.logoUrl     ?? '')
  const [descricao,   setDescricao]   = useState(configuracao?.descricao   ?? '')

  function validate() {
    const e: Record<string, string> = {}
    if (!nomeEmpresa.trim()) e.nomeEmpresa = 'Nome da empresa é obrigatório.'
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'E-mail inválido.'
    setErros(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSalvouAgora(false)
    if (!validate()) return
    const data: ConfiguracaoFormData = {
      nomeEmpresa, cnpj, telefone, email, site,
      endereco, cidade, estado, cep, logoUrl, descricao,
    }
    startTransition(async () => {
      const res = await salvarConfiguracao(data)
      if (res && 'erro' in res && res.erro) { setErros({ geral: res.erro }); return }
      setSalvouAgora(true)
      router.refresh()
    })
  }

  const inp = (hasErr?: boolean): React.CSSProperties => ({
    background: '#1a1a1a', border: `1px solid ${hasErr ? '#cc0000' : '#333'}`,
    borderRadius: '6px', padding: '9px 12px', color: '#f0f0f0',
    fontSize: '0.875rem', width: '100%', outline: 'none', boxSizing: 'border-box',
  })
  const lbl: React.CSSProperties = { fontSize: '0.78rem', color: '#999', fontWeight: 500, display: 'block', marginBottom: '4px' }
  const fld: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '4px' }
  const err = (campo: string) => erros[campo]
    ? <span style={{ fontSize: '0.72rem', color: '#f87171' }}>{erros[campo]}</span>
    : null

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '780px' }}>

      {/* Header */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-barlow-condensed),sans-serif', fontWeight: 600, fontSize: '1.5rem', color: '#f0f0f0', margin: 0 }}>
          Configurações
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#555', margin: '4px 0 0' }}>
          Dados da empresa exibidos em orçamentos, contratos e documentos.
        </p>
      </div>

      {/* Card principal */}
      <div style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

        {/* Identificação */}
        <Secao titulo='Identificação'>
          <div style={{ gridColumn: '1/-1', ...fld }}>
            <label style={lbl}>Nome da empresa *</label>
            <input value={nomeEmpresa} onChange={(e) => setNomeEmpresa(e.target.value)} placeholder='Ex: Virtual Camp Portaria Virtual' style={inp(!!erros.nomeEmpresa)} />
            {err('nomeEmpresa')}
          </div>
          <div style={fld}>
            <label style={lbl}>CNPJ</label>
            <input value={cnpj} onChange={(e) => setCnpj(formatCNPJ(e.target.value))} placeholder='00.000.000/0000-00' maxLength={18} style={inp()} />
          </div>
          <div style={{ gridColumn: '1/-1', ...fld }}>
            <label style={lbl}>Descrição / slogan</label>
            <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={2} placeholder='Texto curto que aparece em cabeçalhos e documentos...' style={{ ...inp(), resize: 'vertical' }} />
          </div>
        </Secao>

        {/* Contato */}
        <Secao titulo='Contato'>
          <div style={fld}>
            <label style={lbl}>Telefone</label>
            <input value={telefone} onChange={(e) => setTelefone(formatTelefone(e.target.value))} placeholder='(00) 00000-0000' maxLength={15} style={inp()} />
          </div>
          <div style={fld}>
            <label style={lbl}>E-mail</label>
            <input type='email' value={email} onChange={(e) => setEmail(e.target.value)} placeholder='contato@empresa.com.br' style={inp(!!erros.email)} />
            {err('email')}
          </div>
          <div style={{ gridColumn: '1/-1', ...fld }}>
            <label style={lbl}>Site</label>
            <input value={site} onChange={(e) => setSite(e.target.value)} placeholder='https://www.empresa.com.br' style={inp()} />
          </div>
        </Secao>

        {/* Endereço */}
        <Secao titulo='Endereço' cols={3}>
          <div style={{ gridColumn: 'span 2', ...fld }}>
            <label style={lbl}>Rua / Avenida</label>
            <input value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder='Ex: Av. Paulista, 1000' style={inp()} />
          </div>
          <div style={fld}>
            <label style={lbl}>CEP</label>
            <input value={cep} onChange={(e) => setCep(formatCEP(e.target.value))} placeholder='00000-000' maxLength={9} style={inp()} />
          </div>
          <div style={{ gridColumn: 'span 2', ...fld }}>
            <label style={lbl}>Cidade</label>
            <input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder='São Paulo' style={inp()} />
          </div>
          <div style={fld}>
            <label style={lbl}>UF</label>
            <input value={estado} onChange={(e) => setEstado(e.target.value.toUpperCase())} placeholder='SP' maxLength={2} style={inp()} />
          </div>
        </Secao>

        {/* Branding */}
        <Secao titulo='Branding'>
          <div style={{ gridColumn: '1/-1', ...fld }}>
            <label style={lbl}>URL do logo</label>
            <input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder='https://...' style={inp()} />
            <span style={{ fontSize: '0.72rem', color: '#555', marginTop: '2px' }}>
              Cole a URL pública de uma imagem hospedada (Supabase Storage, CDN, etc.).
            </span>
          </div>
        </Secao>

        {/* Erro geral */}
        {erros.geral && (
          <div style={{ background: '#450a0a', border: '1px solid #cc000044', borderRadius: '6px', padding: '10px 14px' }}>
            <span style={{ fontSize: '0.875rem', color: '#f87171' }}>{erros.geral}</span>
          </div>
        )}

        {/* Sucesso */}
        {salvouAgora && (
          <div style={{ background: '#14532d', border: '1px solid #22c55e44', borderRadius: '6px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} style={{ color: '#22c55e' }} />
            <span style={{ fontSize: '0.875rem', color: '#22c55e' }}>Configurações salvas com sucesso.</span>
          </div>
        )}

        {/* Botão */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type='submit' disabled={pending}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              background: '#cc0000', border: 'none', borderRadius: '6px',
              padding: '10px 22px', color: '#fff', fontSize: '0.875rem', fontWeight: 700,
              cursor: pending ? 'not-allowed' : 'pointer', opacity: pending ? 0.65 : 1,
              letterSpacing: '0.04em',
            }}>
            <Save size={15} />
            {pending ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      </div>
    </form>
  )
}

function Secao({ titulo, children, cols = 2 }: { titulo: string; children: React.ReactNode; cols?: number }) {
  return (
    <div>
      <p style={{ fontSize: '0.7rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '14px' }}>
        {titulo}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '14px' }}>
        {children}
      </div>
    </div>
  )
}
