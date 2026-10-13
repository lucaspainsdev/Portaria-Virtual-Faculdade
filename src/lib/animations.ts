import type { Variants, Transition } from 'framer-motion'

// ── Easing ────────────────────────────────────────────────────────────────────

export const spring: Transition = { type: 'spring', stiffness: 400, damping: 30 }
export const springSmooth: Transition = { type: 'spring', stiffness: 260, damping: 24 }

export const ease: Transition     = { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
export const easeFast: Transition = { duration: 0.15, ease: [0.4, 0, 0.2, 1] }

// ── Page transition ───────────────────────────────────────────────────────────

export const pageVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.15, ease: 'linear' } },
  exit:    { opacity: 0, transition: { duration: 0.1,  ease: 'linear' } },
}

// ── Fade ──────────────────────────────────────────────────────────────────────

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: ease },
  exit:    { opacity: 0, transition: easeFast },
}

// ── SlideUp (spec: y:20→0, opacity:0→1, duration:0.3) ─────────────────────────

export const slideUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
  exit:    { opacity: 0, y: -8, transition: easeFast },
}

export const slideDown: Variants = {
  initial: { opacity: 0, y: -16 },
  animate: { opacity: 1, y: 0, transition: ease },
  exit:    { opacity: 0, y: -8, transition: easeFast },
}

// ── Stagger (spec: 0.05s entre itens) ────────────────────────────────────────

export const staggerContainer: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } },
}

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
}

// ── Scale (spec: scale 0.95→1 + fade, para modais) ───────────────────────────

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1,    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } },
  exit:    { opacity: 0, scale: 0.97, transition: easeFast },
}

// ── Overlay ───────────────────────────────────────────────────────────────────

export const overlayVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.15 } },
}

// ── Micro-interações ──────────────────────────────────────────────────────────

export const tapScale = { scale: 0.97 }
