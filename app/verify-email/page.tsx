'use client'

import { useState, useRef, useTransition, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { pageIn } from '@/shared/animations/variants'
import { Button } from '@/shared/ui/Button'
import { verifyEmailCode, resendVerificationCode } from '@/server/actions/auth'

function VerifyForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [resendMsg, setResendMsg] = useState('')
  const [isPending, startTransition] = useTransition()
  const [cooldown, setCooldown] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return
    const t = setInterval(() => setCooldown(c => c - 1), 1000)
    return () => clearInterval(t)
  }, [cooldown])

  if (!email) {
    return (
      <div className="text-center space-y-4">
        <p className="font-sans text-sm" style={{ color: '#F87171' }}>Email не указан</p>
        <Button onClick={() => router.push('/register')} variant="ghost">Вернуться к регистрации</Button>
      </div>
    )
  }

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return
    const newDigits = [...digits]
    newDigits[index] = value.slice(-1)
    setDigits(newDigits)

    // Auto-focus next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all 6 filled
    const code = newDigits.join('')
    if (code.length === 6 && !newDigits.includes('')) {
      submitCode(code)
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      const newDigits = pasted.split('')
      setDigits(newDigits)
      submitCode(pasted)
    }
  }

  function submitCode(code: string) {
    setError('')
    startTransition(async () => {
      const result = await verifyEmailCode(email, code)
      if (result?.error) {
        setError(result.error)
        setDigits(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
      }
    })
  }

  function handleResend() {
    setResendMsg('')
    setError('')
    startTransition(async () => {
      const result = await resendVerificationCode(email)
      if (result.success) { setResendMsg(result.success); setCooldown(60) }
      if (result.error) setResendMsg(result.error)
    })
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
          style={{ border: '1px solid rgba(212,149,74,0.3)', background: 'rgba(212,149,74,0.06)' }}>
          <span style={{ color: 'var(--gold)', fontSize: '1.5rem' }}>✉</span>
        </div>
        <h1 className="font-serif text-2xl font-light" style={{ color: 'var(--text-primary)' }}>
          Подтвердите email
        </h1>
        <p className="font-sans text-sm" style={{ color: 'var(--text-secondary)' }}>
          Мы отправили 6-значный код на
        </p>
        <p className="font-sans text-sm font-medium" style={{ color: 'var(--gold)' }}>{email}</p>
      </div>

      {/* Code input */}
      <div className="flex justify-center gap-2" onPaste={handlePaste}>
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={el => { inputRefs.current[i] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            autoFocus={i === 0}
            className="w-12 h-14 text-center rounded-xl font-serif text-xl font-light outline-none transition-all"
            style={{
              background: 'var(--bg-raised)',
              border: digit ? '1px solid var(--gold)' : '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              boxShadow: digit ? '0 0 0 2px rgba(212,149,74,0.10)' : 'none',
            }}
          />
        ))}
      </div>

      {error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="font-sans text-xs text-center" style={{ color: '#F87171' }}>
          {error}
        </motion.p>
      )}

      {isPending && (
        <div className="flex justify-center">
          <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" style={{ color: 'var(--gold)' }} />
        </div>
      )}

      {/* Resend */}
      <div className="text-center space-y-2">
        {resendMsg && (
          <p className="font-sans text-xs" style={{ color: resendMsg.includes('отправлен') ? '#4ADE80' : '#F87171' }}>
            {resendMsg}
          </p>
        )}
        <button
          onClick={handleResend}
          disabled={isPending || cooldown > 0}
          className="font-sans text-xs transition-opacity hover:opacity-70 disabled:opacity-40"
          style={{ color: 'var(--gold)' }}
        >
          {cooldown > 0 ? `Отправить повторно (${cooldown}с)` : 'Отправить код повторно'}
        </button>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <motion.div variants={pageIn} initial="hidden" animate="visible"
      className="flex min-h-screen flex-col items-center justify-center px-6"
      style={{ background: 'var(--bg-base)' }}>
      <div className="w-full max-w-sm md:max-w-md">
        <Suspense fallback={
          <div className="text-center py-8">
            <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin inline-block" style={{ color: 'var(--gold)' }} />
          </div>
        }>
          <VerifyForm />
        </Suspense>
      </div>
    </motion.div>
  )
}
