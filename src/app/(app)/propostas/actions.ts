'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/usuario-server'
import type { StatusProposta } from '@prisma/client'

export type ItemFormData = {
  equipamentoId?: string
  descricao: string
  quantidade: number
  valorUnitario: number
}

export type SecaoFormData = {
  nome: string
  ordem: number
  itens: ItemFormData[]
}

export type CondicaoFormData = {
  titulo: string
  valor: number
  descricao?: string
}

export type PropostaFormData = {
  clienteId: string
  apresentacaoEmpresa?: string
  escopoInstalacao?: string
  observacoes?: string
  validadeDias: number
  secoes: SecaoFormData[]
  condicoes: CondicaoFormData[]
}

function calcularTotal(secoes: SecaoFormData[]): number {
  return secoes.reduce(
    (acc, s) => acc + s.itens.reduce((a, i) => a + i.quantidade * i.valorUnitario, 0),
    0
  )
}

export async function criarProposta(data: PropostaFormData) {
  if (!await requireUser()) return { erro: 'Não autenticado.' }
  if (!data.clienteId)        return { erro: 'Selecione um cliente.' }
  if (data.secoes.length === 0) return { erro: 'Adicione ao menos uma seção de equipamentos.' }

  const totalGeral = calcularTotal(data.secoes)

  try {
    const proposta = await prisma.proposta.create({
      data: {
        clienteId:           data.clienteId,
        apresentacaoEmpresa: data.apresentacaoEmpresa?.trim() || null,
        escopoInstalacao:    data.escopoInstalacao?.trim()    || null,
        observacoes:         data.observacoes?.trim()         || null,
        validadeDias:        data.validadeDias || 15,
        totalGeral,
        secoes: {
          create: data.secoes.map((s) => ({
            nome:  s.nome,
            ordem: s.ordem,
            itens: {
              create: s.itens.map((i) => ({
                equipamentoId: i.equipamentoId || null,
                descricao:     i.descricao.trim(),
                quantidade:    i.quantidade,
                valorUnitario: i.valorUnitario,
                valorTotal:    i.quantidade * i.valorUnitario,
              })),
            },
          })),
        },
        condicoes: {
          create: data.condicoes.map((c) => ({
            titulo:    c.titulo.trim(),
            valor:     c.valor,
            descricao: c.descricao?.trim() || null,
          })),
        },
      },
    })
    revalidatePath('/propostas')
    redirect(`/propostas/${proposta.id}`)
  } catch (e: unknown) {
    if ((e as { digest?: string }).digest?.startsWith('NEXT_REDIRECT')) throw e
    return { erro: 'Erro ao criar proposta.' }
  }
}

export async function listarPropostas() {
  return prisma.proposta.findMany({
    orderBy: { numero: 'desc' },
    include: {
      cliente:  { select: { id: true, nome: true } },
      _count:   { select: { secoes: true, condicoes: true } },
    },
  })
}

export async function buscarProposta(id: string) {
  return prisma.proposta.findUnique({
    where: { id },
    include: {
      cliente:  true,
      secoes: {
        orderBy: { ordem: 'asc' },
        include: {
          itens: { include: { equipamento: true } },
        },
      },
      condicoes: true,
    },
  })
}

export async function atualizarStatusProposta(id: string, status: StatusProposta) {
  if (!await requireUser()) return { erro: 'Não autenticado.' }
  try {
    await prisma.proposta.update({ where: { id }, data: { status } })
    revalidatePath(`/propostas/${id}`)
    revalidatePath('/propostas')
    return { ok: true }
  } catch {
    return { erro: 'Erro ao atualizar status.' }
  }
}

export async function duplicarProposta(id: string) {
  if (!await requireUser()) return { erro: 'Não autenticado.' }
  try {
    const original = await prisma.proposta.findUnique({
      where: { id },
      include: {
        secoes: { include: { itens: true } },
        condicoes: true,
      },
    })
    if (!original) return { erro: 'Proposta não encontrada.' }

    const nova = await prisma.proposta.create({
      data: {
        clienteId:           original.clienteId,
        apresentacaoEmpresa: original.apresentacaoEmpresa,
        escopoInstalacao:    original.escopoInstalacao,
        observacoes:         original.observacoes,
        validadeDias:        original.validadeDias,
        totalGeral:          original.totalGeral,
        status:              'RASCUNHO',
        secoes: {
          create: original.secoes.map((s) => ({
            nome:  s.nome,
            ordem: s.ordem,
            itens: {
              create: s.itens.map((i) => ({
                equipamentoId: i.equipamentoId,
                descricao:     i.descricao,
                quantidade:    i.quantidade,
                valorUnitario: i.valorUnitario,
                valorTotal:    i.valorTotal,
              })),
            },
          })),
        },
        condicoes: {
          create: original.condicoes.map((c) => ({
            titulo:    c.titulo,
            valor:     c.valor,
            descricao: c.descricao,
          })),
        },
      },
    })
    revalidatePath('/propostas')
    redirect(`/propostas/${nova.id}`)
  } catch (e: unknown) {
    if ((e as { digest?: string }).digest?.startsWith('NEXT_REDIRECT')) throw e
    return { erro: 'Erro ao duplicar proposta.' }
  }
}

export async function excluirProposta(id: string) {
  if (!await requireUser()) return { erro: 'Não autenticado.' }
  try {
    await prisma.proposta.delete({ where: { id } })
    revalidatePath('/propostas')
  } catch {
    return { erro: 'Erro ao excluir proposta.' }
  }
  redirect('/propostas')
}

export async function buscarPropostaParaPDF(id: string) {
  try {
    const [proposta, config] = await Promise.all([
      prisma.proposta.findUnique({
        where: { id },
        include: {
          cliente: true,
          secoes: {
            orderBy: { ordem: 'asc' },
            include: { itens: { include: { equipamento: true } } },
          },
          condicoes: true,
        },
      }),
      prisma.configuracao.findFirst({ orderBy: { createdAt: 'asc' } }),
    ])

    if (!proposta) return { erro: 'Proposta não encontrada.' }

    return {
      proposta: {
        numero:             proposta.numero,
        status:             proposta.status,
        apresentacaoEmpresa: proposta.apresentacaoEmpresa,
        escopoInstalacao:   proposta.escopoInstalacao,
        observacoes:        proposta.observacoes,
        validadeDias:       proposta.validadeDias,
        totalGeral:         Number(proposta.totalGeral),
        createdAt:          proposta.createdAt,
        cliente: {
          nome:        proposta.cliente.nome,
          responsavel: proposta.cliente.responsavel,
          cnpj:        proposta.cliente.cnpj,
          telefone:    proposta.cliente.telefone,
          email:       proposta.cliente.email,
        },
        secoes: proposta.secoes.map((s) => ({
          nome:  s.nome,
          itens: s.itens.map((i) => ({
            descricao:     i.descricao,
            quantidade:    i.quantidade,
            valorUnitario: Number(i.valorUnitario),
            valorTotal:    Number(i.valorTotal),
          })),
        })),
        condicoes: proposta.condicoes.map((c) => ({
          titulo:    c.titulo,
          valor:     Number(c.valor),
          descricao: c.descricao,
        })),
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
    return { erro: e instanceof Error ? e.message : 'Erro ao buscar proposta.' }
  }
}

export async function listarClientesSelect() {
  return prisma.cliente.findMany({
    where:   { ativo: true },
    select:  { id: true, nome: true },
    orderBy: { nome: 'asc' },
  })
}

export async function listarEquipamentosSelect() {
  return prisma.equipamento.findMany({
    where:   { ativo: true },
    select:  { id: true, codigo: true, nome: true, precoBase: true, unidade: true },
    orderBy: { nome: 'asc' },
  })
}
