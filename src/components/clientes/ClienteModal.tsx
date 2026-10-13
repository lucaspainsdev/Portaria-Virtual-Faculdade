'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { criarCliente, atualizarCliente, type ClienteFormData } from '@/app/(app)/clientes/actions'
import type { Cliente } from '@prisma/client'

type Props = {
  onFechar: () => void
  clienteEditar?: Cliente
}

export function ClienteModal({ onFechar, clienteEditar }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)

    const data: ClienteFormData = {
      nome: fd.get('nome') as string,
      cnpj: fd.get('cnpj') as string,
      cpf:  fd.get('cpf')  as string,
      responsavel: fd.get('responsavel') as string,
      telefone: fd.get('telefone') as string,
      email: fd.get('email') as string,
      endereco: fd.get('endereco') as string,
      cidade: fd.get('cidade') as string,
      estado: fd.get('estado') as string,
      cep: fd.get('cep') as string,
      observacoes: fd.get('observacoes') as string,
    }

    setErro(null)
    startTransition(async () => {
      const resultado = clienteEditar
        ? await atualizarCliente(clienteEditar.id, data)
        : await criarCliente(data)

      if ('erro' in resultado) {
        setErro(resultado.erro ?? 'Erro desconhecido.')
        return
      }
      router.refresh()
      onFechar()
    })
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div
        className='absolute inset-0 bg-black/70 backdrop-blur-sm'
        onClick={onFechar}
      />

      <div className='relative w-full max-w-xl bg-[#111] border border-[#222] rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto'>
        <div className='flex items-center justify-between px-6 py-4 border-b border-[#222]'>
          <h2 className='font-barlow-condensed font-bold text-lg uppercase tracking-wide text-[#f0f0f0]'>
            {clienteEditar ? 'Editar Cliente' : 'Novo Cliente'}
          </h2>
          <button
            onClick={onFechar}
            className='text-[#555] hover:text-[#f0f0f0] transition-colors'
          >
            <X size={18} />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className='px-6 py-5 space-y-4'>
          <Input
            label='Nome do condomínio / cliente *'
            name='nome'
            placeholder='Ex: Condomínio Residencial Jardins'
            defaultValue={clienteEditar?.nome}
            required
          />

          <div className='grid grid-cols-2 gap-3'>
            <Input
              label='CNPJ'
              name='cnpj'
              placeholder='00.000.000/0000-00'
              defaultValue={clienteEditar?.cnpj ?? ''}
            />
            <Input
              label='CPF do Responsável'
              name='cpf'
              placeholder='000.000.000-00'
              maxLength={14}
              defaultValue={clienteEditar?.cpf ?? ''}
            />
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <Input
              label='Telefone'
              name='telefone'
              placeholder='(00) 00000-0000'
              defaultValue={clienteEditar?.telefone ?? ''}
            />
            <Input
              label='E-mail'
              name='email'
              type='email'
              placeholder='contato@condominio.com'
              defaultValue={clienteEditar?.email ?? ''}
            />
          </div>

          <Input
            label='Endereço'
            name='endereco'
            placeholder='Rua, número, complemento'
            defaultValue={clienteEditar?.endereco ?? ''}
          />

          <div className='grid grid-cols-5 gap-3'>
            <div className='col-span-2'>
              <Input
                label='Cidade'
                name='cidade'
                placeholder='São Paulo'
                defaultValue={clienteEditar?.cidade ?? ''}
              />
            </div>
            <div className='col-span-1'>
              <Input
                label='UF'
                name='estado'
                placeholder='SP'
                maxLength={2}
                defaultValue={clienteEditar?.estado ?? ''}
              />
            </div>
            <div className='col-span-2'>
              <Input
                label='CEP'
                name='cep'
                placeholder='00000-000'
                defaultValue={clienteEditar?.cep ?? ''}
              />
            </div>
          </div>

          <div className='flex flex-col gap-1'>
            <label className='text-sm text-[#aaa] font-medium'>Observações</label>
            <textarea
              name='observacoes'
              rows={3}
              placeholder='Informações adicionais...'
              defaultValue={clienteEditar?.observacoes ?? ''}
              className='bg-[#1a1a1a] border border-[#333] rounded px-3 py-2 text-sm text-[#f0f0f0] placeholder-[#555] resize-none focus:outline-none focus:border-[#cc0000] focus:ring-1 focus:ring-[#cc0000] transition-colors'
            />
          </div>

          {erro && (
            <p className='text-sm text-red-400 bg-red-950/40 border border-red-900/50 rounded px-3 py-2'>
              {erro}
            </p>
          )}

          <div className='flex justify-end gap-2 pt-2'>
            <Button type='button' variant='secondary' onClick={onFechar} disabled={pending}>
              Cancelar
            </Button>
            <Button type='submit' disabled={pending}>
              {pending ? 'Salvando...' : clienteEditar ? 'Salvar Alterações' : 'Criar Cliente'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
