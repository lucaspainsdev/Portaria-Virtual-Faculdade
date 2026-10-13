'use client'

import { motion, type HTMLMotionProps } from 'framer-motion'
import { ReactNode } from 'react'
import {
  fadeIn, slideUp,
  staggerContainer, staggerItem, scaleIn,
  tapScale, spring, ease,
} from '@/lib/animations'
import { cn } from '@/lib/utils'

// ── FadeIn ────────────────────────────────────────────────────────────────────

interface FadeInProps extends HTMLMotionProps<'div'> {
  delay?: number
  children: ReactNode
}

export function FadeIn({ delay = 0, className, children, ...props }: FadeInProps) {
  return (
    <motion.div
      variants={fadeIn}
      initial='initial'
      animate='animate'
      exit='exit'
      transition={{ ...ease, delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// ── SlideUp ───────────────────────────────────────────────────────────────────

interface SlideUpProps extends HTMLMotionProps<'div'> {
  delay?: number
  children: ReactNode
}

export function SlideUp({ delay = 0, className, children, ...props }: SlideUpProps) {
  return (
    <motion.div
      variants={slideUp}
      initial='initial'
      animate='animate'
      exit='exit'
      transition={{ delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// ── StaggerList — anima filhos em cascata ─────────────────────────────────────

interface StaggerListProps {
  children:   ReactNode
  className?: string
  style?:     React.CSSProperties
  delay?:     number
}

export function StaggerList({ children, className, style, delay = 0 }: StaggerListProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial='initial'
      animate='animate'
      transition={{ delayChildren: delay }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  )
}

// ── StaggerItem — filho animado dentro de StaggerList ─────────────────────────

export function StaggerItem({ children, className, ...props }: HTMLMotionProps<'div'> & { children: ReactNode }) {
  return (
    <motion.div variants={staggerItem} className={className} {...props}>
      {children}
    </motion.div>
  )
}

// ── MotionCard — card com hover lift + tap scale ──────────────────────────────

interface MotionCardProps extends HTMLMotionProps<'div'> {
  children:  ReactNode
  accent?:   string
  lift?:     boolean
}

export function MotionCard({ children, accent, lift = true, className, style, ...props }: MotionCardProps) {
  return (
    <motion.div
      className={cn(
        'bg-card border border-border rounded-xl overflow-hidden',
        className
      )}
      style={accent ? { borderTopWidth: '2px', borderTopColor: accent, ...style } : style}
      whileHover={lift ? { y: -3, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', borderColor: 'hsl(0 0% 18%)' } : undefined}
      whileTap={{ scale: 0.99 }}
      transition={spring}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// ── MotionButton — botão com tap scale ───────────────────────────────────────

export function MotionButton({ children, className, ...props }: HTMLMotionProps<'button'>) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={tapScale}
      transition={spring}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  )
}

// ── ScaleIn — para modais e popovers ─────────────────────────────────────────

export function ScaleIn({ children, className, ...props }: HTMLMotionProps<'div'> & { children: ReactNode }) {
  return (
    <motion.div
      variants={scaleIn}
      initial='initial'
      animate='animate'
      exit='exit'
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// ── NumberTicker — contador animado ──────────────────────────────────────────

import { useEffect, useRef } from 'react'
import { useMotionValue, useSpring } from 'framer-motion'

export function NumberTicker({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionVal = useMotionValue(0)
  const springVal = useSpring(motionVal, { stiffness: 180, damping: 20 })

  useEffect(() => {
    motionVal.set(value)
  }, [motionVal, value])

  useEffect(() => {
    return springVal.on('change', (v) => {
      if (ref.current) {
        ref.current.textContent = String(Math.round(v))
      }
    })
  }, [springVal])

  return <span ref={ref} className={className}>0</span>
}

// ── AnimatedList — lista que aparece item a item ─────────────────────────────

export function AnimatedList({ items, renderItem, className }: {
  items: unknown[]
  renderItem: (item: unknown, i: number) => ReactNode
  className?: string
}) {
  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial='initial'
      animate='animate'
    >
      {items.map((item, i) => (
        <motion.div key={i} variants={staggerItem}>
          {renderItem(item, i)}
        </motion.div>
      ))}
    </motion.div>
  )
}

// ── Presence — wrapper AnimatePresence ───────────────────────────────────────

import { AnimatePresence } from 'framer-motion'

export function Presence({ children, mode = 'wait' }: {
  children: ReactNode
  mode?: 'wait' | 'sync' | 'popLayout'
}) {
  return <AnimatePresence mode={mode}>{children}</AnimatePresence>
}
