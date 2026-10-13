'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ClienteModal } from './ClienteModal'

export function NovoClienteButton() {
  const [aberto, setAberto] = useState(false)

  return (
    <>
      <Button onClick={() => setAberto(true)}>
        <Plus size={15} />
        Novo Cliente
      </Button>
      {aberto && <ClienteModal onFechar={() => setAberto(false)} />}
    </>
  )
}
