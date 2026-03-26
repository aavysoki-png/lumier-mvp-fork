// ─── Session State Machine ───────────────────────────────────────────────────

export const SESSION_STATUS = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const

export type SessionStatus = (typeof SESSION_STATUS)[keyof typeof SESSION_STATUS]

export const SESSION_TYPE = {
  LIVE: 'LIVE',
  ASYNC: 'ASYNC',
} as const

export type SessionType = (typeof SESSION_TYPE)[keyof typeof SESSION_TYPE]

// Valid transitions: from → allowed targets
export const SESSION_TRANSITIONS: Record<SessionStatus, SessionStatus[]> = {
  PENDING:   ['ACTIVE', 'CANCELLED'],
  ACTIVE:    ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
}

export function isValidSessionTransition(
  from: SessionStatus,
  to: SessionStatus
): boolean {
  return SESSION_TRANSITIONS[from].includes(to)
}

// ─── Domain Types ─────────────────────────────────────────────────────────────

export interface SessionEntity {
  id: string
  userId: string
  readerId: string
  type: SessionType
  status: SessionStatus
  createdAt: Date
}

export interface CreateSessionInput {
  userId: string
  readerId: string
  type: SessionType
}

export interface UpdateSessionTypeInput {
  sessionId: string
  type: SessionType
}
