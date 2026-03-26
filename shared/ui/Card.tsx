'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  hoverable?: boolean
  selected?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingMap = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' }

export function Card({ children, className = '', onClick, hoverable = false, selected = false, padding = 'md' }: CardProps) {
  const style = {
    background: 'var(--bg-float)',
    border: `1px solid ${selected ? 'var(--gold)' : 'var(--border-subtle)'}`,
    boxShadow: selected
      ? '0 4px 20px rgba(196,150,74,0.14)'
      : '0 1px 4px rgba(0,0,0,0.04)',
    borderRadius: 20,
  }

  if (onClick || hoverable) {
    return (
      <motion.div onClick={onClick} style={style}
        className={cn(paddingMap[padding], hoverable && 'cursor-pointer', className)}
        whileHover={{ y: hoverable ? -2 : 0 }}
        whileTap={onClick ? { scale: 0.995 } : undefined}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
        {children}
      </motion.div>
    )
  }
  return <div style={style} className={cn(paddingMap[padding], className)}>{children}</div>
}

export function Section({ label, children, className = '' }: { label?: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn('space-y-3', className)}>
      {label && <p className="label-overline">{label}</p>}
      {children}
    </div>
  )
}

export function Divider({ ornament = false }: { ornament?: boolean }) {
  if (ornament) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex-1" style={{ height: 1, background: 'var(--border-subtle)' }} />
        <span className="font-sans text-[10px]" style={{ color: 'var(--gold-light)' }}>✦</span>
        <div className="flex-1" style={{ height: 1, background: 'var(--border-subtle)' }} />
      </div>
    )
  }
  return <div style={{ height: 1, width: '100%', background: 'var(--border-subtle)' }} />
}
