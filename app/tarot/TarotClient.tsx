'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  type DrawnCard, type TarotReading,
  SPREAD_LABELS, SUIT_SYMBOLS, SPREAD_ORDER,
} from '@/entities/tarot'
import { dur, ease } from '@/shared/animations/variants'

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = 'question' | 'drawing' | 'reading'

const CATEGORIES = [
  { id: 'relationships', label: 'Отношения' },
  { id: 'career',        label: 'Карьера' },
  { id: 'growth',        label: 'Рост' },
  { id: 'future',        label: 'Будущее' },
  { id: 'general',       label: 'Общее' },
]

// ─── Main Component ───────────────────────────────────────────────────────────

export function TarotClient() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('question')
  const [question, setQuestion] = useState('')
  const [category, setCategory] = useState('general')
  const [error, setError] = useState('')

  // Reading state
  const [cards, setCards] = useState<DrawnCard[]>([])
  const [reading, setReading] = useState<TarotReading | null>(null)
  const [revealedCount, setRevealedCount] = useState(0)
  const [apiDone, setApiDone] = useState(false)

  // ── Submit question ──────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (question.trim().length < 3) {
      setError('Пожалуйста, опишите ваш вопрос подробнее')
      return
    }
    setError('')
    setPhase('drawing')

    try {
      const res = await fetch('/api/tarot-reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim(), category }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Unknown error')
      setCards(data.drawnCards)
      setReading(data.reading)
      setApiDone(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ошибка соединения'
      setError(msg)
      setPhase('question')
    }
  }, [question, category])

  // ── Card reveal sequence ────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'drawing' || cards.length === 0) return
    let i = 0
    const interval = setInterval(() => {
      i++
      setRevealedCount(i)
      if (i >= 6) clearInterval(interval)
    }, 700)
    return () => clearInterval(interval)
  }, [phase, cards.length])

  // ── Transition to reading phase ─────────────────────────────────
  useEffect(() => {
    if (revealedCount >= 6 && apiDone) {
      const timer = setTimeout(() => setPhase('reading'), 800)
      return () => clearTimeout(timer)
    }
  }, [revealedCount, apiDone])

  return (
    <div className="min-h-screen relative" style={{ background: 'var(--bg-base)' }}>
      {/* ── Header ──────────────────────────────────────────────── */}
      <div
        className="glass sticky top-0 z-30"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="mx-auto max-w-2xl px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="font-sans text-xs uppercase tracking-widest transition-opacity hover:opacity-60"
            style={{ color: 'var(--text-muted)' }}
          >
            ← Назад
          </button>
          <p
            className="font-serif text-base font-light"
            style={{ color: 'var(--text-primary)', letterSpacing: '0.04em' }}
          >
            Lumier
          </p>
        </div>
      </div>

      {/* ── Ambient glow ────────────────────────────────────────── */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 30%, rgba(212,149,74,0.06) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-2xl px-6">
        <AnimatePresence mode="wait">
          {phase === 'question' && (
            <QuestionPhase
              key="question"
              question={question}
              setQuestion={setQuestion}
              category={category}
              setCategory={setCategory}
              error={error}
              onSubmit={handleSubmit}
            />
          )}

          {phase === 'drawing' && (
            <DrawingPhase
              key="drawing"
              cards={cards}
              revealedCount={revealedCount}
              apiDone={apiDone}
            />
          )}

          {phase === 'reading' && reading && (
            <ReadingPhase
              key="reading"
              cards={cards}
              reading={reading}
              question={question}
              onNewReading={() => {
                setPhase('question')
                setQuestion('')
                setCards([])
                setReading(null)
                setRevealedCount(0)
                setApiDone(false)
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 1 — QUESTION
// ═══════════════════════════════════════════════════════════════════════════════

function QuestionPhase({
  question, setQuestion, category, setCategory, error, onSubmit,
}: {
  question: string; setQuestion: (q: string) => void
  category: string; setCategory: (c: string) => void
  error: string; onSubmit: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: dur.slow, ease: ease.outSoft }}
      className="pt-16 pb-20 space-y-8"
    >
      {/* Title */}
      <div className="text-center space-y-3">
        <p className="label-overline" style={{ color: 'var(--gold)' }}>
          Таро расклад
        </p>
        <h1
          className="font-serif font-light"
          style={{ fontSize: '2rem', color: 'var(--text-primary)' }}
        >
          О чём говорит ваше сердце?
        </h1>
        <p className="font-sans text-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Задайте вопрос — и карты раскроют то, что скрыто.
        </p>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap justify-center gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className="rounded-full px-4 py-1.5 font-sans text-xs font-medium transition-all"
            style={{
              background: cat.id === category ? 'var(--gold)' : 'var(--bg-raised)',
              color: cat.id === category ? '#0E1520' : 'var(--text-secondary)',
              border: cat.id === category ? '1px solid transparent' : '1px solid var(--border-subtle)',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Question input */}
      <div className="space-y-3">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Я хочу понять..."
          rows={4}
          maxLength={500}
          className="w-full rounded-2xl px-5 py-4 font-sans text-sm outline-none resize-none"
          style={{
            background: 'var(--bg-raised)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
            lineHeight: 1.8,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'rgba(212,149,74,0.4)'
            e.target.style.boxShadow = '0 0 0 3px rgba(212,149,74,0.08)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--border-subtle)'
            e.target.style.boxShadow = 'none'
          }}
        />
        <div className="flex justify-between px-1">
          <p className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>
            {question.length}/500
          </p>
          {error && <p className="font-sans text-xs" style={{ color: '#F87171' }}>{error}</p>}
        </div>
      </div>

      {/* Submit */}
      <div className="text-center">
        <motion.button
          whileHover={{ y: -2, boxShadow: '0 0 32px rgba(212,149,74,0.25)' }}
          whileTap={{ scale: 0.97 }}
          onClick={onSubmit}
          disabled={question.trim().length < 3}
          className="rounded-2xl px-10 py-4 font-sans text-sm font-medium transition-all disabled:opacity-40"
          style={{
            background: 'var(--gold)',
            color: '#0E1520',
            boxShadow: '0 0 24px rgba(212,149,74,0.20), 0 4px 16px rgba(0,0,0,0.35)',
          }}
        >
          Раскрыть карты ✦
        </motion.button>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 2 — DRAWING & REVEAL
// ═══════════════════════════════════════════════════════════════════════════════

function DrawingPhase({
  cards, revealedCount, apiDone,
}: {
  cards: DrawnCard[]; revealedCount: number; apiDone: boolean
}) {
  const hasCards = cards.length > 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: dur.slow }}
      className="pt-16 pb-20"
    >
      {/* Title */}
      <div className="text-center mb-12 space-y-3">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="label-overline"
          style={{ color: 'var(--gold)' }}
        >
          {hasCards
            ? revealedCount >= 6
              ? apiDone ? 'Карты раскрыты' : 'Считываю энергию...'
              : 'Карты открываются...'
            : 'Перемешиваю колоду...'
          }
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="font-serif font-light"
          style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}
        >
          Шесть карт расклада
        </motion.h2>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-md mx-auto">
        {SPREAD_ORDER.map((pos, i) => {
          const card = hasCards ? cards.find(c => c.position === pos) : undefined
          const isRevealed = i < revealedCount
          return (
            <TarotCard
              key={pos}
              index={i}
              card={card}
              isRevealed={isRevealed}
              position={pos}
            />
          )
        })}
      </div>

      {/* Loading indicator */}
      {!apiDone && hasCards && revealedCount >= 6 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-8"
        >
          <div className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" style={{ color: 'var(--gold)' }} />
            <p className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>
              Lumier читает расклад...
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

// ─── Single Tarot Card with flip ──────────────────────────────────────────────

function TarotCard({
  index, card, isRevealed, position,
}: {
  index: number; card?: DrawnCard; isRevealed: boolean; position: string
}) {
  const label = SPREAD_LABELS[position as keyof typeof SPREAD_LABELS]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.15 + 0.3, duration: 0.5, ease: ease.outSoft }}
      className="relative"
      style={{ perspective: '600px' }}
    >
      <motion.div
        animate={{ rotateY: isRevealed && card ? 180 : 0 }}
        transition={{ duration: 0.7, ease: ease.outSoft }}
        className="relative w-full"
        style={{
          aspectRatio: '2.5/4',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* ── Card Back ──────────────────────────────────── */}
        <div
          className="absolute inset-0 rounded-xl flex flex-col items-center justify-center"
          style={{
            backfaceVisibility: 'hidden',
            background: 'linear-gradient(160deg, #152030 0%, #1C2C40 50%, #152030 100%)',
            border: '1px solid rgba(212,149,74,0.20)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(212,149,74,0.08) inset',
          }}
        >
          <div
            className="w-8 h-8 rounded-full mb-2 flex items-center justify-center"
            style={{
              border: '1px solid rgba(212,149,74,0.3)',
              color: 'var(--gold)',
              fontSize: '0.875rem',
            }}
          >
            ✦
          </div>
          <p className="font-sans text-[0.55rem] uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>
            {label?.ru || ''}
          </p>
        </div>

        {/* ── Card Face ──────────────────────────────────── */}
        <div
          className="absolute inset-0 rounded-xl flex flex-col items-center justify-between p-3"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(170deg, #1C2C40 0%, #152030 100%)',
            border: `1px solid ${card?.arcana === 'major' ? 'rgba(212,149,74,0.35)' : 'rgba(255,255,255,0.10)'}`,
            boxShadow: card?.arcana === 'major'
              ? '0 4px 24px rgba(212,149,74,0.15), 0 0 0 1px rgba(212,149,74,0.10) inset'
              : '0 4px 24px rgba(0,0,0,0.4)',
          }}
        >
          {/* Position label */}
          <p
            className="font-sans text-[0.5rem] uppercase tracking-[0.12em] text-center"
            style={{ color: 'var(--text-muted)' }}
          >
            {label?.ru}
          </p>

          {/* Card name */}
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-1">
            {card?.suit && (
              <span style={{ color: 'var(--gold)', fontSize: '1.25rem', opacity: 0.7 }}>
                {SUIT_SYMBOLS[card.suit]}
              </span>
            )}
            {card?.arcana === 'major' && (
              <span style={{ color: 'var(--gold)', fontSize: '0.7rem' }}>
                {card.id}
              </span>
            )}
            <p
              className="font-serif font-medium leading-tight"
              style={{
                fontSize: '0.75rem',
                color: card?.arcana === 'major' ? 'var(--gold)' : 'var(--text-primary)',
              }}
            >
              {card?.name}
            </p>
          </div>

          {/* Reversed indicator */}
          {card?.isReversed && (
            <p
              className="font-sans text-[0.5rem] uppercase tracking-widest"
              style={{ color: '#F87171', opacity: 0.7 }}
            >
              Перевёрнута
            </p>
          )}
          {!card?.isReversed && (
            <p
              className="font-sans text-[0.5rem] uppercase tracking-widest"
              style={{ color: 'var(--text-muted)', opacity: 0.5 }}
            >
              Прямая
            </p>
          )}
        </div>
      </motion.div>

      {/* Glow when revealing */}
      {isRevealed && card && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0] }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(212,149,74,0.15) 0%, transparent 70%)',
          }}
        />
      )}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 3 — READING
// ═══════════════════════════════════════════════════════════════════════════════

function ReadingPhase({
  cards, reading, question, onNewReading,
}: {
  cards: DrawnCard[]; reading: TarotReading; question: string
  onNewReading: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: dur.slow, ease: ease.outSoft }}
      className="pt-10 pb-20 space-y-10"
    >
      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center space-y-4"
      >
        <p className="label-overline" style={{ color: 'var(--gold)' }}>
          Ваш расклад
        </p>
        <blockquote
          className="font-serif font-light italic leading-relaxed mx-auto max-w-md"
          style={{ fontSize: '1.35rem', color: 'var(--text-primary)' }}
        >
          &ldquo;{reading.summary}&rdquo;
        </blockquote>
        <p className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>
          {question}
        </p>
      </motion.div>

      <div className="gold-rule" />

      {/* Mini card strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-6 gap-1.5 max-w-sm mx-auto"
      >
        {cards.map((card, i) => (
          <div
            key={card.id}
            className="rounded-lg p-2 text-center"
            style={{
              background: 'var(--bg-raised)',
              border: card.arcana === 'major'
                ? '1px solid rgba(212,149,74,0.25)'
                : '1px solid var(--border-subtle)',
            }}
          >
            <p className="font-sans text-[0.45rem] uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>
              {SPREAD_LABELS[SPREAD_ORDER[i]].ru}
            </p>
            <p
              className="font-serif text-[0.55rem] font-medium leading-tight"
              style={{ color: card.arcana === 'major' ? 'var(--gold)' : 'var(--text-secondary)' }}
            >
              {card.name}
            </p>
            {card.isReversed && (
              <p className="text-[0.4rem] mt-0.5" style={{ color: '#F87171', opacity: 0.6 }}>↻</p>
            )}
          </div>
        ))}
      </motion.div>

      {/* Interpretation */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-6"
      >
        <div className="reading-prose">
          {reading.interpretation.split('\n\n').map((para, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.15 }}
            >
              {para}
            </motion.p>
          ))}
        </div>
      </motion.div>

      {/* Card-by-card insights */}
      {reading.cards?.length > 0 && reading.cards[0]?.insight && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="space-y-3"
        >
          <p className="label-overline" style={{ color: 'var(--text-muted)' }}>
            Позиции расклада
          </p>
          {reading.cards.map((ci, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.4 + i * 0.1 }}
              className="rounded-xl px-5 py-4"
              style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)' }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-sans text-[0.6rem] uppercase tracking-wider" style={{ color: 'var(--gold)' }}>
                  {ci.position}
                </span>
                <span style={{ color: 'var(--border-default)' }}>·</span>
                <span className="font-serif text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                  {ci.name}
                </span>
              </div>
              <p className="font-sans text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {ci.insight}
              </p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Advice */}
      {reading.advice && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
          className="rounded-2xl p-6 text-center space-y-3"
          style={{
            background: 'var(--bg-float)',
            border: '1px solid rgba(212,149,74,0.15)',
            boxShadow: '0 0 32px rgba(212,149,74,0.06)',
          }}
        >
          <p className="label-overline" style={{ color: 'var(--gold)' }}>Совет карт</p>
          <p
            className="font-serif font-light leading-relaxed mx-auto max-w-md"
            style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}
          >
            {reading.advice}
          </p>
        </motion.div>
      )}

      <div className="gold-rule" />

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
        className="flex flex-col items-center gap-3"
      >
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={onNewReading}
          className="rounded-2xl px-8 py-3 font-sans text-sm font-medium"
          style={{
            background: 'var(--gold)',
            color: '#0E1520',
            boxShadow: '0 0 20px rgba(212,149,74,0.18)',
          }}
        >
          Новый расклад
        </motion.button>
        <button
          onClick={() => window.history.back()}
          className="font-sans text-xs transition-opacity hover:opacity-60"
          style={{ color: 'var(--text-muted)' }}
        >
          Вернуться на главную
        </button>
      </motion.div>
    </motion.div>
  )
}
