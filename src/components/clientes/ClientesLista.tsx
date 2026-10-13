import { listarClientes } from '@/app/(app)/clientes/actions'
import { ClienteCard } from './ClienteCard'
import { Building2 } from 'lucide-react'

export async function ClientesLista() {
  const clientes = await listarClientes()

  if (clientes.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-20 text-center'>
        <Building2 size={40} className='text-[#333] mb-4' />
        <p className='text-[#666] font-medium'>Nenhum cliente cadastrado</p>
        <p className='text-[#444] text-sm mt-1'>Clique em &quot;Novo Cliente&quot; para começar.</p>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
      {clientes.map((cliente) => (
        <ClienteCard key={cliente.id} cliente={cliente} />
      ))}
    </div>
  )
}
