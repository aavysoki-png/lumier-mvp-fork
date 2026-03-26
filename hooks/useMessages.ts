'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { getMessages } from '@/server/actions'

export interface Message {
  id: string
  senderType: 'USER' | 'READER'
  content: string
  createdAt: Date | string
}

export function useMessages(sessionId: string | null, pollInterval = 2500) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetch = useCallback(async () => {
    if (!sessionId) return
    try {
      const msgs = await getMessages(sessionId)
      setMessages(msgs as Message[])
      setError(null)
    } catch {
      setError('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    if (!sessionId) return
    fetch()
    intervalRef.current = setInterval(fetch, pollInterval)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [sessionId, pollInterval, fetch])

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [])

  return { messages, loading, error, refetch: fetch, stop }
}
