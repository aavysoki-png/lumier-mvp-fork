'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { getAsyncStatus, completeAsyncReading } from '@/server/actions'
import { useAppStore } from '@/shared/lib/store'
import { Button } from '@/shared/ui/Button'
import { pageIn, revealNormal, revealSubtle, dur, ease } from '@/shared/animations/variants'
import Link from 'next/link'

type StatusType = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'

const DEMO_RESULT = `**Ваш расклад: На перепутье**

*Для вашего вопроса были вытянуты три карты.*

---

**Позиция 1 — Где вы стоите: Восьмёрка Пентаклей**

Вы создали подлинное мастерство на своём нынешнем месте. Эта карта подтверждает то, что вы, вероятно, уже чувствуете: вы уходите не потому, что потерпели здесь поражение. Вы действительно овладели чем-то важным. Восьмёрка Пентаклей просит вас признать этот фундамент, прежде чем шагнуть вперёд.

---

**Позиция 2 — Куда вы движетесь: Шут**

Шут — карта подлинных новых начинаний. Его появление здесь говорит о том, что неопределённость, которую вы назвали в своём вопросе — это не проблема, которую нужно решить перед тем, как действовать. Это сама природа порога.

То, к чему вас приглашают — не чёткий путь. Это подлинное открытие.

---

**Позиция 3 — Что требует этот переход: Верховная Жрица**

Верховная Жрица просит вас прислушаться глубже к тому, что вы уже знаете — прежде чем обращаться за внешним подтверждением. Она спрашивает: что вы знаете в той части себя, которой не нужно быть убеждённой?

---

**В итоге**

Фундамент у вас есть. Возможность реальна. Единственное, что стоит между вами и следующим шагом — это не информация. Это разрешение, которое вы ещё не дали себе полностью.`

const STAGE_COPY: Record<StatusType, { headline: string; sub: string; body: string }> = {
  PENDING: {
    headline: 'Ваш запрос получен',
    sub: 'Ожидание консультанта',
    body: 'Ваш вопрос в руках консультанта. Он приступит к работе, когда будет готов уделить ему должное внимание.',
  },
  IN_PROGRESS: {
    headline: 'Ваш расклад создаётся',
    sub: 'Консультант с вашим вопросом',
    body: 'Это вдумчивый процесс. Ваш Консультант медитирует над вопросом, тянет карты и составляет ответ — специально для вас.',
  },
  COMPLETED: {
    headline: 'Ваш расклад готов',
    sub: 'Ответ завершён',
    body: 'Ваш Консультант завершил личный расклад. Не торопитесь с ним.',
  },
}

const STEPS = [
  { key: 'PENDING',     label: 'Вопрос получен',       detail: 'Доставлен вашему консультанту' },
  { key: 'IN_PROGRESS', label: 'Расклад создаётся',    detail: 'Консультант работает над ответом' },
  { key: 'COMPLETED',   label: 'Расклад готов',         detail: 'Доступен для просмотра' },
] as const

export default function AsyncStatusPage() {
  const router = useRouter()
  const { session, reader } = useAppStore()
  const [status, setStatus] = useState<StatusType>('IN_PROGRESS')
  const [readingId, setReadingId] = useState<string | null>(null)
  const autoCompleted = useRef(false)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  const checkStatus = useCallback(async () => {
    if (!session.id) return
    const reading = await getAsyncStatus(session.id)
    if (reading) {
      setReadingId(reading.id)
      setStatus(reading.status as StatusType)
      if (reading.status === 'COMPLETED' && pollRef.current) {
        clearInterval(pollRef.current)
      }
    }
  }, [session.id])

  useEffect(() => {
    checkStatus()
    pollRef.current = setInterval(checkStatus, 3000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [checkStatus])

  useEffect(() => {
    if (!readingId || status === 'COMPLETED' || autoCompleted.current) return
    const t = setTimeout(async () => {
      autoCompleted.current = true
      await completeAsyncReading(readingId, DEMO_RESULT)
      setStatus('COMPLETED')
    }, 18000)
    return () => clearTimeout(t)
  }, [readingId, status])

  const copy = STAGE_COPY[status]
  const stageIndex = status === 'PENDING' ? 0 : status === 'IN_PROGRESS' ? 1 : 2

  return (
    <motion.div variants={pageIn} initial="hidden" animate="visible"
      className="flex min-h-screen flex-col" style={{ background: 'var(--bg-base)' }}>

      <motion.div
        animate={{ opacity: status === 'COMPLETED' ? 1 : 0.5 }}
        transition={{ duration: 1.2 }}
        className="pointer-events-none absolute inset-x-0 top-0 h-72"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(196,150,74,0.08), transparent)' }}
      />

      <div className="relative px-6 pt-12 pb-8">
        <p className="font-serif text-lg font-light" style={{ color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
          Lumier
        </p>
        <div className="mt-1.5" style={{ height: 1, width: 24, background: 'var(--gold)' }} />
      </div>

      <div className="relative flex-1 px-6">
        <AnimatePresence mode="wait">
          <motion.div key={status}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: dur.normal, ease: ease.outSoft }}
            className="mb-10">
            <div className="flex items-center gap-2.5 mb-4">
              <StatusOrb status={status} />
              <p className="label-overline" style={{ color: 'var(--gold)' }}>{copy.sub}</p>
            </div>
            <h1 className="font-serif font-light mb-3"
              style={{ fontSize: '1.875rem', lineHeight: 1.15, color: 'var(--text-primary)' }}>
              {copy.headline}
            </h1>
            <p className="font-sans text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', maxWidth: '32ch' }}>
              {copy.body}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Этапы */}
        <div className="mb-8">
          <div className="space-y-px">
            {STEPS.map((step, i) => {
              const done = i < stageIndex
              const active = i === stageIndex
              return (
                <motion.div key={step.key}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1, duration: dur.normal, ease: ease.outSoft }}
                  className="flex items-center gap-4 py-3.5">
                  <div className="relative flex flex-col items-center" style={{ width: 32 }}>
                    <motion.div
                      animate={{
                        background: done ? 'var(--gold)' : active ? 'var(--text-primary)' : 'var(--bg-raised)',
                        borderColor: done || active ? 'transparent' : 'var(--border-default)',
                      }}
                      transition={{ duration: 0.5 }}
                      className="flex h-8 w-8 items-center justify-center rounded-xl border font-sans text-xs font-medium"
                      style={{ color: done || active ? 'white' : 'var(--text-muted)' }}
                    >
                      {done ? (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500 }}>
                          ✓
                        </motion.span>
                      ) : i + 1}
                    </motion.div>
                    {i < STEPS.length - 1 && (
                      <div className="mt-1" style={{ width: 1, height: 16, background: done ? 'var(--gold-light)' : 'var(--border-subtle)' }} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-sans text-sm"
                      style={{ color: active ? 'var(--text-primary)' : done ? 'var(--text-secondary)' : 'var(--text-muted)', fontWeight: active ? 500 : 400 }}>
                      {step.label}
                    </p>
                    {(done || active) && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="font-sans text-xs mt-0.5"
                        style={{ color: 'var(--text-muted)' }}>
                        {step.detail}
                      </motion.p>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Карточка консультанта */}
        <motion.div variants={revealNormal} initial="hidden" animate="visible"
          className="mb-6 rounded-xl p-5"
          style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center font-serif text-sm"
              style={{ background: 'var(--bg-raised)', color: 'var(--text-secondary)' }}>
              {reader.name?.charAt(0) ?? 'Ч'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-serif text-base" style={{ color: 'var(--text-primary)' }}>{reader.name}</p>
              <p className="font-sans text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{reader.specialization}</p>
            </div>
            {status === 'IN_PROGRESS' && (
              <div className="flex items-center gap-1.5 rounded-full px-3 py-1"
                style={{ background: 'rgba(196,150,74,0.08)' }}>
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: 'var(--gold)' }}
                />
                <p className="font-sans text-xs" style={{ color: 'var(--gold)' }}>Работает</p>
              </div>
            )}
          </div>

          {status !== 'COMPLETED' && (
            <div>
              <div className="overflow-hidden rounded-full" style={{ height: 3, background: 'var(--border-subtle)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(to right, var(--gold-light), var(--gold))' }}
                  initial={{ width: '18%' }}
                  animate={{ width: status === 'IN_PROGRESS' ? '72%' : '100%' }}
                  transition={{ duration: 1.4, ease: ease.outSoft }}
                />
              </div>
              <p className="mt-1.5 font-sans text-xs" style={{ color: 'var(--text-muted)' }}>
                {status === 'IN_PROGRESS' ? 'Расклад в процессе…' : 'Ожидание консультанта'}
              </p>
            </div>
          )}
        </motion.div>

        {/* Статьи пока ждёте */}
        {status !== 'COMPLETED' && (
          <motion.div variants={revealSubtle} initial="hidden" animate="visible"
            transition={{ delay: 0.4 }} className="mb-4">
            <Link href="/insights">
              <div className="flex items-center justify-between rounded-xl px-5 py-4 transition-all"
                style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)' }}>
                <div>
                  <p className="font-sans text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Читайте пока ждёте
                  </p>
                  <p className="font-sans text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Статьи о практике и подготовке
                  </p>
                </div>
                <span style={{ color: 'var(--text-muted)' }}>→</span>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Демо-кнопка */}
        {status === 'IN_PROGRESS' && readingId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 5 }}>
            <button
              onClick={async () => {
                await completeAsyncReading(readingId, DEMO_RESULT)
                setStatus('COMPLETED')
              }}
              className="w-full rounded-xl py-3 font-sans text-xs transition-all"
              style={{ border: '1px dashed var(--border-default)', color: 'var(--text-muted)' }}>
              [Демо] Завершить расклад сейчас
            </button>
          </motion.div>
        )}
      </div>

      <div className="relative px-6 pb-10 pt-4 safe-bottom">
        <AnimatePresence>
          {status === 'COMPLETED' && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: dur.slow, ease: ease.outSoft }}>
              <Button onClick={() => router.push('/result')} fullWidth size="lg" variant="secondary">
                Открыть мой расклад →
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

function StatusOrb({ status }: { status: StatusType }) {
  const colors: Record<StatusType, string> = {
    PENDING:     '#B5ADA4',
    IN_PROGRESS: 'var(--gold)',
    COMPLETED:   '#4ade80',
  }
  return (
    <div className="relative h-3 w-3">
      {status === 'IN_PROGRESS' && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: 'var(--gold)' }}
          animate={{ scale: [1, 2.2, 1], opacity: [0.7, 0, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
        />
      )}
      <div className="relative h-3 w-3 rounded-full" style={{ background: colors[status] }} />
    </div>
  )
}
