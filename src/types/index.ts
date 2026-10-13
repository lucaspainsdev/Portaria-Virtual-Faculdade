// ─────────────────────────────────────────────────────────────────────────────
// types/index.ts — tipos TypeScript do PortariaPro
// Alinhados com o schema Prisma e as Server Actions do projeto
// ─────────────────────────────────────────────────────────────────────────────

import type { Decimal } from '@prisma/client/runtime/library'

// ─────────────────────────────────────────────────────────────────────────────
// RE-EXPORTS do Prisma — modelos e enums
// ─────────────────────────────────────────────────────────────────────────────

export type {
  Cliente,
  Equipamento,
  Lancamento,
  Contrato,
} from '@prisma/client'

export {
  CategoriaEquipamento,
  TipoLancamento,
  CategoriaLancamento,
  StatusContrato,
} from '@prisma/client'

// ─────────────────────────────────────────────────────────────────────────────
// ALIAS de conveniência
// ─────────────────────────────────────────────────────────────────────────────

import type {
  Cliente,
  Equipamento,
  Lancamento,
  Contrato,
  CategoriaEquipamento,
  TipoLancamento,
  CategoriaLancamento,
  StatusContrato,
} from '@prisma/client'

// Decimal do Prisma (para trabalhar com valores monetários)
export type { Decimal }

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS COMPOSTOS — modelos com relações incluídas
// ─────────────────────────────────────────────────────────────────────────────

/** Cliente com contagem de vínculos */
export type ClienteComContagem = Cliente & {
  _count: { contratos: number }
}

/** Cliente com histórico completo */
export type ClienteComHistorico = Cliente & {
  contratos: Contrato[]
  _count:    { contratos: number }
}

/** Lançamento com cliente vinculado */
export type LancamentoComCliente = Lancamento & {
  cliente: Pick<Cliente, 'id' | 'nome'> | null
}

/** Equipamento com contagem de uso em orçamentos */
export type EquipamentoComUso = Equipamento & {
  _count: { itensOrcamento: number }
}

/** Contrato com cliente */
export type ContratoComCliente = Contrato & {
  cliente: Pick<Cliente, 'id' | 'nome' | 'responsavel'>
}

// ─────────────────────────────────────────────────────────────────────────────
// FORM DATA — espelham as Server Actions
// ─────────────────────────────────────────────────────────────────────────────

export type ClienteFormData = {
  nome:        string
  cnpj?:       string
  responsavel?: string
  telefone?:   string
  email?:      string
  endereco?:   string
  numero?:     string
  bairro?:     string
  cidade?:     string
  estado?:     string
  cep?:        string
  ativo?:      boolean
  observacoes?: string
}

export type EquipamentoFormData = {
  nome:       string
  descricao?: string
  categoria:  CategoriaEquipamento
  unidade:    string
  precoBase:  number
  ativo?:     boolean
}


export type LancamentoFormData = {
  tipo:        TipoLancamento
  categoria:   CategoriaLancamento
  descricao:   string
  valor:       number
  data:        string         // ISO date string YYYY-MM-DD
  clienteId?:  string
  observacoes?: string
}

export type ContratoFormData = {
  clienteId:    string
  numero:       string
  descricao?:   string
  valorMensal:  number
  dataInicio:   string        // ISO date string YYYY-MM-DD
  dataFim?:     string
  status?:      StatusContrato
  observacoes?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// SELECT OPTIONS — para dropdowns/combos
// ─────────────────────────────────────────────────────────────────────────────

export type SelectOption<T extends string = string> = {
  value: T
  label: string
}

export type ClienteOption    = Pick<Cliente,    'id' | 'nome'>
export type EquipamentoOption = Pick<Equipamento, 'id' | 'nome' | 'categoria' | 'precoBase' | 'unidade'>

// ─────────────────────────────────────────────────────────────────────────────
// SERVER ACTION RESULTS — retornos padronizados
// ─────────────────────────────────────────────────────────────────────────────

export type ActionResult<T = void> =
  | { ok: true;  data?: T;     erro?: never }
  | { ok: false; erro: string; data?: never }

export type ActionError = { erro: string }

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD — tipos para métricas e gráficos
// ─────────────────────────────────────────────────────────────────────────────

export type ResumoMes = {
  receitas:   number
  despesas:   number
  saldoMes:   number
  saldoAno:   number
}

export type GraficoPonto = {
  label:    string   // "mai. 26"
  receitas: number
  despesas: number
}

export type DashboardMetricas = {
  receitaMes:  number
  despesaMes:  number
}

// ─────────────────────────────────────────────────────────────────────────────
// UI — tipos de apoio para componentes
// ─────────────────────────────────────────────────────────────────────────────

export type StatusColor = {
  bg:     string
  text:   string
  border: string
}

/** Configuração visual de badge por status */
export type BadgeConfig = StatusColor & {
  label: string
}


export const CONTRATO_BADGE: Record<StatusContrato, BadgeConfig> = {
  ATIVO:     { label: 'Ativo',     bg: '#14532d', text: '#4ade80', border: '#4ade8033' },
  ENCERRADO: { label: 'Encerrado', bg: '#1a1a1a', text: '#666666', border: '#2a2a2a'  },
  SUSPENSO:  { label: 'Suspenso',  bg: '#422006', text: '#fb923c', border: '#fb923c33' },
}

export const CATEGORIA_EQ_BADGE: Record<CategoriaEquipamento, BadgeConfig> = {
  CFTV:           { label: 'CFTV',          bg: '#1e3a5f', text: '#60a5fa', border: '#60a5fa33' },
  ACESSO:         { label: 'Acesso',        bg: '#14532d', text: '#4ade80', border: '#4ade8033' },
  COMUNICACAO:    { label: 'Comunicação',   bg: '#422006', text: '#facc15', border: '#facc1533' },
  INFRAESTRUTURA: { label: 'Infraestrutura',bg: '#2e1065', text: '#a78bfa', border: '#a78bfa33' },
}

export const CATEGORIA_LANC_BADGE: Record<CategoriaLancamento, BadgeConfig> = {
  INSTALACAO:  { label: 'Instalação',  bg: '#1e3a5f', text: '#60a5fa', border: '#60a5fa33' },
  MENSALIDADE: { label: 'Mensalidade', bg: '#2e1065', text: '#a78bfa', border: '#a78bfa33' },
  SERVICO:     { label: 'Serviço',     bg: '#064e3b', text: '#34d399', border: '#34d39933' },
  EQUIPAMENTO: { label: 'Equipamento', bg: '#431407', text: '#fb923c', border: '#fb923c33' },
  SALARIO:     { label: 'Salário',     bg: '#422006', text: '#facc15', border: '#facc1533' },
  FORNECEDOR:  { label: 'Fornecedor',  bg: '#1e293b', text: '#94a3b8', border: '#94a3b833' },
  ALUGUEL:     { label: 'Aluguel',     bg: '#500724', text: '#f472b6', border: '#f472b633' },
  OUTROS:      { label: 'Outros',      bg: '#1a1a1a', text: '#888888', border: '#2a2a2a'  },
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGINAÇÃO
// ─────────────────────────────────────────────────────────────────────────────

export type PaginatedResult<T> = {
  data:       T[]
  total:      number
  page:       number
  perPage:    number
  totalPages: number
}

export type PaginationParams = {
  page?:    number
  perPage?: number
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTROS COMUNS
// ─────────────────────────────────────────────────────────────────────────────


export type FiltroLancamentos = {
  tipo?:      TipoLancamento
  categoria?: CategoriaLancamento
  clienteId?: string
  mes:        number
  ano:        number
}

export type FiltroEquipamentos = {
  categoria?: CategoriaEquipamento
  ativo?:     boolean
  busca?:     string
}
