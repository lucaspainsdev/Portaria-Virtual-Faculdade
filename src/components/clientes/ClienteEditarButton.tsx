'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ClienteModal } from './ClienteModal'
import type { Cliente } from '@prisma/client'

export function ClienteEditarButton({ cliente }: { cliente: Cliente }) {
  const [aberto, setAberto] = useState(false)

  return (
    <>
      <Button variant='secondary' onClick={() => setAberto(true)}>
        <Pencil size={14} />
        Editar
      </Button>
      {aberto && (
        <ClienteModal clienteEditar={cliente} onFechar={() => setAberto(false)} />
      )}
    </>
  )
}
