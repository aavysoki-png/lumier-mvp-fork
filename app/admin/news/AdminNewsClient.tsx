'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { motion } from 'framer-motion'
import { pageTransition, staggerNormal, revealNormal } from '@/shared/animations/variants'
import { deleteArticle, togglePublish } from '@/server/actions/news'
import { ARTICLE_CATEGORIES } from '@/app/insights/InsightsClient'

interface Article {
  id: string
  title: string
  category: string
  readTime: number
  published: boolean
  createdAt: Date | string
  author?: { name: string } | null
}

interface Props {
  articles: Article[]
}

export function AdminNewsClient({ articles }: Props) {
  const router = useRouter()

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      className="min-h-screen"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Шапка */}
      <div
        className="sticky top-0 z-10 glass px-6 py-4"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="mx-auto max-w-2xl flex items-center justify-between">
          <div>
            <p className="label-overline" style={{ color: 'var(--gold)' }}>Администратор</p>
            <p className="font-serif text-lg font-light" style={{ color: 'var(--text-primary)' }}>
              Управление статьями
            </p>
          </div>
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/admin/news/new')}
            className="flex items-center gap-2 rounded-xl px-4 py-2 font-sans text-sm font-medium"
            style={{ background: 'var(--gold)', color: '#fff' }}
          >
            + Новая статья
          </motion.button>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-6">
        {/* Счётчики */}
        <div className="flex gap-4 mb-6">
          <div className="rounded-xl px-4 py-3 flex-1 text-center" style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)' }}>
            <p className="font-serif text-2xl font-light" style={{ color: 'var(--text-primary)' }}>{articles.length}</p>
            <p className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>Всего</p>
          </div>
          <div className="rounded-xl px-4 py-3 flex-1 text-center" style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)' }}>
            <p className="font-serif text-2xl font-light" style={{ color: 'var(--gold)' }}>{articles.filter(a => a.published).length}</p>
            <p className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>Опубликовано</p>
          </div>
          <div className="rounded-xl px-4 py-3 flex-1 text-center" style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)' }}>
            <p className="font-serif text-2xl font-light" style={{ color: 'var(--text-secondary)' }}>{articles.filter(a => !a.published).length}</p>
            <p className="font-sans text-xs" style={{ color: 'var(--text-muted)' }}>Черновики</p>
          </div>
        </div>

        {articles.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-serif text-xl font-light" style={{ color: 'var(--text-muted)' }}>Статей пока нет</p>
            <p className="font-sans text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Нажмите «+ Новая статья» чтобы начать</p>
          </div>
        ) : (
          <motion.div variants={staggerNormal} initial="hidden" animate="visible" className="space-y-3">
            {articles.map((article) => (
              <motion.div key={article.id} variants={revealNormal}>
                <ArticleRow article={article} onEdit={() => router.push(`/admin/news/${article.id}/edit`)} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

function ArticleRow({ article, onEdit }: { article: Article; onEdit: () => void }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleToggle() {
    startTransition(async () => {
      await togglePublish(article.id, !article.published)
      router.refresh()
    })
  }

  function handleDelete() {
    if (!confirm(`Удалить статью «${article.title}»?`)) return
    startTransition(async () => {
      await deleteArticle(article.id)
      router.refresh()
    })
  }

  return (
    <motion.div
      whileHover={{ y: -1 }}
      className="rounded-xl px-5 py-4"
      style={{
        background: 'var(--bg-float)',
        border: '1px solid var(--border-subtle)',
        opacity: isPending ? 0.6 : 1,
      }}
    >
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="font-sans text-xs uppercase tracking-wider"
              style={{ color: 'var(--gold)', fontSize: '0.6rem' }}
            >
              {ARTICLE_CATEGORIES[article.category] || article.category}
            </span>
            <span
              className="font-sans text-xs rounded-full px-2 py-0.5"
              style={{
                background: article.published ? 'rgba(196,150,74,0.12)' : 'var(--bg-raised)',
                color: article.published ? 'var(--gold)' : 'var(--text-muted)',
                fontSize: '0.6rem',
              }}
            >
              {article.published ? '● Опубликовано' : '○ Черновик'}
            </span>
          </div>
          <p className="font-serif font-medium leading-snug" style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
            {article.title}
          </p>
          <p className="font-sans text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {new Date(article.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
            {article.author ? ` · ${article.author.name}` : ''}
            {` · ${article.readTime} мин`}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleToggle}
            disabled={isPending}
            className="rounded-lg px-3 py-1.5 font-sans text-xs transition-colors"
            style={{
              background: article.published ? 'var(--bg-raised)' : 'rgba(196,150,74,0.15)',
              color: article.published ? 'var(--text-muted)' : 'var(--gold)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {article.published ? 'Снять' : 'Опубл.'}
          </button>
          <button
            onClick={onEdit}
            className="rounded-lg px-3 py-1.5 font-sans text-xs"
            style={{ background: 'var(--bg-raised)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
          >
            Изменить
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="rounded-lg px-3 py-1.5 font-sans text-xs transition-colors hover:bg-red-50"
            style={{ color: '#ef4444', border: '1px solid var(--border-subtle)' }}
          >
            ✕
          </button>
        </div>
      </div>
    </motion.div>
  )
}
