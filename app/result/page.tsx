'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { getAsyncStatus } from '@/server/actions'
import { useAppStore } from '@/shared/lib/store'
import {
  pageIn, staggerNormal, staggerSlow, revealHero, revealNormal, revealSubtle,
  artifactReveal, dur, ease,
} from '@/shared/animations/variants'
import Link from 'next/link'

interface CardSection {
  position: string
  cardName: string
  body: string
}

interface ParsedReading {
  title: string
  subtitle: string
  sections: CardSection[]
  summary: string
}

function parseReading(raw: string): ParsedReading {
  const lines = raw.split('\n')
  let title = 'Ваш расклад'
  let subtitle = ''
  const sections: CardSection[] = []
  const summaryLines: string[] = []
  let currentSection: Partial<CardSection> | null = null
  let inSummary = false

  for (const line of lines) {
    const titleMatch = line.match(/^\*\*Ваш расклад: (.*)\*\*$/) || line.match(/^\*\*Your Reading: (.*)\*\*$/)
    if (titleMatch) { title = titleMatch[1]; continue }

    const subMatch = line.match(/^\*(.*)\*$/)
    if (subMatch && !subtitle) { subtitle = subMatch[1]; continue }

    const posMatch = line.match(/^\*\*Позиция \d+ — (.*?): (.*)\*\*$/) || line.match(/^\*\*Position \d+ — (.*?): (.*)\*\*$/)
    if (posMatch) {
      if (currentSection?.position) sections.push(currentSection as CardSection)
      currentSection = { position: posMatch[1], cardName: posMatch[2], body: '' }
      continue
    }

    if (line.match(/^\*\*В итоге\*\*$/) || line.match(/^\*\*In Summary\*\*$/)) {
      if (currentSection?.position) { sections.push(currentSection as CardSection); currentSection = null }
      inSummary = true
      continue
    }

    if (line === '---' || line.trim() === '') continue

    if (inSummary) {
      if (line.trim()) summaryLines.push(line)
    } else if (currentSection) {
      currentSection.body = currentSection.body
        ? currentSection.body + ' ' + line.trim()
        : line.trim()
    }
  }
  if (currentSection?.position) sections.push(currentSection as CardSection)

  return { title, subtitle, sections, summary: summaryLines.join(' ') }
}

export default function ResultPage() {
  const router = useRouter()
  const { session, reader, question } = useAppStore()
  const [resultText, setResultText] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    if (!session.id) { router.replace('/'); return }
    const load = async () => {
      const reading = await getAsyncStatus(session.id!)
      if (reading?.resultText) setResultText(reading.resultText)
      setLoading(false)
      setTimeout(() => setRevealed(true), 300)
    }
    load()
  }, [session.id, router])

  if (loading) return <LoadingState />
  if (!resultText) return <NotReadyState onStatus={() => router.push('/async/status')} />

  const parsed = parseReading(resultText)

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* Навигация */}
      <div className="sticky top-0 z-10 glass" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="mx-auto max-w-xl flex items-center justify-between px-6 py-4">
          <p className="font-serif text-base font-light" style={{ color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
            Lumier
          </p>
          <Link href="/insights"
            className="label-overline transition-opacity hover:opacity-60"
            style={{ color: 'var(--text-muted)' }}>
            Статьи
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-xl px-6">
        <AnimatePresence>
          {revealed && (
            <>
              {/* Заголовок документа */}
              <motion.div variants={staggerNormal} initial="hidden" animate="visible" className="pt-12 pb-8">
                <motion.p variants={revealSubtle} className="label-overline mb-4" style={{ color: 'var(--gold)' }}>
                  Личный расклад
                </motion.p>
                <motion.h1 variants={revealHero}
                  className="font-serif font-light mb-2"
                  style={{ fontSize: '3rem', lineHeight: 1.0, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                  {parsed.title}
                </motion.h1>
                {parsed.subtitle && (
                  <motion.p variants={revealNormal} className="font-sans text-xs italic mb-6"
                    style={{ color: 'var(--text-muted)' }}>
                    {parsed.subtitle}
                  </motion.p>
                )}
                <motion.div variants={revealSubtle} className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg font-serif text-xs"
                    style={{ background: 'var(--bg-raised)', color: 'var(--text-secondary)' }}>
                    {reader.name?.charAt(0) ?? 'Ч'}
                  </div>
                  <p className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>
                    Читатель: {reader.name ?? 'Ваш читатель'} · {new Date().toLocaleDateString('ru-RU', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </motion.div>
                <motion.div variants={revealSubtle} className="mt-8 gold-rule" />
              </motion.div>

              {/* Контекст вопроса */}
              {question.text && (
                <motion.div
                  variants={artifactReveal}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.1 }}
                  className="mb-8 rounded-xl px-5 py-4"
                  style={{ background: 'rgba(196,150,74,0.05)', border: '1px solid rgba(196,150,74,0.15)' }}>
                  <p className="label-overline mb-2" style={{ color: 'var(--gold)' }}>Ваш вопрос</p>
                  <p className="font-sans text-sm leading-relaxed italic" style={{ color: 'var(--text-secondary)' }}>
                    «{question.text}»
                  </p>
                </motion.div>
              )}

              {/* Карты */}
              {parsed.sections.length > 0 ? (
                <motion.div variants={staggerSlow} initial="hidden" animate="visible" className="space-y-6 mb-8">
                  {parsed.sections.map((section, i) => (
                    <motion.div key={i} variants={artifactReveal} transition={{ delay: i * 0.12 }}>
                      <CardSection section={section} index={i} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div variants={artifactReveal} initial="hidden" animate="visible"
                  className="mb-8 rounded-xl p-6 reading-prose"
                  style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)' }}>
                  {resultText.split('\n').filter(l => l.trim()).map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </motion.div>
              )}

              {/* Итог */}
              {parsed.summary && (
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: dur.slow, ease: ease.outSoft }}
                  className="mb-10 rounded-xl p-6"
                  style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
                  <p className="label-overline mb-3" style={{ color: 'var(--gold)' }}>В итоге</p>
                  <p className="font-sans text-sm leading-[1.9]" style={{ color: 'var(--text-secondary)' }}>
                    {parsed.summary}
                  </p>
                </motion.div>
              )}

              {/* Действия */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                className="pb-14 space-y-3">
                <div className="gold-rule mb-6" />
                <div className="rounded-xl px-5 py-4"
                  style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)' }}>
                  <p className="label-overline mb-1.5" style={{ color: 'var(--text-muted)' }}>Заметка</p>
                  <p className="font-sans text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Самые глубокие расклады раскрываются со временем. Вернитесь к этому через несколько дней — и увидите, что прояснилось.
                  </p>
                </div>
                <Link href="/insights">
                  <div className="flex items-center justify-between rounded-xl px-5 py-4 transition-all"
                    style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)' }}>
                    <div>
                      <p className="font-sans text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Углубить практику</p>
                      <p className="font-sans text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Читайте статьи и руководства</p>
                    </div>
                    <span style={{ color: 'var(--text-muted)' }}>→</span>
                  </div>
                </Link>
                <button onClick={() => router.push('/question')}
                  className="w-full rounded-xl py-3.5 font-sans text-xs transition-all"
                  style={{ border: '1px dashed var(--border-default)', color: 'var(--text-muted)' }}>
                  Начать новый расклад
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

const POSITION_LABELS = ['Где вы стоите', 'Куда вы движетесь', 'Что это требует от вас']

function CardSection({ section, index }: { section: CardSection; index: number }) {
  return (
    <div className="rounded-xl overflow-hidden"
      style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-raised)' }}>
        <div>
          <p className="label-overline mb-0.5" style={{ color: 'var(--gold)' }}>
            {POSITION_LABELS[index] ?? section.position}
          </p>
          <p className="font-serif font-medium" style={{ fontSize: '1.1rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>
            {section.cardName}
          </p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl font-serif text-sm font-light"
          style={{ background: 'rgba(196,150,74,0.1)', color: 'var(--gold)' }}>
          {index + 1}
        </div>
      </div>
      <div className="px-5 py-5">
        <p className="font-sans text-sm leading-[1.9]" style={{ color: 'var(--text-secondary)' }}>
          {section.body}
        </p>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4" style={{ background: 'var(--bg-base)' }}>
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4], scale: [0.98, 1, 0.98] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="font-serif text-lg font-light"
        style={{ color: 'var(--text-muted)' }}>
        ✦
      </motion.div>
      <p className="label-overline" style={{ color: 'var(--text-muted)' }}>Загружаем ваш расклад</p>
    </div>
  )
}

function NotReadyState({ onStatus }: { onStatus: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center gap-4" style={{ background: 'var(--bg-base)' }}>
      <p className="font-serif text-2xl font-light" style={{ color: 'var(--text-secondary)' }}>
        Ещё в процессе
      </p>
      <p className="font-sans text-sm" style={{ color: 'var(--text-muted)' }}>
        Ваш расклад ещё не завершён.
      </p>
      <button onClick={onStatus}
        className="font-sans text-sm transition-opacity hover:opacity-70"
        style={{ color: 'var(--gold)' }}>
        Отследить статус →
      </button>
    </div>
  )
}
