'use client'

import { useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { TrendingUp, TrendingDown, Wallet, BarChart2, Plus, ChevronLeft, ChevronRight, Pencil, Trash2, X, AlertTriangle } from 'lucide-react'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import dynamic from 'next/dynamic'
const FinancialChart = dynamic(
  () => import('@/components/dashboard/financial-chart').then((m) => m.FinancialChart),
  { ssr: false }
)
import { LancamentoForm } from '@/components/financeiro/LancamentoForm'
import { excluirLancamento } from '@/app/(app)/financeiro/actions'
import type { TipoLancamento, CategoriaLancamento, Lancamento } from '@prisma/client'
import type { Cargo } from '@/lib/usuario'

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

const CAT_LABEL: Record<CategoriaLancamento, string> = {
  INSTALACAO: 'Instalação', MENSALIDADE: 'Mensalidade', SERVICO: 'Serviço',
  EQUIPAMENTO: 'Equipamento', SALARIO: 'Salário', FORNECEDOR: 'Fornecedor',
  ALUGUEL: 'Aluguel', OUTROS: 'Outros',
}
const CAT_COR: Record<CategoriaLancamento, string> = {
  INSTALACAO: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  MENSALIDADE: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  SERVICO: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  EQUIPAMENTO: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  SALARIO: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  FORNECEDOR: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
  ALUGUEL: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
  OUTROS: 'text-muted-foreground bg-muted border-border',
}

type LancRow = Lancamento & { cliente: { id: string; nome: string } | null }
type ClienteOpt = { id: string; nome: string }
type Resumo = { receitas: number; despesas: number; saldoMes: number; saldoAno: number }
type ChartPt = { label: string; receitas: number; despesas: number }

type Props = {
  mes: number; ano: number
  resumo: Resumo
  lancamentos: LancRow[]
  grafico: ChartPt[]
  clientes: ClienteOpt[]
  cargo: Cargo
}

export function FinanceiroPageClient({ mes, ano, resumo, lancamentos: inicial, grafico, clientes, cargo }: Props) {
  const podeEditar = cargo !== 'OPERADOR'
  const router    = useRouter()
  const pathname  = usePathname()
  const params    = useSearchParams()
  const [modalAberto,  setModalAberto]  = useState(false)
  const [editando,     setEditando]     = useState<LancRow | null>(null)
  const [excluindo,    setExcluindo]    = useState<LancRow | null>(null)
  const [excluindoLoad, setExcluindoLoad] = useState(false)
  const [filtroTipo,   setFiltroTipo]   = useState<TipoLancamento | 'TODOS'>('TODOS')

  function navMes(delta: number) {
    let m = mes + delta, a = ano
    if (m > 12) { m = 1;  a++ }
    if (m < 1)  { m = 12; a-- }
    const p = new URLSearchParams(params.toString())
    p.set('mes', String(m)); p.set('ano', String(a))
    router.push(`${pathname}?${p.toString()}`)
  }

  const lancamentos = filtroTipo === 'TODOS' ? inicial : inicial.filter((l) => l.tipo === filtroTipo)

  const isFuturo = ano > new Date().getFullYear() || (ano === new Date().getFullYear() && mes > new Date().getMonth() + 1)

  async function handleExcluir() {
    if (!excluindo) return
    setExcluindoLoad(true)
    await excluirLancamento(excluindo.id)
    setExcluindo(null)
    setExcluindoLoad(false)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Financeiro</h1>
          <p className="text-sm text-muted-foreground capitalize">{MESES[mes - 1]} {ano}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Seletor de mês */}
          <div className="flex items-center gap-1">
            <button onClick={() => navMes(-1)} className="rounded-lg border border-border bg-secondary p-2 text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-semibold text-foreground min-w-[140px] text-center">
              {MESES[mes - 1]} {ano}
            </div>
            <button onClick={() => navMes(1)} disabled={isFuturo} className="rounded-lg border border-border bg-secondary p-2 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          {podeEditar && (
            <button
              onClick={() => { setEditando(null); setModalAberto(true) }}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" /> Novo Lançamento
            </button>
          )}
        </div>
      </div>

      {/* Cards resumo */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Receitas', valor: resumo.receitas, icon: TrendingUp,  cor: '#22c55e', bg: 'bg-emerald-500/10' },
          { label: 'Despesas', valor: resumo.despesas, icon: TrendingDown, cor: '#f87171', bg: 'bg-red-500/10' },
          {
            label: 'Saldo do Mês', valor: Math.abs(resumo.saldoMes), icon: Wallet,
            cor: resumo.saldoMes >= 0 ? '#22c55e' : '#f87171',
            bg: resumo.saldoMes >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10',
            prefixo: resumo.saldoMes >= 0 ? '+' : '−',
          },
          {
            label: 'Saldo Acumulado', valor: Math.abs(resumo.saldoAno), icon: BarChart2,
            cor: resumo.saldoAno >= 0 ? '#22c55e' : '#f87171',
            bg: resumo.saldoAno >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10',
            prefixo: resumo.saldoAno >= 0 ? '+' : '−',
          },
        ].map(({ label, valor, icon: Icon, cor, bg, prefixo }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center gap-2 text-muted-foreground">
              <div className={cn('rounded-lg p-2', bg)} style={{ color: cor }}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
            </div>
            <p className="font-heading text-2xl font-black" style={{ color: cor }}>
              {prefixo}{formatCurrency(valor)}
            </p>
          </div>
        ))}
      </div>

      {/* Gráfico */}
      <FinancialChart data={grafico} />

      {/* Tabela de lançamentos */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-lg font-bold uppercase tracking-wide text-foreground">
            Lançamentos — {inicial.length} registro{inicial.length !== 1 ? 's' : ''}
          </h3>
          <div className="flex gap-1.5">
            {(['TODOS', 'RECEITA', 'DESPESA'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFiltroTipo(t)}
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors',
                  filtroTipo === t
                    ? t === 'RECEITA' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                      : t === 'DESPESA' ? 'border-red-500/20 bg-red-500/10 text-red-400'
                      : 'border-primary/30 bg-primary/10 text-primary'
                    : 'border-border bg-secondary text-muted-foreground hover:text-foreground'
                )}
              >
                {t === 'TODOS' ? 'Todos' : t === 'RECEITA' ? '↑ Receitas' : '↓ Despesas'}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {lancamentos.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">Nenhum lançamento encontrado.</p>
          ) : (
            <div className="divide-y divide-border">
              {lancamentos.map((l) => (
                <div key={l.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/20 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{l.descricao}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn('rounded border px-1.5 py-0.5 text-[10px] font-semibold', CAT_COR[l.categoria])}>
                        {CAT_LABEL[l.categoria]}
                      </span>
                      {l.cliente && <span className="text-xs text-muted-foreground">{l.cliente.nome}</span>}
                      <span className="text-xs text-muted-foreground">{formatDate(l.data)}</span>
                    </div>
                  </div>
                  <p className={cn('font-heading text-lg font-bold shrink-0', l.tipo === 'RECEITA' ? 'text-emerald-400' : 'text-red-400')}>
                    {l.tipo === 'RECEITA' ? '+' : '−'} {formatCurrency(l.valor)}
                  </p>
                  {podeEditar && (
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => { setEditando(l); setModalAberto(true) }} className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => setExcluindo(l)} className="rounded p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal lançamento */}
      {modalAberto && (
        <LancamentoForm
          clientes={clientes}
          lancamentoEditar={editando ?? undefined}
          onFechar={() => { setModalAberto(false); setEditando(null) }}
          onSalvo={() => router.refresh()}
        />
      )}

      {/* Modal excluir */}
      {excluindo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => !excluindoLoad && setExcluindo(null)} />
          <div className="relative rounded-xl border border-border bg-card p-7 max-w-sm w-full shadow-2xl">
            <button onClick={() => setExcluindo(null)} className="absolute right-4 top-4 text-muted-foreground"><X className="h-4 w-4" /></button>
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg uppercase tracking-wide text-foreground mb-1">Excluir Lançamento</h3>
                <p className="text-sm text-muted-foreground">Excluir <strong className="text-foreground">{excluindo.descricao}</strong>? Esta ação não pode ser desfeita.</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setExcluindo(null)} className="rounded-lg border border-border bg-secondary px-4 py-2 text-sm text-foreground">Cancelar</button>
              <button onClick={handleExcluir} disabled={excluindoLoad} className="rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                {excluindoLoad ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
