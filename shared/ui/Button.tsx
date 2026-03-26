'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  className?: string
  fullWidth?: boolean
  icon?: ReactNode
}

export function Button({
  children, onClick, type = 'button', variant = 'primary',
  size = 'md', disabled = false, loading = false,
  className = '', fullWidth = false, icon,
}: ButtonProps) {

  const base = [
    'inline-flex items-center justify-center gap-2',
    'font-sans font-medium',
    'transition-all duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-40 select-none',
  ].join(' ')

  const styleMap: Record<string, React.CSSProperties> = {
    primary:   { background: 'var(--text-primary)', color: 'var(--bg-raised)' },
    secondary: { background: 'var(--gold)',         color: '#FAF7F0' },
    ghost:     { background: 'transparent',         color: 'var(--text-secondary)' },
    outline:   { background: 'var(--bg-float)',     color: 'var(--text-secondary)', border: '1px solid var(--border-default)' },
  }

  const sizes = {
    sm: 'px-4 py-2   text-xs  rounded-[10px] h-8  tracking-[0.02em]',
    md: 'px-5 py-2.5 text-sm  rounded-[14px] h-10 tracking-[0.02em]',
    lg: 'px-7 py-3.5 text-sm  rounded-[18px] h-12 tracking-[0.03em]',
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={styleMap[variant]}
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: disabled || loading ? 1 : 1.01 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={cn(base, sizes[size], fullWidth && 'w-full', className)}
    >
      {loading ? (
        <>
          <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
          {children}
        </>
      ) : (
        <>
          {icon && <span className="opacity-70 text-sm">{icon}</span>}
          {children}
        </>
      )}
    </motion.button>
  )
}
