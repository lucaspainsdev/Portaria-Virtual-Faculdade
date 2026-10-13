// ─────────────────────────────────────────────────────────────────────────────
// utils.ts — funções utilitárias do PortariaPro
// ─────────────────────────────────────────────────────────────────────────────

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { StatusOrcamento, StatusContrato, TipoLancamento, CategoriaLancamento, CategoriaEquipamento } from '@prisma/client'

// ── Tipo interno para Decimal do Prisma ───────────────────────────────────────
type Decimalish = number | string | { toNumber(): number }

function toNum(v: Decimalish): number {
  if (typeof v === 'object') return v.toNumber()
  if (typeof v === 'string') return parseFloat(v)
  return v
}

// ─────────────────────────────────────────────────────────────────────────────
// MOEDA
// ─────────────────────────────────────────────────────────────────────────────

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

/** R$ 1.200,00 */
export function formatCurrency(value: Decimalish): string {
  const n = toNum(value)
  return isNaN(n) ? 'R$ 0,00' : BRL.format(n)
}

/** R$ 1,2k / R$ 2,5M para valores grandes */
export function formatCurrencyCompact(value: Decimalish): string {
  const n = toNum(value)
  if (isNaN(n)) return 'R$ 0'
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `R$ ${(n / 1_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}M`
  if (abs >= 1_000)     return `R$ ${(n / 1_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}k`
  return formatCurrency(n)
}

/** "R$ 1.200,50" → 1200.5 */
export function parseCurrency(value: string): number {
  const n = parseFloat(value.replace(/[R$\s.]/g, '').replace(',', '.'))
  return isNaN(n) ? 0 : n
}

// ─────────────────────────────────────────────────────────────────────────────
// DATAS
// ─────────────────────────────────────────────────────────────────────────────

type DateInput = Date | string | null | undefined

function parseDate(date: DateInput): Date | null {
  if (!date) return null
  const d = typeof date === 'string' ? new Date(date) : date
  return isNaN(d.getTime()) ? null : d
}

/** DD/MM/AAAA */
export function formatDate(date: DateInput): string {
  const d = parseDate(date)
  return d ? new Intl.DateTimeFormat('pt-BR').format(d) : '—'
}

/** DD/MM */
export function formatDateShort(date: DateInput): string {
  const d = parseDate(date)
  if (!d) return '—'
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(d)
}

/** DD/MM/AA HH:mm */
export function formatDatetime(date: DateInput): string {
  const d = parseDate(date)
  return d ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(d) : '—'
}

/** "maio de 2026" */
export function formatMonthYear(date: DateInput): string {
  const d = parseDate(date)
  return d ? new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(d) : '—'
}

/** "mai. 26" */
export function formatMonthShort(date: DateInput): string {
  const d = parseDate(date)
  return d ? new Intl.DateTimeFormat('pt-BR', { month: 'short', year: '2-digit' }).format(d) : '—'
}

/** "hoje" / "ontem" / "há 3 dias" / "há 2 semanas" */
export function formatDateRelative(date: DateInput): string {
  const d = parseDate(date)
  if (!d) return '—'
  const diff = Math.floor((Date.now() - d.getTime()) / 86_400_000)
  if (diff === 0)   return 'hoje'
  if (diff === 1)   return 'ontem'
  if (diff < 7)     return `há ${diff} dias`
  if (diff < 30)    return `há ${Math.floor(diff / 7)} semana${Math.floor(diff / 7) > 1 ? 's' : ''}`
  if (diff < 365)   return `há ${Math.floor(diff / 30)} mês`
  return `há ${Math.floor(diff / 365)} ano${Math.floor(diff / 365) > 1 ? 's' : ''}`
}

/** Date → "YYYY-MM-DD" para <input type="date"> */
export function toDateInput(date: DateInput): string {
  const d = parseDate(date)
  return d ? d.toISOString().slice(0, 10) : ''
}

/** "YYYY-MM-DD" → Date (meia-noite local) */
export function fromDateInput(value: string): Date | null {
  if (!value) return null
  const d = new Date(value + 'T00:00:00')
  return isNaN(d.getTime()) ? null : d
}

// ─────────────────────────────────────────────────────────────────────────────
// ORÇAMENTOS
// ─────────────────────────────────────────────────────────────────────────────

/** 1 → "ORC-001" */
export function formatOrcamentoNumero(numero: number): string {
  return `ORC-${String(numero).padStart(3, '0')}`
}

/** Alias para compatibilidade com a assinatura solicitada */
export function generateOrcamentoNumber(count: number): string {
  return formatOrcamentoNumero(count)
}

type ItemCalc = { quantidade: number | Decimalish; precoUnitario: Decimalish }

/**
 * Calcula o total de um orçamento.
 * total = Σ(quantidade × precoUnitario) + maoDeObra - desconto
 */
export function calcOrcamentoTotal(
  itens:      ItemCalc[],
  maoDeObra:  number = 0,
  desconto:   number = 0,
): number {
  const subtotalItens = itens.reduce((sum, item) => {
    const qtd   = typeof item.quantidade === 'number' ? item.quantidade : toNum(item.quantidade as Decimalish)
    const preco = toNum(item.precoUnitario)
    return sum + qtd * preco
  }, 0)
  return Math.max(0, subtotalItens + maoDeObra - desconto)
}

// ─────────────────────────────────────────────────────────────────────────────
// CORES / STATUS
// ─────────────────────────────────────────────────────────────────────────────

export type StatusColor = { bg: string; text: string; border: string }

const STATUS_COLORS: Record<string, StatusColor> = {
  // Orçamento
  RASCUNHO: { bg: '#1a1a1a', text: '#888888', border: '#2a2a2a' },
  ENVIADO:  { bg: '#1e3a5f', text: '#60a5fa', border: '#60a5fa33' },
  APROVADO: { bg: '#14532d', text: '#4ade80', border: '#4ade8033' },
  RECUSADO: { bg: '#450a0a', text: '#f87171', border: '#f8717133' },

  // Contrato
  ATIVO:     { bg: '#14532d', text: '#4ade80', border: '#4ade8033' },
  ENCERRADO: { bg: '#1a1a1a', text: '#888888', border: '#2a2a2a' },
  SUSPENSO:  { bg: '#422006', text: '#fb923c', border: '#fb923c33' },

  // Cliente / Equipamento
  ativo:   { bg: '#14532d', text: '#4ade80', border: '#4ade8033' },
  inativo: { bg: '#1a1a1a', text: '#555555', border: '#2a2a2a' },

  // Lançamento
  RECEITA: { bg: '#14532d', text: '#4ade80', border: '#4ade8033' },
  DESPESA: { bg: '#450a0a', text: '#f87171', border: '#f8717133' },
}

const FALLBACK_COLOR: StatusColor = { bg: '#1a1a1a', text: '#666', border: '#2a2a2a' }

/** Retorna { bg, text, border } para qualquer status do sistema */
export function getStatusColor(status: string): StatusColor {
  return STATUS_COLORS[status] ?? FALLBACK_COLOR
}

// Labels prontos para exibição

export const ORCAMENTO_STATUS_LABEL: Record<StatusOrcamento, string> = {
  RASCUNHO: 'Rascunho',
  ENVIADO:  'Enviado',
  APROVADO: 'Aprovado',
  RECUSADO: 'Recusado',
}

export const CONTRATO_STATUS_LABEL: Record<StatusContrato, string> = {
  ATIVO:     'Ativo',
  ENCERRADO: 'Encerrado',
  SUSPENSO:  'Suspenso',
}

export const CATEGORIA_LANCAMENTO_LABEL: Record<CategoriaLancamento, string> = {
  INSTALACAO:  'Instalação',
  MENSALIDADE: 'Mensalidade',
  SERVICO:     'Serviço',
  EQUIPAMENTO: 'Equipamento',
  SALARIO:     'Salário',
  FORNECEDOR:  'Fornecedor',
  ALUGUEL:     'Aluguel',
  OUTROS:      'Outros',
}

export const CATEGORIA_EQUIPAMENTO_LABEL: Record<CategoriaEquipamento, string> = {
  CFTV:           'CFTV',
  ACESSO:         'Acesso',
  COMUNICACAO:    'Comunicação',
  INFRAESTRUTURA: 'Infraestrutura',
}

export const TIPO_LANCAMENTO_LABEL: Record<TipoLancamento, string> = {
  RECEITA: 'Receita',
  DESPESA: 'Despesa',
}

// ─────────────────────────────────────────────────────────────────────────────
// MÁSCARAS DE INPUT
// ─────────────────────────────────────────────────────────────────────────────

export function formatCNPJ(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 14)
  return d
    .replace(/^(\d{2})(\d)/,          '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/,         '.$1/$2')
    .replace(/(\d{4})(\d)/,           '$1-$2')
}

export function formatTelefone(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 10)
    return d.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim()
  return d.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim()
}

export function formatCEP(value: string): string {
  return value.replace(/\D/g, '').slice(0, 8).replace(/^(\d{5})(\d)/, '$1-$2')
}

export function formatCPF(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11)
  return d
    .replace(/^(\d{3})(\d)/,          '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/,         '.$1-$2')
}

// ─────────────────────────────────────────────────────────────────────────────
// STRINGS / UI
// ─────────────────────────────────────────────────────────────────────────────

/** Junta classes Tailwind com merge inteligente (clsx + tailwind-merge) */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/** Trunca string com reticências */
export function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '…' : str
}

/** "João Silva" → "JS" */
export function iniciais(nome: string): string {
  return nome.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('')
}

/** Capitaliza primeira letra */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/** Remove acentos para ordenação/busca */
export function normalizeStr(str: string): string {
  return str.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

/** Verifica se uma data já passou */
export function isExpired(date: DateInput): boolean {
  const d = parseDate(date)
  return d ? d.getTime() < Date.now() : false
}

/** Pluraliza palavra simples: pluralize(1, 'item', 'itens') */
export function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`
}
