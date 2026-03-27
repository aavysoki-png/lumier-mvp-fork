'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { pageTransition } from '@/shared/animations/variants'
import { ArticleForm } from '../../ArticleForm'
import { updateArticle } from '@/server/actions/news'

interface Article {
  id: string
  title: string
  preview: string
  content: string
  category: string
  readTime: number
  published: boolean
}

export function EditArticleClient({ article }: { article: Article }) {
  const router = useRouter()

  const action = updateArticle.bind(null, article.id)

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
        <div className="mx-auto max-w-2xl flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/news')}
            className="font-sans text-xs uppercase tracking-widest transition-opacity hover:opacity-60"
            style={{ color: 'var(--text-muted)' }}
          >
            ← Статьи
          </button>
          <p className="font-serif text-lg font-light" style={{ color: 'var(--text-primary)' }}>
            Редактировать статью
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-8">
        <ArticleForm
          action={action}
          submitLabel="Сохранить изменения"
          defaultValues={{
            title:     article.title,
            preview:   article.preview,
            content:   article.content,
            category:  article.category,
            readTime:  article.readTime,
            published: article.published,
          }}
        />
      </div>
    </motion.div>
  )
}
