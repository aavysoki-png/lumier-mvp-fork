'use server'

import { prisma } from '@/shared/lib/prisma'
import { sessionService } from '@/entities/session'
import { orderService } from '@/entities/order'
import { readingService } from '@/entities/reading'
import { messageService } from '@/entities/message'
import {
  CreateUserDTO,
  CreateQuestionDTO,
  CreateSessionDTO,
  CreateOrderDTO,
  SendMessageDTO,
  UpdateSessionTypeDTO,
} from '@/server/dto'

// ─── User ─────────────────────────────────────────────────────────────────────

export async function createUser(data: { name: string; dateOfBirth: string }) {
  const input = CreateUserDTO.parse(data)
  const user = await prisma.user.create({
    data: { name: input.name, dateOfBirth: new Date(input.dateOfBirth) },
  })
  return { success: true as const, user }
}

export async function getUser(userId: string) {
  return prisma.user.findUnique({ where: { id: userId } })
}

// ─── Question ─────────────────────────────────────────────────────────────────

export async function createQuestion(data: {
  userId: string; text: string; category: string
}) {
  const input = CreateQuestionDTO.parse(data)
  const question = await prisma.question.create({ data: input })
  return { success: true as const, question }
}

// ─── Readers ──────────────────────────────────────────────────────────────────

export async function getReaders() {
  return prisma.tarotReader.findMany({
    orderBy: [{ tier: 'asc' }, { rating: 'desc' }],
  })
}

export async function getReaderById(id: string) {
  return prisma.tarotReader.findUnique({ where: { id } })
}

// ─── Session ──────────────────────────────────────────────────────────────────

export async function createSession(data: {
  userId: string; readerId: string; type: 'LIVE' | 'ASYNC'
}) {
  const input = CreateSessionDTO.parse(data)
  const session = await sessionService.createSession(input)
  return { success: true as const, session }
}

export async function updateSessionType(sessionId: string, type: 'LIVE' | 'ASYNC') {
  const session = await sessionService.updateSessionType(sessionId, type)
  return { success: true as const, session }
}

export async function activateSession(sessionId: string) {
  const session = await sessionService.activateSession(sessionId)
  return { success: true as const, session }
}

export async function getSession(sessionId: string) {
  return sessionService.getSession(sessionId)
}

// ─── Order ────────────────────────────────────────────────────────────────────

export async function createOrder(data: {
  userId: string; sessionId: string; amount: number
}) {
  const input = CreateOrderDTO.parse(data)
  const order = await orderService.createOrder(input)
  return { success: true as const, order }
}

export async function confirmPayment(orderId: string) {
  await orderService.markPaid(orderId)
  return { success: true as const }
}

// ─── Async Reading ────────────────────────────────────────────────────────────

export async function createAsyncReading(sessionId: string) {
  const reading = await readingService.createRequest(sessionId)
  const progressed = await readingService.markInProgress(reading.id)
  return { success: true as const, reading: progressed }
}

export async function getAsyncStatus(sessionId: string) {
  return readingService.getBySessionId(sessionId)
}

export async function completeAsyncReading(readingId: string, resultText: string) {
  const reading = await readingService.markReady({ readingId, resultText })
  return { success: true as const, reading }
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export async function sendMessage(data: {
  sessionId: string; senderType: 'USER' | 'READER'; content: string
}) {
  const input = SendMessageDTO.parse(data)
  const message = await messageService.sendMessage(input)
  return { success: true as const, message }
}

export async function getMessages(sessionId: string) {
  return messageService.getMessages(sessionId)
}

export async function sendReaderGreeting(sessionId: string, readerName: string) {
  const message = await messageService.sendReaderGreeting(sessionId, readerName)
  return { success: true as const, message }
}

// ─── Insights ─────────────────────────────────────────────────────────────────

export async function getInsights() {
  return prisma.insightArticle.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, title: true, preview: true, category: true, readTime: true, createdAt: true,
      author: { select: { name: true } },
    },
  })
}

export async function getInsightById(id: string) {
  return prisma.insightArticle.findUnique({
    where: { id },
    include: { author: { select: { name: true } } },
  })
}
