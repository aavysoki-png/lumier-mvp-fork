import { Variants, Transition } from 'framer-motion'

// ─── Timing constants ─────────────────────────────────────────────────────────
// Use these numbers everywhere — never freestyle durations

export const dur = {
  instant:  0.12,
  fast:     0.22,
  normal:   0.38,
  slow:     0.55,
  verySlow: 0.8,
} as const

// ─── Easing library ───────────────────────────────────────────────────────────

export const ease = {
  // Premium deceleration — use for entrances
  outSoft:  [0.16, 1, 0.3, 1]         as [number,number,number,number],
  // Standard deceleration
  out:      [0.25, 0.46, 0.45, 0.94]  as [number,number,number,number],
  // Sharp exit
  inSharp:  [0.55, 0, 0.85, 0.05]     as [number,number,number,number],
  // Spring — for interactive feedback
  spring:   { type: 'spring', stiffness: 420, damping: 30 }  as Transition,
  springGen:{ type: 'spring', stiffness: 260, damping: 22 }  as Transition,
} as const

// ─── Page transitions ─────────────────────────────────────────────────────────
// Soft fade + 12px vertical travel — no harsh slides

export const pageIn: Variants = {
  hidden:  { opacity: 0, y: 14 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: dur.slow, ease: ease.outSoft },
  },
  exit: {
    opacity: 0, y: -6,
    transition: { duration: dur.fast, ease: ease.inSharp },
  },
}

// Keep backward-compat alias
export const pageTransition = pageIn

// ─── Stagger containers ───────────────────────────────────────────────────────

export const staggerFast: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
}

export const staggerNormal: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.08 } },
}

export const staggerSlow: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.12 } },
}

// Keep alias
export const staggerContainer = staggerNormal

// ─── Stagger items ────────────────────────────────────────────────────────────
// Three levels of drama — use based on hierarchy

// Subtle: labels, metadata
export const revealSubtle: Variants = {
  hidden:  { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: dur.normal, ease: ease.out } },
}

// Standard: body content, cards
export const revealNormal: Variants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: dur.normal, ease: ease.outSoft } },
}

// Prominent: headlines, hero elements
export const revealHero: Variants = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: dur.slow, ease: ease.outSoft } },
}

// Keep backward-compat alias
export const staggerItem = revealNormal

// ─── Scale reveals ────────────────────────────────────────────────────────────

export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1, scale: 1,
    transition: { duration: dur.slow, ease: ease.outSoft },
  },
}

export const cardReveal: Variants = {
  hidden:  { opacity: 0, scale: 0.97, y: 12 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { duration: dur.normal, ease: ease.outSoft },
  },
}

// ─── Chat messages ────────────────────────────────────────────────────────────
// Asymmetric: reader messages travel further (more weight)

export const chatReader: Variants = {
  hidden:  { opacity: 0, y: 14, x: -6 },
  visible: {
    opacity: 1, y: 0, x: 0,
    transition: { duration: dur.slow, ease: ease.outSoft },
  },
}

export const chatUser: Variants = {
  hidden:  { opacity: 0, y: 8, x: 6 },
  visible: {
    opacity: 1, y: 0, x: 0,
    transition: { duration: dur.normal, ease: ease.out },
  },
}

// Keep alias
export const chatMessage = chatUser

// ─── Status / async flow ──────────────────────────────────────────────────────

export const statusReveal: Variants = {
  hidden:  { opacity: 0, x: -14 },
  visible: { opacity: 1, x: 0, transition: { duration: dur.normal, ease: ease.outSoft } },
}

// ─── Artifact / document reveal ──────────────────────────────────────────────
// Used for result document — should feel weighty

export const artifactReveal: Variants = {
  hidden:  { opacity: 0, y: 40, scale: 0.98 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: dur.verySlow, ease: ease.outSoft },
  },
}

// ─── Sticky bar / bottom sheet ────────────────────────────────────────────────

export const stickyBar: Variants = {
  hidden:  { y: 80, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: ease.spring },
  exit:    { y: 80, opacity: 0, transition: { duration: dur.fast } },
}

// ─── Fade helpers ─────────────────────────────────────────────────────────────

export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: dur.normal } },
  exit:    { opacity: 0, transition: { duration: dur.fast } },
}

export const slideUp: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: dur.normal, ease: ease.outSoft } },
  exit:    { opacity: 0, y: -12, transition: { duration: dur.fast } },
}

export const slideRight: Variants = {
  hidden:  { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: dur.normal, ease: ease.out } },
  exit:    { opacity: 0, x: 20, transition: { duration: dur.fast } },
}

// ─── Loop animations ──────────────────────────────────────────────────────────

export const breathe: Variants = {
  initial: { opacity: 0.5, scale: 1 },
  animate: {
    opacity: [0.5, 1, 0.5],
    scale:   [1, 1.03, 1],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
}

export const orbitDot: Variants = {
  initial: { opacity: 0.3 },
  animate: {
    opacity: [0.3, 1, 0.3],
    transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' },
  },
}
