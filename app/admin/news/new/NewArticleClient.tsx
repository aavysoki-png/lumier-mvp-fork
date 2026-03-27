'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { pageTransition } from '@/shared/animations/variants'
import { ArticleForm } from '../ArticleForm'
import { createArticle } from '@/server/actions/news'

export function NewArticleClient() {
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
        <div className="mx-auto max-w-2xl flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/news')}
            className="font-sans text-xs uppercase tracking-widest transition-opacity hover:opacity-60"
            style={{ color: 'var(--text-muted)' }}
          >
            ← Статьи
          </button>
          <p className="font-serif text-lg font-light" style={{ color: 'var(--text-primary)' }}>
            Новая статья
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-8">
        <ArticleForm action={createArticle} submitLabel="Создать статью" />
      </div>
    </motion.div>
  )
}
