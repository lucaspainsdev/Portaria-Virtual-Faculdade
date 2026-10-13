export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { buscarContrato } from '@/app/(app)/contratos/actions'
import { BotaoExportarPDFContrato } from '@/components/contratos/BotaoExportarPDFContrato'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import type { StatusContrato } from '@prisma/client'

const STATUS_CFG: Record<StatusContrato, { label: string; cls: string }> = {
  ATIVO:     { label: 'Ativo',     cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  SUSPENSO:  { label: 'Suspenso',  cls: 'bg-orange-500/10 text-orange-400 border-orange-500/20'   },
  ENCERRADO: { label: 'Encerrado', cls: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'         },
}

export default async function ContratoDetalhePage({ params }: { params: { id: string } }) {
  const contrato = await buscarContrato(params.id)
  if (!contrato) notFound()

  const cfg = STATUS_CFG[contrato.status]
  const diaVencimento = new Date(contrato.dataInicio).getDate()

  return (
    <div className='space-y-6 max-w-5xl'>

      {/* Header */}
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <Link href='/contratos' className='mb-2 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors'>
            <ArrowLeft className='h-3.5 w-3.5' /> Voltar para Contratos
          </Link>
          <div className='flex items-center gap-3 flex-wrap'>
            <h1 className='font-heading text-2xl font-semibold text-foreground'>
              {contrato.numero}
            </h1>
            <span className={cn('rounded-md border px-3 py-1 text-xs font-semibold uppercase', cfg.cls)}>
              {cfg.label}
            </span>
          </div>
          <p className='mt-1 text-sm text-muted-foreground'>{contrato.cliente.nome}</p>
        </div>
        <BotaoExportarPDFContrato contratoId={contrato.id} />
      </div>

      {/* Cards info */}
      <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
        {[
          { label: 'Valor Mensal', val: formatCurrency(contrato.valorMensal) },
          { label: 'Vencimento',   val: `Dia ${diaVencimento}` },
          { label: 'Início',       val: formatDate(contrato.dataInicio) },
          { label: 'Fim',          val: contrato.dataFim ? formatDate(contrato.dataFim) : 'Indeterminado' },
        ].map(({ label, val }) => (
          <div key={label} className='rounded-xl border border-border bg-card p-4'>
            <p className='mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>{label}</p>
            <p className='text-sm font-medium text-foreground'>{val}</p>
          </div>
        ))}
      </div>

      {/* Cliente */}
      <div className='rounded-xl border border-border bg-card p-5'>
        <p className='mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>Cliente</p>
        <p className='text-base font-semibold text-foreground'>{contrato.cliente.nome}</p>
        <div className='mt-2 grid grid-cols-1 gap-1 text-sm text-muted-foreground sm:grid-cols-2'>
          {contrato.cliente.responsavel && <p>Responsável: <span className='text-foreground'>{contrato.cliente.responsavel}</span></p>}
          {contrato.cliente.cnpj        && <p>CNPJ: <span className='text-foreground'>{contrato.cliente.cnpj}</span></p>}
          {contrato.cliente.telefone    && <p>Telefone: <span className='text-foreground'>{contrato.cliente.telefone}</span></p>}
          {contrato.cliente.email       && <p>E-mail: <span className='text-foreground'>{contrato.cliente.email}</span></p>}
        </div>
      </div>

      {/* Descrição / Cláusulas */}
      {contrato.descricao && (
        <div className='rounded-xl border border-border bg-card p-5'>
          <p className='mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>Cláusulas / Descrição</p>
          <p className='whitespace-pre-wrap text-sm leading-relaxed text-foreground'>{contrato.descricao}</p>
        </div>
      )}

      {/* Observações */}
      {contrato.observacoes && (
        <div className='rounded-xl border border-border bg-card p-5'>
          <p className='mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>Observações</p>
          <p className='whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground'>{contrato.observacoes}</p>
        </div>
      )}
    </div>
  )
}
