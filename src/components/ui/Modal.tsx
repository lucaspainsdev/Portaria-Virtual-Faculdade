'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

// ── Tamanhos ─────────────────────────────────────────────────────────────────

type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

const sizes: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-xl',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

// ── Modal ─────────────────────────────────────────────────────────────────────

interface ModalProps {
  open:       boolean
  onClose:    () => void
  title?:     string
  size?:      ModalSize
  children:   React.ReactNode
  footer?:    React.ReactNode
  hideClose?: boolean
  className?: string
}

export function Modal({ open, onClose, title, size = 'md', children, footer, hideClose, className }: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className={cn(
          'bg-card border-border p-0 gap-0 overflow-hidden',
          sizes[size],
          className
        )}
      >
        {(title || !hideClose) && (
          <DialogHeader className='px-6 py-4 border-b border-border'>
            {title && (
              <DialogTitle className='font-display font-bold text-[1.05rem] uppercase tracking-[0.07em] text-foreground'>
                {title}
              </DialogTitle>
            )}
          </DialogHeader>
        )}

        <div className='px-6 py-5 overflow-y-auto max-h-[70vh]'>
          {children}
        </div>

        {footer && (
          <DialogFooter className='px-6 py-4 border-t border-border'>
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ── ConfirmModal ─────────────────────────────────────────────────────────────

interface ConfirmModalProps {
  open:          boolean
  onClose:       () => void
  onConfirm:     () => void
  title:         string
  description:   string
  confirmLabel?: string
  cancelLabel?:  string
  loading?:      boolean
  variant?:      'danger' | 'default'
}

export function ConfirmModal({
  open, onClose, onConfirm,
  title, description,
  confirmLabel = 'Confirmar',
  cancelLabel  = 'Cancelar',
  loading,
  variant = 'danger',
}: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose} size='sm' hideClose>
      <div className='flex flex-col gap-4'>
        <div>
          <h3 className='font-display font-bold text-[1.05rem] uppercase tracking-[0.06em] text-foreground mb-2'>
            {title}
          </h3>
          <p className='text-sm text-muted-foreground leading-relaxed'>{description}</p>
        </div>
        <div className='flex justify-end gap-2'>
          <Button variant='secondary' size='sm' onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'destructive' : 'default'}
            size='sm'
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
