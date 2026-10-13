'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/usuario-server'

export type ClienteFormData = {
  nome: string
  cnpj?: string
  cpf?: string
  responsavel?: string
  telefone?: string
  email?: string
  endereco?: string
  numero?: string
  bairro?: string
  cidade?: string
  estado?: string
  cep?: string
  ativo?: boolean
  observacoes?: string
}

export async function criarCliente(data: ClienteFormData) {
  if (!await requireUser()) return { erro: 'Não autenticado.' }
  if (!data.nome?.trim()) return { erro: 'Nome é obrigatório.' }

  try {
    const cliente = await prisma.cliente.create({
      data: {
        nome:        data.nome.trim(),
        cnpj:        data.cnpj?.trim()        || null,
        cpf:         data.cpf?.trim()         || null,
        responsavel: data.responsavel?.trim() || null,
        telefone:    data.telefone?.trim()    || null,
        email:       data.email?.trim()       || null,
        endereco:    data.endereco?.trim()    || null,
        numero:      data.numero?.trim()      || null,
        bairro:      data.bairro?.trim()      || null,
        cidade:      data.cidade?.trim()      || null,
        estado:      data.estado?.trim()      || null,
        cep:         data.cep?.trim()         || null,
        ativo:       data.ativo ?? true,
        observacoes: data.observacoes?.trim() || null,
      },
    })
    revalidatePath('/clientes')
    return { cliente }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : ''
    if (msg.includes('Unique constraint') && msg.includes('cnpj'))
      return { erro: 'Já existe um cliente com este CNPJ.' }
    return { erro: 'Erro ao salvar cliente.' }
  }
}

export async function atualizarCliente(id: string, data: ClienteFormData) {
  if (!await requireUser()) return { erro: 'Não autenticado.' }
  if (!data.nome?.trim()) return { erro: 'Nome é obrigatório.' }

  try {
    const cliente = await prisma.cliente.update({
      where: { id },
      data: {
        nome:        data.nome.trim(),
        cnpj:        data.cnpj?.trim()        || null,
        cpf:         data.cpf?.trim()         || null,
        responsavel: data.responsavel?.trim() || null,
        telefone:    data.telefone?.trim()    || null,
        email:       data.email?.trim()       || null,
        endereco:    data.endereco?.trim()    || null,
        numero:      data.numero?.trim()      || null,
        bairro:      data.bairro?.trim()      || null,
        cidade:      data.cidade?.trim()      || null,
        estado:      data.estado?.trim()      || null,
        cep:         data.cep?.trim()         || null,
        ativo:       data.ativo ?? true,
        observacoes: data.observacoes?.trim() || null,
      },
    })
    revalidatePath('/clientes')
    revalidatePath(`/clientes/${id}`)
    return { cliente }
  } catch {
    return { erro: 'Erro ao atualizar cliente.' }
  }
}

export async function excluirCliente(id: string) {
  if (!await requireUser()) return { erro: 'Não autenticado.' }
  try {
    await prisma.cliente.delete({ where: { id } })
    revalidatePath('/clientes')
    return { ok: true }
  } catch {
    return { erro: 'Não é possível excluir: cliente possui registros vinculados.' }
  }
}

export async function listarClientes() {
  return prisma.cliente.findMany({
    orderBy: { nome: 'asc' },
    include: {
      _count: { select: { contratos: true, propostas: true } },
    },
  })
}

export async function buscarCliente(id: string) {
  return prisma.cliente.findUnique({
    where: { id },
    include: {
      contratos: { orderBy: { createdAt: 'desc' }, take: 5 },
      _count: { select: { contratos: true, propostas: true } },
    },
  })
}
