import type { SessionEntity, SessionStatus, SessionType } from './types'

// Shape raw DB row into a clean domain object
export function toSessionEntity(raw: {
  id: string
  userId: string
  readerId: string
  type: string
  status: string
  createdAt: Date
}): SessionEntity {
  return {
    id: raw.id,
    userId: raw.userId,
    readerId: raw.readerId,
    type: raw.type as SessionType,
    status: raw.status as SessionStatus,
    createdAt: raw.createdAt,
  }
}

// Session display helpers
export function isSessionActive(session: SessionEntity): boolean {
  return session.status === 'ACTIVE'
}

export function isSessionComplete(session: SessionEntity): boolean {
  return session.status === 'COMPLETED'
}

export function isLiveSession(session: SessionEntity): boolean {
  return session.type === 'LIVE'
}
