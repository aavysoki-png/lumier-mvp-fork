'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ARTICLE_CATEGORIES } from '@/app/insights/InsightsClient'

interface ArticleFormProps {
  defaultValues?: {
    title?: string
    preview?: string
    content?: string
    category?: string
    readTime?: number
    published?: boolean
  }
  action: (formData: FormData) => Promise<{ error?: string } | void>
  submitLabel: string
}

export function ArticleForm({ defaultValues, action, submitLabel }: ArticleFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [published, setPublished] = useState(defaultValues?.published ?? false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget
    const formData = new FormData(form)
    formData.set('published', String(published))

    startTransition(async () => {
      const result = await action(formData)
      if (result && 'error' in result) setError(result.error ?? null)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Название */}
      <div className="space-y-1.5">
        <label className="label-overline" style={{ color: 'var(--text-muted)' }}>Заголовок *</label>
        <input
          name="title"
          defaultValue={defaultValues?.title}
          required
          placeholder="Меркурий в ретрограде: чего ждать в апреле"
          className="w-full rounded-xl px-4 py-3 font-sans text-sm outline-none transition-colors"
          style={{
            background: 'var(--bg-base)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-primary)',
          }}
        />
      </div>

      {/* Категория + Время чтения */}
      <div className="flex gap-3">
        <div className="flex-1 space-y-1.5">
          <label className="label-overline" style={{ color: 'var(--text-muted)' }}>Категория</label>
          <select
            name="category"
            defaultValue={defaultValues?.category || 'general'}
            className="w-full rounded-xl px-4 py-3 font-sans text-sm outline-none"
            style={{
              background: 'var(--bg-base)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
            }}
          >
            {Object.entries(ARTICLE_CATEGORIES).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div className="w-28 space-y-1.5">
          <label className="label-overline" style={{ color: 'var(--text-muted)' }}>Мин чтения</label>
          <input
            name="readTime"
            type="number"
            min={1}
            max={60}
            defaultValue={defaultValues?.readTime ?? 5}
            className="w-full rounded-xl px-4 py-3 font-sans text-sm outline-none"
            style={{
              background: 'var(--bg-base)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
      </div>

      {/* Превью */}
      <div className="space-y-1.5">
        <label className="label-overline" style={{ color: 'var(--text-muted)' }}>Превью * <span className="normal-case font-sans text-xs tracking-normal">(1–2 предложения)</span></label>
        <textarea
          name="preview"
          defaultValue={defaultValues?.preview}
          required
          rows={3}
          placeholder="Краткое описание, которое увидят на карточке статьи..."
          className="w-full rounded-xl px-4 py-3 font-sans text-sm outline-none resize-none"
          style={{
            background: 'var(--bg-base)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-primary)',
          }}
        />
      </div>

      {/* Контент */}
      <div className="space-y-1.5">
        <label className="label-overline" style={{ color: 'var(--text-muted)' }}>
          Текст статьи *{' '}
          <span className="normal-case font-sans text-xs tracking-normal">
            (**Заголовок** — для подзаголовков, **текст** — жирный)
          </span>
        </label>
        <textarea
          name="content"
          defaultValue={defaultValues?.content}
          required
          rows={16}
          placeholder="**Введение**&#10;&#10;Текст первого абзаца...&#10;&#10;**Раздел второй**&#10;&#10;Продолжение статьи..."
          className="w-full rounded-xl px-4 py-3 font-sans text-sm outline-none resize-y"
          style={{
            background: 'var(--bg-base)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-primary)',
            minHeight: '280px',
          }}
        />
      </div>

      {/* Публикация */}
      <div
        className="flex items-center justify-between rounded-xl px-4 py-3"
        style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)' }}
      >
        <div>
          <p className="font-sans text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            {published ? 'Опубликовано' : 'Черновик'}
          </p>
          <p className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>
            {published ? 'Видно всем читателям' : 'Только для администратора'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPublished(!published)}
          className="relative w-11 h-6 rounded-full transition-colors"
          style={{ background: published ? 'var(--gold)' : 'var(--border-default)' }}
        >
          <span
            className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
            style={{ transform: published ? 'translateX(22px)' : 'translateX(2px)' }}
          />
        </button>
      </div>

      {error && (
        <p className="font-sans text-sm text-red-500">{error}</p>
      )}

      {/* Кнопки */}
      <div className="flex gap-3 pt-2">
        <motion.button
          type="submit"
          disabled={isPending}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.97 }}
          className="flex-1 rounded-xl py-3 font-sans text-sm font-medium transition-opacity disabled:opacity-50"
          style={{ background: 'var(--gold)', color: '#fff' }}
        >
          {isPending ? 'Сохранение...' : submitLabel}
        </motion.button>
        <motion.button
          type="button"
          onClick={() => router.push('/admin/news')}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.97 }}
          className="rounded-xl px-5 py-3 font-sans text-sm transition-colors"
          style={{ background: 'var(--bg-raised)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
        >
          Отмена
        </motion.button>
      </div>
    </form>
  )
}
