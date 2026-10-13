import { createSupabaseServer } from '@/lib/supabase/server'
import { CARGOS, type Cargo } from '@/lib/usuario'

function normalizar(valor: unknown): Cargo {
  return typeof valor === 'string' && (CARGOS as string[]).includes(valor)
    ? (valor as Cargo)
    : 'OPERADOR'
}

export async function getUserCargo(): Promise<Cargo> {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  return normalizar(user?.user_metadata?.cargo)
}

export async function requireUser() {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
