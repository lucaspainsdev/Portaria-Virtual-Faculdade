export type Cargo = 'DONO' | 'GERENTE' | 'OPERADOR'

export const CARGOS: Cargo[] = ['DONO', 'GERENTE', 'OPERADOR']

export const CARGO_LABEL: Record<Cargo, string> = {
  DONO:     'Dono',
  GERENTE:  'Gerente',
  OPERADOR: 'Operador',
}

export const CARGO_CORES: Record<Cargo, { cor: string; bg: string; borda: string }> = {
  DONO:     { cor: '#cc0000', bg: 'rgba(204,0,0,0.12)',  borda: 'rgba(204,0,0,0.35)'  },
  GERENTE:  { cor: '#60a5fa', bg: 'rgba(96,165,250,0.12)', borda: 'rgba(96,165,250,0.35)' },
  OPERADOR: { cor: '#888',    bg: '#1a1a1a',              borda: '#2a2a2a'             },
}
