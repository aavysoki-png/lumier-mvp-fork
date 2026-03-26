import { prisma } from '@/shared/lib/prisma'
import { InvalidStateError, NotFoundError } from '@/server/errors'
import {
  isValidSessionTransition,
  toSessionEntity,
  type CreateSessionInput,
  type SessionStatus,
  type SessionType,
} from './index'

export async function createSession(input: CreateSessionInput) {
  const session = await prisma.session.create({
    data: {
      userId: input.userId,
      readerId: input.readerId,
      type: input.type,
      status: 'PENDING',
    },
  })
  return toSessionEntity(session)
}

export async function getSession(sessionId: string) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      reader: true,
      user: true,
      order: true,
      asyncReading: true,
      messages: { orderBy: { createdAt: 'asc' } },
    },
  })
  if (!session) throw new NotFoundError('Session', sessionId)
  return session
}

export async function activateSession(sessionId: string) {
  return _transition(sessionId, 'ACTIVE')
}

export async function completeSession(sessionId: string) {
  return _transition(sessionId, 'COMPLETED')
}

export async function cancelSession(sessionId: string) {
  return _transition(sessionId, 'CANCELLED')
}

export async function updateSessionType(sessionId: string, type: SessionType) {
  const session = await prisma.session.findUnique({ where: { id: sessionId } })
  if (!session) throw new NotFoundError('Session', sessionId)
  const updated = await prisma.session.update({
    where: { id: sessionId },
    data: { type },
  })
  return toSessionEntity(updated)
}

// ─── Internal ────────────────────────────────────────────────────────────────

async function _transition(sessionId: string, to: SessionStatus) {
  const session = await prisma.session.findUnique({ where: { id: sessionId } })
  if (!session) throw new NotFoundError('Session', sessionId)

  const from = session.status as SessionStatus
  if (!isValidSessionTransition(from, to)) {
    throw new InvalidStateError(
      `Session cannot transition from ${from} to ${to}`
    )
  }

  const updated = await prisma.session.update({
    where: { id: sessionId },
    data: { status: to },
  })
  return toSessionEntity(updated)
}
