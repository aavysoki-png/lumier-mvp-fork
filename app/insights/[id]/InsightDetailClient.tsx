'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { pageTransition, staggerContainer, staggerItem } from '@/shared/animations/variants'

interface Insight {
  id: string
  title: string
  preview: string
  content: string
  category: string
  readTime: number
  createdAt: Date | string
}

function renderContent(text: string) {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
      return (
        <h2 key={i} className="font-serif text-2xl font-light text-stone-800 mt-8 mb-3">
          {line.slice(2, -2)}
        </h2>
      )
    }
    const boldLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    if (boldLine !== line) {
      return (
        <p
          key={i}
          className="font-sans text-base leading-[1.8] text-stone-600 mb-4"
          dangerouslySetInnerHTML={{ __html: boldLine }}
        />
      )
    }
    if (line === '') return <div key={i} className="h-2" />
    return (
      <p key={i} className="font-sans text-base leading-[1.8] text-stone-600 mb-4">
        {line}
      </p>
    )
  })
}

const CATEGORY_LABELS: Record<string, string> = {
  practice: 'Практика',
  guide:    'Руководство',
  insight:  'Откровение',
  general:  'Общее',
}

export function InsightDetailClient({ insight }: { insight: Insight }) {
  const router = useRouter()

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-ivory-50"
    >
      {/* Навигация */}
      <div className="sticky top-0 z-10 border-b border-stone-100 bg-ivory-50/95 backdrop-blur-sm px-6 py-4">
        <div className="mx-auto max-w-lg flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="font-sans text-xs uppercase tracking-widest text-stone-400 hover:text-stone-600 transition-colors"
          >
            ← Статьи
          </button>
          <p className="font-serif text-sm text-stone-500">{insight.readTime} мин чтения</p>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-6">
        {/* Заголовок статьи */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="pt-10 pb-8 space-y-4"
        >
          <motion.div variants={staggerItem} className="flex items-center gap-3">
            <span className="font-sans text-xs uppercase tracking-widest text-gold-500">
              {CATEGORY_LABELS[insight.category] || 'Откровение'}
            </span>
            <span className="text-stone-200">·</span>
            <span className="font-sans text-xs text-stone-400">
              {new Date(insight.createdAt).toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
              })}
            </span>
          </motion.div>

          <motion.h1
            variants={staggerItem}
            className="font-serif text-4xl font-light leading-tight text-stone-800"
          >
            {insight.title}
          </motion.h1>

          <motion.p
            variants={staggerItem}
            className="font-sans text-base leading-relaxed text-stone-500"
          >
            {insight.preview}
          </motion.p>

          <motion.div variants={staggerItem}>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-stone-100" />
              <span className="text-gold-300 text-sm">✦</span>
              <div className="flex-1 h-px bg-stone-100" />
            </div>
          </motion.div>
        </motion.div>

        {/* Тело статьи */}
        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="pb-16"
        >
          {renderContent(insight.content)}

          <div className="flex items-center gap-3 mt-10">
            <div className="flex-1 h-px bg-stone-100" />
            <span className="text-gold-300 text-sm">✦</span>
            <div className="flex-1 h-px bg-stone-100" />
          </div>

          {/* Призыв к действию */}
          <div className="mt-10 rounded-2xl border border-stone-100 bg-white p-6 text-center space-y-3">
            <p className="font-serif text-xl font-light text-stone-700">
              Готовы исследовать глубже?
            </p>
            <p className="font-sans text-sm text-stone-400">
              Личный расклад помещает эти идеи в контекст вашей собственной ситуации.
            </p>
            <button
              onClick={() => router.push('/question')}
              className="inline-flex items-center gap-2 rounded-xl bg-stone-800 px-6 py-3 font-sans text-sm text-white transition-colors hover:bg-stone-900"
            >
              Начать расклад
            </button>
          </div>
        </motion.article>
      </div>
    </motion.div>
  )
}
