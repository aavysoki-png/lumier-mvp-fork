'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ivory-50 px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <p className="font-serif text-4xl font-light text-stone-300">✦</p>
        <h1 className="font-serif text-2xl font-light text-stone-700">Что-то пошло не так</h1>
        <p className="font-sans text-sm text-stone-400 max-w-xs mx-auto">
          Произошла непредвиденная ошибка. Пожалуйста, попробуйте ещё раз.
        </p>
        <button
          onClick={reset}
          className="inline-block mt-4 rounded-xl bg-stone-800 px-6 py-3 font-sans text-sm text-white hover:bg-stone-900 transition-colors"
        >
          Попробовать снова
        </button>
      </motion.div>
    </div>
  )
}
