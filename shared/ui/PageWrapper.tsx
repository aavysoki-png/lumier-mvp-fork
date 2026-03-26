'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { pageTransition } from '@/shared/animations/variants'

interface PageWrapperProps {
  children: ReactNode
  className?: string
}

export function PageWrapper({ children, className = '' }: PageWrapperProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={pageTransition}
      className={`min-h-screen bg-ivory-50 ${className}`}
    >
      {children}
    </motion.div>
  )
}

export function PageContainer({ children, className = '' }: PageWrapperProps) {
  return (
    <div className={`mx-auto max-w-lg px-6 ${className}`}>
      {children}
    </div>
  )
}
