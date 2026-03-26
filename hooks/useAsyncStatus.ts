'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { getAsyncStatus } from '@/server/actions'

export type ReadingStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'

export interface AsyncReading {
  id: string
  sessionId: string
  status: ReadingStatus
  resultText: string | null
  createdAt: Date | string
  completedAt: Date | string | null
}

export function useAsyncStatus(sessionId: string | null, pollInterval = 3000) {
  const [reading, setReading] = useState<AsyncReading | null>(null)
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetch = useCallback(async () => {
    if (!sessionId) return
    try {
      const r = await getAsyncStatus(sessionId)
      setReading(r as AsyncReading | null)
      if (r?.status === 'COMPLETED' && intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    } catch {}
    finally { setLoading(false) }
  }, [sessionId])

  useEffect(() => {
    if (!sessionId) return
    fetch()
    intervalRef.current = setInterval(fetch, pollInterval)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [sessionId, pollInterval, fetch])

  return {
    reading,
    loading,
    status: reading?.status ?? null,
    isComplete: reading?.status === 'COMPLETED',
    resultText: reading?.resultText ?? null,
  }
}
