import Link from 'next/link'
import { Building2, FileSignature, Presentation, Phone, Mail } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import type { Cliente } from '@prisma/client'

type Props = {
  cliente: Cliente & {
    _count: { contratos: number; propostas: number }
  }
}

export function ClienteCard({ cliente }: Props) {
  return (
    <Link href={`/clientes/${cliente.id}`} className='block group'>
      <Card
        accent='#cc0000'
        className='transition-colors group-hover:border-[#333]'
      >
        <CardContent className='py-5'>
          <div className='flex items-start justify-between gap-2 mb-3'>
            <div className='flex items-center gap-2 min-w-0'>
              <div className='w-8 h-8 rounded bg-[#1a1a1a] flex items-center justify-center flex-shrink-0'>
                <Building2 size={15} className='text-[#cc0000]' />
              </div>
              <div className='min-w-0'>
                <p className='text-sm font-semibold text-[#f0f0f0] truncate'>
                  {cliente.nome}
                </p>
                {cliente.cnpj && (
                  <p className='text-xs text-[#555]'>{cliente.cnpj}</p>
                )}
              </div>
            </div>
            <Badge variant={cliente.ativo ? 'success' : 'default'}>
              {cliente.ativo ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>

          <div className='space-y-1 mb-4'>
            {cliente.responsavel && (
              <p className='text-xs text-[#666] truncate'>{cliente.responsavel}</p>
            )}
            {cliente.telefone && (
              <p className='text-xs text-[#555] flex items-center gap-1.5'>
                <Phone size={11} />
                {cliente.telefone}
              </p>
            )}
            {cliente.email && (
              <p className='text-xs text-[#555] flex items-center gap-1.5'>
                <Mail size={11} />
                {cliente.email}
              </p>
            )}
            {cliente.cidade && (
              <p className='text-xs text-[#555]'>
                {cliente.cidade}{cliente.estado ? `, ${cliente.estado}` : ''}
              </p>
            )}
          </div>

          <div className='flex items-center gap-3 pt-3 border-t border-[#1e1e1e]'>
            {cliente._count.contratos > 0 && (
              <Link href='/contratos' onClick={(e) => e.stopPropagation()} className='flex items-center gap-1.5 text-xs text-[#555] hover:text-[#f0f0f0] transition-colors'>
                <FileSignature size={12} />
                {cliente._count.contratos} contrato{cliente._count.contratos !== 1 ? 's' : ''}
              </Link>
            )}
            {cliente._count.propostas > 0 && (
              <span className='flex items-center gap-1.5 text-xs text-[#555]'>
                <Presentation size={12} />
                {cliente._count.propostas} proposta{cliente._count.propostas !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
