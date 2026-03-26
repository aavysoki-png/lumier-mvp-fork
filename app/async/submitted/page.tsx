'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAppStore } from '@/shared/lib/store'
import { Button } from '@/shared/ui/Button'
import { pageTransition, staggerContainer, staggerItem } from '@/shared/animations/variants'
import Link from 'next/link'

export default function AsyncSubmittedPage() {
  const router = useRouter()
  const { reader } = useAppStore()
  const [step, setStep] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 600)
    const t2 = setTimeout(() => setStep(2), 1400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const steps = [
    { label: 'Request received', done: step >= 0 },
    { label: 'Reading in progress', done: step >= 1 },
    { label: 'Response delivered', done: step >= 3 },
  ]

  return (
    <motion.div variants={pageTransition} initial="hidden" animate="visible"
      className="flex min-h-screen flex-col bg-ivory-50">
      <div className="flex flex-1 flex-col items-center justify-center px-5 text-center">

        {/* Icon */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }}
          className="mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-gold-300/60 bg-gold-300/10">
          <motion.span
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
            className="text-3xl text-gold-500">✦</motion.span>
        </motion.div>

        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3 mb-10">
          <motion.h2 variants={staggerItem}
            className="font-serif text-3xl font-light text-stone-800">
            Your reading is underway
          </motion.h2>
          <motion.p variants={staggerItem}
            className="font-sans text-sm leading-relaxed text-stone-500 max-w-xs mx-auto">
            {reader.name?.split(' ')[0]} has received your question and will begin their reading shortly. You'll receive the full response within 24 hours.
          </motion.p>
        </motion.div>

        {/* Progress */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-xs space-y-3 mb-10">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <motion.div
                animate={{
                  backgroundColor: s.done ? '#C9A35A' : '#E7E5E4',
                  scale: s.done ? 1 : 0.95,
                }}
                transition={{ duration: 0.4, delay: i * 0.15 }}
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs text-white font-medium">
                {s.done ? '✓' : i + 1}
              </motion.div>
              <motion.p
                animate={{ color: s.done ? '#44403c' : '#a8a29e' }}
                transition={{ duration: 0.4, delay: i * 0.15 }}
                className="font-sans text-sm">
                {s.label}
              </motion.p>
            </div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="w-full max-w-xs space-y-3">
          <Button onClick={() => router.push('/async/status')} fullWidth size="lg">
            Track my reading
          </Button>
          <Link href="/insights"
            className="block text-center font-sans text-sm text-stone-400 hover:text-stone-600 transition-colors">
            Browse insights while you wait
          </Link>
        </motion.div>
      </div>
    </motion.div>
  )
}
