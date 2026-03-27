'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { pageTransition, staggerContainer, staggerItem } from '@/shared/animations/variants'

interface Insight {
  id: string
  title: string
  preview: string
  category: string
  readTime: number
  createdAt: Date | string
}

interface Props {
  insights: Insight[]
}

const CATEGORY_LABELS: Record<string, string> = {
  practice: 'Практика',
  guide:    'Руководство',
  insight:  'Откровение',
  general:  'Общее',
}

export function InsightsClient({ insights }: Props) {
  const router = useRouter()

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-ivory-50"
    >
      {/* Шапка */}
      <div className="px-6 pt-14 pb-6">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/question')}
            className="font-sans text-xs uppercase tracking-widest text-stone-400 hover:text-stone-600 transition-colors"
          >
            ← Главная
          </button>
          <p className="font-serif text-sm font-light text-stone-600">Lumier</p>
        </div>

        <div className="space-y-2">
          <p className="font-sans text-xs uppercase tracking-widest text-stone-400">
            Статьи
          </p>
          <h1 className="font-serif text-4xl font-light text-stone-800">
            Углубите вашу
            <br />
            практику
          </h1>
          <p className="font-sans text-sm text-stone-500">
            Размышления о чтении, ритуале и внутренней работе.
          </p>
        </div>
      </div>

      {/* Главная статья */}
      {insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="px-6 mb-6"
        >
          <FeaturedCard insight={insights[0]} onClick={() => router.push(`/insights/${insights[0].id}`)} />
        </motion.div>
      )}

      {/* Список статей */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="px-6 pb-12 space-y-3"
      >
        {insights.slice(1).map((insight) => (
          <motion.div key={insight.id} variants={staggerItem}>
            <ArticleCard
              insight={insight}
              onClick={() => router.push(`/insights/${insight.id}`)}
            />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}

function FeaturedCard({ insight, onClick }: { insight: Insight; onClick: () => void }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      className="cursor-pointer rounded-2xl border border-stone-100 bg-white p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <span className="font-sans text-xs uppercase tracking-widest text-gold-500">
          {CATEGORY_LABELS[insight.category] || 'Откровение'}
        </span>
        <span className="font-sans text-xs text-stone-400">{insight.readTime} мин чтения</span>
      </div>
      <div>
        <h2 className="font-serif text-2xl font-light leading-snug text-stone-800 mb-2">
          {insight.title}
        </h2>
        <p className="font-sans text-sm leading-relaxed text-stone-500">{insight.preview}</p>
      </div>
      <div className="flex items-center gap-1.5 text-gold-500">
        <span className="font-sans text-xs font-medium">Читать статью</span>
        <span className="text-sm">→</span>
      </div>
    </motion.div>
  )
}

function ArticleCard({ insight, onClick }: { insight: Insight; onClick: () => void }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.99 }}
      className="cursor-pointer flex items-start gap-4 rounded-xl border border-stone-100 bg-white px-4 py-4"
    >
      <div className="flex-shrink-0 w-8 pt-0.5">
        <span className="font-sans text-xs uppercase tracking-widest text-stone-300">
          {CATEGORY_LABELS[insight.category]?.slice(0, 2) || '—'}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-serif text-base font-medium text-stone-800 leading-snug mb-1">
          {insight.title}
        </h3>
        <p className="font-sans text-xs leading-relaxed text-stone-500 line-clamp-2">
          {insight.preview}
        </p>
      </div>
      <div className="flex-shrink-0 flex flex-col items-end gap-1 pt-0.5">
        <span className="font-sans text-xs text-stone-300">{insight.readTime}м</span>
        <span className="text-stone-300 text-sm">→</span>
      </div>
    </motion.div>
  )
}
