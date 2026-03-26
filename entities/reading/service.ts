import { prisma } from '@/shared/lib/prisma'
import { InvalidStateError, NotFoundError } from '@/server/errors'
import type { CompleteReadingInput, ReadingStatus } from './types'
import { isValidReadingTransition } from './types'

export async function createRequest(sessionId: string) {
  // Idempotent — return existing if already created
  const existing = await prisma.asyncReading.findUnique({ where: { sessionId } })
  if (existing) return existing

  return prisma.asyncReading.create({
    data: { sessionId, status: 'PENDING' },
  })
}

export async function markInProgress(readingId: string) {
  return _transition(readingId, 'IN_PROGRESS')
}

export async function markReady(input: CompleteReadingInput) {
  const reading = await prisma.asyncReading.findUnique({
    where: { id: input.readingId },
  })
  if (!reading) throw new NotFoundError('AsyncReading', input.readingId)

  const from = reading.status as ReadingStatus
  if (!isValidReadingTransition(from, 'COMPLETED')) {
    throw new InvalidStateError(
      `Reading cannot transition from ${from} to COMPLETED`
    )
  }

  return prisma.asyncReading.update({
    where: { id: input.readingId },
    data: {
      status: 'COMPLETED',
      resultText: input.resultText,
      completedAt: new Date(),
    },
  })
}

export async function getBySessionId(sessionId: string) {
  return prisma.asyncReading.findUnique({ where: { sessionId } })
}

export async function getById(id: string) {
  const reading = await prisma.asyncReading.findUnique({ where: { id } })
  if (!reading) throw new NotFoundError('AsyncReading', id)
  return reading
}

// ─── Internal ────────────────────────────────────────────────────────────────

async function _transition(readingId: string, to: ReadingStatus) {
  const reading = await prisma.asyncReading.findUnique({ where: { id: readingId } })
  if (!reading) throw new NotFoundError('AsyncReading', readingId)

  const from = reading.status as ReadingStatus
  if (!isValidReadingTransition(from, to)) {
    throw new InvalidStateError(
      `Reading cannot transition from ${from} to ${to}`
    )
  }

  return prisma.asyncReading.update({
    where: { id: readingId },
    data: { status: to },
  })
}
