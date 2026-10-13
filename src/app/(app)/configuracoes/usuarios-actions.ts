'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseAdmin } from '@/lib/supabase/admin'
import { getUserCargo } from '@/lib/usuario-server'
import type { Cargo } from '@/lib/usuario'

export type UsuarioRow = {
  id:         string
  email:      string
  nome:       string
  cargo:      Cargo
  confirmado: boolean
  criadoEm:   string
}

export async function listarUsuarios(): Promise<{ usuarios: UsuarioRow[] } | { erro: string }> {
  if (await getUserCargo() !== 'DONO') return { erro: 'Sem permissão.' }

  const admin = createSupabaseAdmin()
  const { data, error } = await admin.auth.admin.listUsers()
  if (error) return { erro: error.message }

  const usuarios: UsuarioRow[] = data.users.map((u) => {
    const meta = u.user_metadata ?? {}
    const cargoMeta = meta.cargo
    const cargo: Cargo = cargoMeta === 'DONO' || cargoMeta === 'GERENTE' || cargoMeta === 'OPERADOR'
      ? cargoMeta
      : 'OPERADOR'
    return {
      id:         u.id,
      email:      u.email ?? '',
      nome:       (meta.full_name ?? meta.name ?? '') as string,
      cargo,
      confirmado: !!u.email_confirmed_at,
      criadoEm:   u.created_at,
    }
  })

  return { usuarios }
}

export async function convidarUsuario(
  email: string,
  cargo: 'GERENTE' | 'OPERADOR'
): Promise<{ ok: true } | { erro: string }> {
  if (await getUserCargo() !== 'DONO') return { erro: 'Sem permissão.' }

  const emailLimpo = email.trim().toLowerCase()
  if (!emailLimpo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo)) {
    return { erro: 'E-mail inválido.' }
  }
  if (cargo !== 'GERENTE' && cargo !== 'OPERADOR') {
    return { erro: 'Cargo inválido.' }
  }

  const admin = createSupabaseAdmin()
  const { error } = await admin.auth.admin.inviteUserByEmail(emailLimpo, {
    data: { cargo },
  })
  if (error) return { erro: error.message }

  revalidatePath('/configuracoes')
  return { ok: true }
}
