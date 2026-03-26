'use client'

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/utils'

const base = [
  'w-full rounded-[14px]',
  'font-sans text-sm',
  'transition-all duration-150',
  'focus:outline-none',
  'disabled:opacity-50 disabled:cursor-not-allowed',
].join(' ')

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string; error?: string; hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label className="label-overline block">{label}</label>
      )}
      <input
        ref={ref}
        className={cn(base, 'px-4 py-3', className)}
        style={{
          background: 'var(--bg-float)',
          border: `1px solid ${error ? '#fca5a5' : 'var(--border-subtle)'}`,
          color: 'var(--text-primary)',
        }}
        onFocus={(e) => { e.target.style.borderColor = error ? '#fca5a5' : 'var(--gold-light)'; e.target.style.boxShadow = error ? '0 0 0 3px rgba(252,165,165,0.15)' : '0 0 0 3px rgba(196,150,74,0.12)' }}
        onBlur={(e) => { e.target.style.borderColor = error ? '#fca5a5' : 'var(--border-subtle)'; e.target.style.boxShadow = 'none' }}
        {...props}
      />
      {hint && !error && <p className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>{hint}</p>}
      {error && <p className="font-sans text-xs text-red-400">{error}</p>}
    </div>
  )
)
Input.displayName = 'Input'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string; error?: string; hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = '', ...props }, ref) => (
    <div className="space-y-1.5">
      {label && <label className="label-overline block">{label}</label>}
      <textarea
        ref={ref}
        className={cn(base, 'px-4 py-3 resize-none', className)}
        style={{
          background: 'var(--bg-float)',
          border: `1px solid ${error ? '#fca5a5' : 'var(--border-subtle)'}`,
          color: 'var(--text-primary)',
        }}
        onFocus={(e) => { e.target.style.borderColor = error ? '#fca5a5' : 'var(--gold-light)'; e.target.style.boxShadow = '0 0 0 3px rgba(196,150,74,0.12)' }}
        onBlur={(e) => { e.target.style.borderColor = error ? '#fca5a5' : 'var(--border-subtle)'; e.target.style.boxShadow = 'none' }}
        {...props}
      />
      {hint && !error && <p className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>{hint}</p>}
      {error && <p className="font-sans text-xs text-red-400">{error}</p>}
    </div>
  )
)
Textarea.displayName = 'Textarea'
