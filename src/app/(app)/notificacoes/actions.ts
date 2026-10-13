'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import type { TipoNotificacao } from '@prisma/client'
import { requireUser } from '@/lib/usuario-server'

const DIA_MS = 86_400_000

export async function gerarNotificacoes() {
  if (!await requireUser()) return { erro: 'Não autenticado.' }
  const agora    = new Date()
  const em7Dias  = new Date(agora.getTime() + 7 * DIA_MS)
  const em30Dias = new Date(agora.getTime() + 30 * DIA_MS)
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1)
  const fimMes    = new Date(agora.getFullYear(), agora.getMonth() + 1, 0, 23, 59, 59)

  // ── 1. Contratos urgentes (≤ 7 dias) ────────────────────────────────────
  const contratosUrgentes = await prisma.contrato.findMany({
    where:   { status: 'ATIVO', dataFim: { gte: agora, lte: em7Dias } },
    include: { cliente: { select: { nome: true } } },
  })

  // ── 2. Contratos vencendo (> 7 e ≤ 30 dias) ─────────────────────────────
  const contratosVencendo = await prisma.contrato.findMany({
    where:   { status: 'ATIVO', dataFim: { gt: em7Dias, lte: em30Dias } },
    include: { cliente: { select: { nome: true } } },
  })

  // ── 3. Mensalidades atrasadas (mesma lógica do dashboard) ───────────────
  const ativos = await prisma.contrato.findMany({
    where:  { status: 'ATIVO' },
    select: { id: true, clienteId: true, cliente: { select: { nome: true } } },
  })
  let atrasadas: typeof ativos = []
  if (ativos.length > 0) {
    const pagas = await prisma.lancamento.findMany({
      where: {
        categoria: 'MENSALIDADE',
        tipo:      'RECEITA',
        data:      { gte: inicioMes, lte: fimMes },
        clienteId: { in: ativos.map((c) => c.clienteId) },
      },
      select: { clienteId: true },
    })
    const pagaramSet = new Set(pagas.map((p) => p.clienteId))
    atrasadas = ativos.filter((c) => c.clienteId && !pagaramSet.has(c.clienteId))
  }

  // ── Dedupe via findFirst (evita duplicar não lidas iguais) ──────────────
  async function criarSeNovo(data: {
    tipo:     TipoNotificacao
    titulo:   string
    mensagem: string
    link:     string
  }) {
    const existe = await prisma.notificacao.findFirst({
      where: { tipo: data.tipo, link: data.link, lida: false },
      select: { id: true },
    })
    if (existe) return
    await prisma.notificacao.create({ data })
  }

  const fmt = (d: Date | null) => d ? d.toLocaleDateString('pt-BR') : '—'

  for (const c of contratosUrgentes) {
    await criarSeNovo({
      tipo:     'CONTRATO_URGENTE',
      titulo:   `${c.numero} vence em até 7 dias`,
      mensagem: `O contrato com ${c.cliente.nome} vence em ${fmt(c.dataFim)}. Renovação urgente.`,
      link:     `/contratos/${c.id}`,
    })
  }
  for (const c of contratosVencendo) {
    await criarSeNovo({
      tipo:     'CONTRATO_VENCENDO',
      titulo:   `${c.numero} vencendo`,
      mensagem: `O contrato com ${c.cliente.nome} vence em ${fmt(c.dataFim)}.`,
      link:     `/contratos/${c.id}`,
    })
  }
  for (const m of atrasadas) {
    await criarSeNovo({
      tipo:     'MENSALIDADE_ATRASADA',
      titulo:   `Mensalidade não paga`,
      mensagem: `${m.cliente.nome} ainda não tem lançamento de mensalidade neste mês.`,
      link:     `/financeiro`,
    })
  }

  revalidatePath('/notificacoes')
  revalidatePath('/dashboard')
  return { ok: true }
}

export async function listarNotificacoes() {
  return prisma.notificacao.findMany({ orderBy: { createdAt: 'desc' } })
}

export async function listarNotificacoesRecentes(limit = 5) {
  return prisma.notificacao.findMany({
    where:   { lida: false },
    orderBy: { createdAt: 'desc' },
    take:    limit,
  })
}

export async function contarNaoLidas(): Promise<number> {
  try {
    return await prisma.notificacao.count({ where: { lida: false } })
  } catch {
    return 0
  }
}

export async function marcarComoLida(id: string) {
  if (!await requireUser()) return { erro: 'Não autenticado.' }
  try {
    await prisma.notificacao.update({ where: { id }, data: { lida: true } })
    revalidatePath('/notificacoes')
    return { ok: true }
  } catch (e) {
    return { erro: e instanceof Error ? e.message : 'Erro.' }
  }
}

export async function marcarTodasComoLidas() {
  if (!await requireUser()) return { erro: 'Não autenticado.' }
  await prisma.notificacao.updateMany({ where: { lida: false }, data: { lida: true } })
  revalidatePath('/notificacoes')
  return { ok: true }
}
