export const READING_STATUS = {
  PENDING:     'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED:   'COMPLETED',
} as const

export type ReadingStatus = (typeof READING_STATUS)[keyof typeof READING_STATUS]

export const READING_TRANSITIONS: Record<ReadingStatus, ReadingStatus[]> = {
  PENDING:     ['IN_PROGRESS'],
  IN_PROGRESS: ['COMPLETED'],
  COMPLETED:   [],
}

export function isValidReadingTransition(
  from: ReadingStatus,
  to: ReadingStatus
): boolean {
  return READING_TRANSITIONS[from].includes(to)
}

export interface ReadingEntity {
  id: string
  sessionId: string
  status: ReadingStatus
  resultText: string | null
  createdAt: Date
  completedAt: Date | null
}

export interface CreateReadingInput {
  sessionId: string
}

export interface CompleteReadingInput {
  readingId: string
  resultText: string
}
