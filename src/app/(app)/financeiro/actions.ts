'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import type { TipoLancamento, CategoriaLancamento } from '@prisma/client'
import { requireUser } from '@/lib/usuario-server'

export type LancamentoFormData = {
  tipo: TipoLancamento
  categoria: CategoriaLancamento
  descricao: string
  valor: number
  data: string
  clienteId?: string
  observacoes?: string
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function buscarResumoMes(mes: number, ano: number) {
  const inicio = new Date(ano, mes - 1, 1)
  const fim    = new Date(ano, mes, 0, 23, 59, 59)

  const lancamentos = await prisma.lancamento.findMany({
    where: { data: { gte: inicio, lte: fim } },
    select: { tipo: true, valor: true },
  })

  const receitas  = lancamentos.filter((l) => l.tipo === 'RECEITA').reduce((s, l) => s + Number(l.valor), 0)
  const despesas  = lancamentos.filter((l) => l.tipo === 'DESPESA').reduce((s, l) => s + Number(l.valor), 0)
  const saldoMes  = receitas - despesas

  // Saldo acumulado: 1 jan até fim do mês selecionado
  const inicioAno = new Date(ano, 0, 1)
  const todoAno   = await prisma.lancamento.findMany({
    where: { data: { gte: inicioAno, lte: fim } },
    select: { tipo: true, valor: true },
  })
  const saldoAno =
    todoAno.filter((l) => l.tipo === 'RECEITA').reduce((s, l) => s + Number(l.valor), 0) -
    todoAno.filter((l) => l.tipo === 'DESPESA').reduce((s, l) => s + Number(l.valor), 0)

  return { receitas, despesas, saldoMes, saldoAno }
}

export async function buscarLancamentos(mes: number, ano: number) {
  const inicio = new Date(ano, mes - 1, 1)
  const fim    = new Date(ano, mes, 0, 23, 59, 59)

  return prisma.lancamento.findMany({
    where: { data: { gte: inicio, lte: fim } },
    orderBy: { data: 'desc' },
    include: { cliente: { select: { id: true, nome: true } } },
  })
}

export async function buscarGrafico(mesRef: number, anoRef: number) {
  // últimos 6 meses incluindo o mês de referência
  const meses: { mes: number; ano: number; label: string }[] = []
  let m = mesRef, a = anoRef
  for (let i = 0; i < 6; i++) {
    meses.unshift({
      mes: m, ano: a,
      label: new Date(a, m - 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
    })
    m--
    if (m === 0) { m = 12; a-- }
  }

  const dados = await Promise.all(
    meses.map(async ({ mes, ano, label }) => {
      const inicio = new Date(ano, mes - 1, 1)
      const fim    = new Date(ano, mes, 0, 23, 59, 59)
      const rows   = await prisma.lancamento.findMany({
        where: { data: { gte: inicio, lte: fim } },
        select: { tipo: true, valor: true },
      })
      const receitas = rows.filter((r) => r.tipo === 'RECEITA').reduce((s, r) => s + Number(r.valor), 0)
      const despesas = rows.filter((r) => r.tipo === 'DESPESA').reduce((s, r) => s + Number(r.valor), 0)
      return { label, receitas, despesas }
    })
  )
  return dados
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function criarLancamento(data: LancamentoFormData) {
  if (!await requireUser()) return { erro: 'Não autenticado.' }
  if (!data.descricao?.trim()) return { erro: 'Informe a descrição.' }
  if (!data.valor || data.valor <= 0)  return { erro: 'Valor deve ser maior que zero.' }
  if (!data.data)                      return { erro: 'Informe a data.' }

  try {
    await prisma.lancamento.create({
      data: {
        tipo:       data.tipo,
        categoria:  data.categoria,
        descricao:  data.descricao.trim(),
        valor:      data.valor,
        data:       new Date(data.data),
        clienteId:  data.clienteId || null,
        observacoes: data.observacoes?.trim() || null,
      },
    })
    revalidatePath('/financeiro')
    return { ok: true }
  } catch {
    return { erro: 'Erro ao salvar lançamento.' }
  }
}

export async function atualizarLancamento(id: string, data: LancamentoFormData) {
  if (!await requireUser()) return { erro: 'Não autenticado.' }
  if (!data.descricao?.trim()) return { erro: 'Informe a descrição.' }
  if (!data.valor || data.valor <= 0) return { erro: 'Valor deve ser maior que zero.' }

  try {
    await prisma.lancamento.update({
      where: { id },
      data: {
        tipo:       data.tipo,
        categoria:  data.categoria,
        descricao:  data.descricao.trim(),
        valor:      data.valor,
        data:       new Date(data.data),
        clienteId:  data.clienteId || null,
        observacoes: data.observacoes?.trim() || null,
      },
    })
    revalidatePath('/financeiro')
    return { ok: true }
  } catch {
    return { erro: 'Erro ao atualizar lançamento.' }
  }
}

export async function excluirLancamento(id: string) {
  if (!await requireUser()) return { erro: 'Não autenticado.' }
  try {
    await prisma.lancamento.delete({ where: { id } })
    revalidatePath('/financeiro')
    return { ok: true }
  } catch {
    return { erro: 'Erro ao excluir.' }
  }
}

export async function listarClientesSelect() {
  return prisma.cliente.findMany({
    where: { ativo: true },
    select: { id: true, nome: true },
    orderBy: { nome: 'asc' },
  })
}
