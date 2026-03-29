'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { registerClient } from '@/server/actions/auth'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { pageIn, staggerNormal, revealHero, revealNormal } from '@/shared/animations/variants'
import Link from 'next/link'

const GENDERS = [
  { id: 'male', label: 'Мужчина' },
  { id: 'female', label: 'Женщина' },
  { id: 'unspecified', label: 'Не указывать' },
]

export default function RegisterPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [gender, setGender] = useState('unspecified')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const formData = new FormData(e.currentTarget)
    try {
      const result = await registerClient(formData)
      if (result?.error) setError(result.error)
    } catch {}
    finally { setLoading(false) }
  }

  return (
    <motion.div variants={pageIn} initial="hidden" animate="visible"
      className="flex min-h-screen flex-col items-center justify-center px-6 py-12"
      style={{ background: 'var(--bg-base)' }}>

      <div className="w-full max-w-sm md:max-w-md">
        <motion.div variants={staggerNormal} initial="hidden" animate="visible" className="mb-10 text-center">
          <Link href="/">
            <p className="font-serif text-2xl font-light" style={{ color: 'var(--text-primary)', letterSpacing: '0.06em' }}>
              Lumier
            </p>
          </Link>
          <div className="mx-auto mt-2" style={{ height: 1, width: 24, background: 'var(--gold)' }} />
        </motion.div>

        <motion.div variants={staggerNormal} initial="hidden" animate="visible" className="space-y-6">
          <motion.div variants={revealHero}>
            <h1 className="font-serif font-light mb-1" style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>
              Регистрация
            </h1>
            <p className="font-sans text-sm" style={{ color: 'var(--text-muted)' }}>
              Уже есть аккаунт?{' '}
              <Link href="/login" className="underline" style={{ color: 'var(--gold)' }}>
                Войти
              </Link>
            </p>
          </motion.div>

          <motion.form variants={revealNormal} onSubmit={handleSubmit} className="space-y-4">
            <Input name="name" label="Имя" type="text" placeholder="Ваше имя" required />
            <Input name="email" label="Email" type="email" placeholder="you@example.com" required />
            <Input name="password" label="Пароль" type="password" placeholder="Минимум 6 символов" required />

            {/* Gender */}
            <div className="space-y-1.5">
              <label className="label-overline block">Пол</label>
              <div className="flex gap-2">
                {GENDERS.map(g => (
                  <button key={g.id} type="button" onClick={() => setGender(g.id)}
                    className="flex-1 rounded-xl py-2.5 font-sans text-xs font-medium transition-all"
                    style={{
                      background: gender === g.id ? 'var(--gold)' : 'var(--bg-raised)',
                      color: gender === g.id ? '#0E1520' : 'var(--text-secondary)',
                      border: gender === g.id ? 'none' : '1px solid var(--border-subtle)',
                    }}>
                    {g.label}
                  </button>
                ))}
              </div>
              <input type="hidden" name="gender" value={gender} />
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="font-sans text-xs text-red-500 text-center">
                {error}
              </motion.p>
            )}

            <Button type="submit" loading={loading} fullWidth size="lg">
              Создать аккаунт
            </Button>
          </motion.form>

          <motion.div variants={revealNormal}
            className="rounded-xl px-4 py-3 text-center"
            style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)' }}>
            <p className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>
              Ваши данные используются только для персонализации расклада и никогда не передаются третьим лицам.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}
