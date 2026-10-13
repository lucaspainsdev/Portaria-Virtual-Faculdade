'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import type { CategoriaEquipamento } from '@prisma/client'
import { requireUser } from '@/lib/usuario-server'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcPrecoFinal(fornecedor: number, margem: number | null | undefined): number {
  if (!margem || margem <= 0) return fornecedor
  return fornecedor * (1 + margem / 100)
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export type EquipamentoFormData = {
  codigo?:          string
  nome:             string
  descricao?:       string
  categoria:        CategoriaEquipamento
  unidade:          string
  precoBase:        number   // preço final calculado
  precoFornecedor?: number
  margem?:          number
  ativo?:           boolean
}

export async function listarEquipamentos() {
  return prisma.equipamento.findMany({
    orderBy: [{ categoria: 'asc' }, { nome: 'asc' }],
    include: { _count: { select: { itensOrcamento: true } } },
  })
}

export async function criarEquipamento(data: EquipamentoFormData) {
  if (!await requireUser()) return { erro: 'Não autenticado.' }
  if (!data.nome?.trim())   return { erro: 'Nome é obrigatório.' }
  if (data.precoBase <= 0)  return { erro: 'Preço deve ser maior que zero.' }

  const codigo = data.codigo?.trim() || null
  if (codigo) {
    const existente = await prisma.equipamento.findUnique({ where: { codigo } })
    if (existente) return { erro: `Já existe um equipamento com o código "${codigo}".` }
  }

  try {
    const eq = await prisma.equipamento.create({
      data: {
        codigo,
        nome:            data.nome.trim(),
        descricao:       data.descricao?.trim() || null,
        categoria:       data.categoria,
        unidade:         data.unidade || 'un',
        precoFornecedor: data.precoFornecedor ?? null,
        margem:          data.margem          ?? null,
        precoBase:       data.precoBase,
        ativo:           data.ativo ?? true,
      },
    })
    revalidatePath('/equipamentos')
    return { equipamento: eq }
  } catch {
    return { erro: 'Erro ao criar equipamento.' }
  }
}

export async function atualizarEquipamento(id: string, data: EquipamentoFormData) {
  if (!await requireUser()) return { erro: 'Não autenticado.' }
  if (!data.nome?.trim())  return { erro: 'Nome é obrigatório.' }
  if (data.precoBase <= 0) return { erro: 'Preço deve ser maior que zero.' }

  const codigo = data.codigo?.trim() || null
  if (codigo) {
    const existente = await prisma.equipamento.findUnique({ where: { codigo } })
    if (existente && existente.id !== id) return { erro: `Já existe um equipamento com o código "${codigo}".` }
  }

  try {
    const eq = await prisma.equipamento.update({
      where: { id },
      data: {
        codigo,
        nome:            data.nome.trim(),
        descricao:       data.descricao?.trim() || null,
        categoria:       data.categoria,
        unidade:         data.unidade || 'un',
        precoFornecedor: data.precoFornecedor ?? null,
        margem:          data.margem          ?? null,
        precoBase:       data.precoBase,
        ativo:           data.ativo ?? true,
      },
    })
    revalidatePath('/equipamentos')
    return { equipamento: eq }
  } catch {
    return { erro: 'Erro ao atualizar equipamento.' }
  }
}

export async function toggleAtivoEquipamento(id: string, ativo: boolean) {
  if (!await requireUser()) return { erro: 'Não autenticado.' }
  try {
    await prisma.equipamento.update({ where: { id }, data: { ativo } })
    revalidatePath('/equipamentos')
    return { ok: true }
  } catch {
    return { erro: 'Erro ao alterar status.' }
  }
}

export async function excluirEquipamento(id: string) {
  if (!await requireUser()) return { erro: 'Não autenticado.' }
  const uso = await prisma.orcamentoItem.count({ where: { equipamentoId: id } })
  if (uso > 0)
    return { erro: `Não é possível excluir: equipamento está em ${uso} orçamento${uso > 1 ? 's' : ''}.` }

  try {
    await prisma.equipamento.delete({ where: { id } })
    revalidatePath('/equipamentos')
    return { ok: true }
  } catch {
    return { erro: 'Erro ao excluir equipamento.' }
  }
}

// ─── Margem em massa ──────────────────────────────────────────────────────────

export async function definirMargemEmMassa(ids: string[], margem: number) {
  if (!await requireUser()) return { erro: 'Não autenticado.' }
  if (!isFinite(margem) || margem < 0 || margem > 200)
    return { erro: 'Margem deve ser entre 0 e 200.' }
  if (ids.length === 0) return { erro: 'Nenhum equipamento selecionado.' }

  let atualizados = 0
  const erros: string[] = []

  for (const id of ids) {
    try {
      const eq = await prisma.equipamento.findUnique({
        where: { id },
        select: { id: true, nome: true, precoFornecedor: true, precoBase: true },
      })
      if (!eq) { erros.push(`ID ${id}: não encontrado`); continue }

      const base = eq.precoFornecedor ?? Number(eq.precoBase)
      const novoPreco = calcPrecoFinal(base, margem)

      await prisma.equipamento.update({
        where: { id },
        data: {
          margem,
          precoFornecedor: eq.precoFornecedor ?? Number(eq.precoBase),
          precoBase: novoPreco,
        },
      })
      atualizados++
    } catch (e) {
      erros.push(`${id}: ${e instanceof Error ? e.message : 'erro'}`)
    }
  }

  revalidatePath('/equipamentos')
  return { atualizados, erros }
}
