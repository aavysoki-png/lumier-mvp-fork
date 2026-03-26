// Barrel re-export of all entity types
// Use per-entity imports for specifics; this file provides a single
// convenient entry point for cross-entity type references.

export type { SessionEntity, SessionStatus, SessionType } from './session/types'
export type { OrderEntity, OrderStatus } from './order/types'
export type { ReadingEntity, ReadingStatus } from './reading/types'
export type { MessageEntity, SenderType } from './message/types'

// Shared reader/user types (no dedicated service needed for MVP)

export type ReaderTier = 'FOUNDATION' | 'SENIOR' | 'MASTER'

export interface ReaderEntity {
  id: string
  name: string
  specialization: string
  tier: ReaderTier
  price: number
  rating: number
  bio: string
  imageUrl?: string | null
}

export interface UserEntity {
  id: string
  name: string
  dateOfBirth: Date
  createdAt: Date
}

export interface InsightArticle {
  id: string
  title: string
  preview: string
  content: string
  category: string
  readTime: number
  createdAt: Date
}
