export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { buscarCliente } from '@/app/(app)/clientes/actions'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ClienteEditarButton } from '@/components/clientes/ClienteEditarButton'
import { formatDate, formatCurrency } from '@/lib/utils'
import { getUserCargo } from '@/lib/usuario-server'

type Props = { params: { id: string } }

export default async function ClienteDetalhePage({ params }: Props) {
  const [cliente, cargo] = await Promise.all([buscarCliente(params.id), getUserCargo()])
  if (!cliente) notFound()
  const podeEditar = cargo !== 'OPERADOR'

  return (
    <>
      <div className='mb-5'>
        <Link
          href='/clientes'
          className='inline-flex items-center gap-1.5 text-sm text-[#555] hover:text-[#f0f0f0] transition-colors'
        >
          <ArrowLeft size={14} />
          Voltar para Clientes
        </Link>
      </div>

      <PageHeader
        title={cliente.nome}
        description={cliente.cnpj ?? undefined}
        actions={podeEditar ? <ClienteEditarButton cliente={cliente} /> : undefined}
      />

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-1 space-y-4'>
          <Card>
            <CardHeader>
              <h3 className='text-xs uppercase tracking-widest text-[#555] font-medium'>Dados do Cliente</h3>
            </CardHeader>
            <CardContent className='space-y-3'>
              <Campo label='Status'>
                <Badge variant={cliente.ativo ? 'success' : 'default'}>
                  {cliente.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
              </Campo>
              {cliente.responsavel && <Campo label='Responsável'>{cliente.responsavel}</Campo>}
              {cliente.telefone && <Campo label='Telefone'>{cliente.telefone}</Campo>}
              {cliente.email && <Campo label='E-mail'>{cliente.email}</Campo>}
              {cliente.endereco && <Campo label='Endereço'>{cliente.endereco}</Campo>}
              {(cliente.cidade || cliente.estado) && (
                <Campo label='Cidade'>
                  {[cliente.cidade, cliente.estado].filter(Boolean).join(' — ')}
                </Campo>
              )}
              {cliente.cep && <Campo label='CEP'>{cliente.cep}</Campo>}
              <Campo label='Cadastrado em'>{formatDate(cliente.createdAt)}</Campo>
            </CardContent>
          </Card>

          {cliente.observacoes && (
            <Card>
              <CardContent>
                <p className='text-xs uppercase tracking-widest text-[#555] font-medium mb-2'>Observações</p>
                <p className='text-sm text-[#888] leading-relaxed'>{cliente.observacoes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className='lg:col-span-2'>
          <Card>
            <CardHeader>
              <h3 className='text-xs uppercase tracking-widest text-[#555] font-medium'>
                Contratos ({cliente._count.contratos})
              </h3>
            </CardHeader>
            <CardContent className='p-0'>
              {cliente.contratos.length === 0 ? (
                <p className='px-5 py-8 text-center text-sm text-[#444]'>
                  Nenhum contrato encontrado.
                </p>
              ) : (
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='border-b border-[#1e1e1e]'>
                      <th className='px-5 py-2.5 text-left text-xs text-[#555] font-medium uppercase tracking-wide'>Número</th>
                      <th className='px-5 py-2.5 text-left text-xs text-[#555] font-medium uppercase tracking-wide'>Mensal</th>
                      <th className='px-5 py-2.5 text-left text-xs text-[#555] font-medium uppercase tracking-wide'>Início</th>
                      <th className='px-5 py-2.5 text-left text-xs text-[#555] font-medium uppercase tracking-wide'>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cliente.contratos.map((c) => (
                      <tr key={c.id} className='border-b border-[#1a1a1a] last:border-0 hover:bg-[#161616]'>
                        <td className='px-5 py-3 text-[#ddd]'>{c.numero}</td>
                        <td className='px-5 py-3 text-[#f0f0f0] font-medium'>{formatCurrency(Number(c.valorMensal))}</td>
                        <td className='px-5 py-3 text-[#666]'>{formatDate(c.dataInicio)}</td>
                        <td className='px-5 py-3'>
                          <Badge
                            variant={
                              c.status === 'ATIVO' ? 'success' :
                              c.status === 'SUSPENSO' ? 'warning' : 'default'
                            }
                          >
                            {c.status === 'ATIVO' ? 'Ativo' : c.status === 'SUSPENSO' ? 'Suspenso' : 'Encerrado'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className='text-xs text-[#555] mb-0.5'>{label}</p>
      <div className='text-sm text-[#ccc]'>{children}</div>
    </div>
  )
}
