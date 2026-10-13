'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import type { StatusContrato } from '@prisma/client'
import { requireUser } from '@/lib/usuario-server'

export type ContratoFormData = {
  clienteId:               string
  numero:                  string
  descricao?:              string
  valorMensal:             number
  dataInicio:              string   // YYYY-MM-DD
  dataFim?:                string
  status?:                 StatusContrato
  observacoes?:            string
  clausulasPersonalizadas?: string
}

// ── Queries ──────────────────────────────────────────────────────────────────

export async function listarContratos() {
  return prisma.contrato.findMany({
    orderBy: { createdAt: 'desc' },
    include: { cliente: { select: { id: true, nome: true, responsavel: true } } },
  })
}

export async function buscarContrato(id: string) {
  return prisma.contrato.findUnique({
    where: { id },
    include: { cliente: true },
  })
}

export async function listarClientesSelect() {
  return prisma.cliente.findMany({
    where: { ativo: true },
    select: { id: true, nome: true },
    orderBy: { nome: 'asc' },
  })
}

export async function buscarContratoParaPDF(id: string) {
  try {
    const [contrato, config] = await Promise.all([
      prisma.contrato.findUnique({
        where: { id },
        include: { cliente: true },
      }),
      prisma.configuracao.findFirst({ orderBy: { createdAt: 'asc' } }),
    ])

    if (!contrato) return { erro: 'Contrato não encontrado.' }

    return {
      contrato: {
        numero:                  contrato.numero,
        descricao:               contrato.descricao,
        valorMensal:             Number(contrato.valorMensal),
        dataInicio:              contrato.dataInicio,
        dataFim:                 contrato.dataFim,
        status:                  contrato.status,
        observacoes:             contrato.observacoes,
        clausulasPersonalizadas: contrato.clausulasPersonalizadas,
        createdAt:               contrato.createdAt,
        cliente: {
          nome:        contrato.cliente.nome,
          responsavel: contrato.cliente.responsavel,
          cnpj:        contrato.cliente.cnpj,
          cpf:         contrato.cliente.cpf,
          endereco:    contrato.cliente.endereco,
          numero:      contrato.cliente.numero,
          bairro:      contrato.cliente.bairro,
          cidade:      contrato.cliente.cidade,
          estado:      contrato.cliente.estado,
          cep:         contrato.cliente.cep,
        },
        configuracao: config ? {
          nomeEmpresa: config.nomeEmpresa,
          cnpj:        config.cnpj,
          telefone:    config.telefone,
          email:       config.email,
          site:        config.site,
          endereco:    config.endereco,
          cidade:      config.cidade,
          estado:      config.estado,
          cep:         config.cep,
          logoUrl:     config.logoUrl,
        } : null,
      },
    }
  } catch (e) {
    return { erro: e instanceof Error ? e.message : 'Erro ao buscar contrato.' }
  }
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export async function criarContrato(data: ContratoFormData) {
  if (!await requireUser()) return { erro: 'Não autenticado.' }
  if (!data.clienteId)       return { erro: 'Selecione um cliente.' }
  if (!data.numero?.trim())  return { erro: 'Informe o número do contrato.' }
  if (data.valorMensal <= 0) return { erro: 'Valor mensal deve ser maior que zero.' }
  if (!data.dataInicio)      return { erro: 'Informe a data de início.' }

  try {
    const contrato = await prisma.contrato.create({
      data: {
        clienteId:               data.clienteId,
        numero:                  data.numero.trim(),
        descricao:               data.descricao?.trim()                || null,
        valorMensal:             data.valorMensal,
        dataInicio:              new Date(data.dataInicio),
        dataFim:                 data.dataFim ? new Date(data.dataFim) : null,
        status:                  data.status ?? 'ATIVO',
        observacoes:             data.observacoes?.trim()              || null,
        clausulasPersonalizadas: data.clausulasPersonalizadas?.trim()  || null,
      },
    })
    revalidatePath('/contratos')
    return { contrato }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : ''
    if (msg.includes('Unique constraint')) return { erro: 'Já existe um contrato com este número.' }
    return { erro: 'Erro ao criar contrato.' }
  }
}

export async function atualizarContrato(id: string, data: ContratoFormData) {
  if (!await requireUser()) return { erro: 'Não autenticado.' }
  if (!data.numero?.trim())  return { erro: 'Informe o número do contrato.' }
  if (data.valorMensal <= 0) return { erro: 'Valor mensal deve ser maior que zero.' }

  try {
    const contrato = await prisma.contrato.update({
      where: { id },
      data: {
        numero:                  data.numero.trim(),
        descricao:               data.descricao?.trim()                || null,
        valorMensal:             data.valorMensal,
        dataInicio:              new Date(data.dataInicio),
        dataFim:                 data.dataFim ? new Date(data.dataFim) : null,
        status:                  data.status ?? 'ATIVO',
        observacoes:             data.observacoes?.trim()              || null,
        clausulasPersonalizadas: data.clausulasPersonalizadas?.trim()  || null,
      },
    })
    revalidatePath('/contratos')
    revalidatePath(`/contratos/${id}`)
    return { contrato }
  } catch {
    return { erro: 'Erro ao atualizar contrato.' }
  }
}

export async function atualizarStatusContrato(id: string, status: StatusContrato) {
  if (!await requireUser()) return { erro: 'Não autenticado.' }
  try {
    await prisma.contrato.update({ where: { id }, data: { status } })
    revalidatePath('/contratos')
    return { ok: true }
  } catch {
    return { erro: 'Erro ao atualizar status.' }
  }
}

export async function excluirContrato(id: string) {
  if (!await requireUser()) return { erro: 'Não autenticado.' }
  try {
    await prisma.contrato.delete({ where: { id } })
    revalidatePath('/contratos')
    return { ok: true }
  } catch {
    return { erro: 'Não é possível excluir: contrato possui registros vinculados.' }
  }
}
