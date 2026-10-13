'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/usuario-server'

export type ConfiguracaoFormData = {
  nomeEmpresa: string
  cnpj?:       string
  telefone?:   string
  email?:      string
  site?:       string
  endereco?:   string
  cidade?:     string
  estado?:     string
  cep?:        string
  logoUrl?:    string
  descricao?:  string
}

export async function buscarConfiguracao() {
  return prisma.configuracao.findFirst({ orderBy: { createdAt: 'asc' } })
}

export async function salvarConfiguracao(data: ConfiguracaoFormData) {
  if (!await requireUser()) return { erro: 'Não autenticado.' }
  if (!data.nomeEmpresa?.trim()) {
    return { erro: 'Nome da empresa é obrigatório.' }
  }

  const payload = {
    nomeEmpresa: data.nomeEmpresa.trim(),
    cnpj:        data.cnpj?.trim()      || null,
    telefone:    data.telefone?.trim()  || null,
    email:       data.email?.trim()     || null,
    site:        data.site?.trim()      || null,
    endereco:    data.endereco?.trim()  || null,
    cidade:      data.cidade?.trim()    || null,
    estado:      data.estado?.trim()    || null,
    cep:         data.cep?.trim()       || null,
    logoUrl:     data.logoUrl?.trim()   || null,
    descricao:   data.descricao?.trim() || null,
  }

  const existente = await prisma.configuracao.findFirst()

  if (existente) {
    await prisma.configuracao.update({ where: { id: existente.id }, data: payload })
  } else {
    await prisma.configuracao.create({ data: payload })
  }

  revalidatePath('/configuracoes')
  return { ok: true }
}
