import { prisma } from '@/shared/lib/prisma'
import { NotFoundError } from '@/server/errors'
import type { SendMessageInput } from './types'

// Rotating reader responses for demo mode
const READER_RESPONSES = [
  "I'm drawing a card in response to what you've shared. Give me a moment.",
  "The cards are showing me something interesting here. What you're describing resonates with the Five of Cups — a card about sitting with what has been lost before you can see what remains.",
  "This is significant. I want to ask you something: when you imagine the version of yourself who has made this decision, what does their life feel like?",
  "The Tower has appeared. Before you respond — this is not a card of catastrophe, though it can feel that way. It is a card of revelation. Something concealing itself is about to become clear.",
  "Take your time with this. What you're processing is real and it deserves space.",
  "The Hermit suggests you already know more than you think. What would you do if there were no one left to convince?",
  "I see the Two of Swords here — a deliberate blindness. Not from weakness, but from the fear that seeing clearly will force a choice you're not ready to make. Are you ready now?",
]

export async function sendMessage(input: SendMessageInput) {
  const message = await prisma.message.create({ data: input })

  // Auto-generate reader response when user sends
  if (input.senderType === 'USER') {
    await _scheduleReaderResponse(input.sessionId)
  }

  return message
}

export async function getMessages(sessionId: string) {
  return prisma.message.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' },
  })
}

export async function sendReaderGreeting(sessionId: string, readerName: string) {
  const existing = await prisma.message.findFirst({
    where: { sessionId, senderType: 'READER' },
  })
  if (existing) return existing // idempotent

  return prisma.message.create({
    data: {
      sessionId,
      senderType: 'READER',
      content: `Welcome. I'm ${readerName}. I've taken a moment to hold your question. When you're ready, share whatever feels right.`,
    },
  })
}

// ─── Internal ────────────────────────────────────────────────────────────────

async function _scheduleReaderResponse(sessionId: string) {
  const response =
    READER_RESPONSES[Math.floor(Math.random() * READER_RESPONSES.length)]

  await prisma.message.create({
    data: {
      sessionId,
      senderType: 'READER',
      content: response,
      // Small offset so it sorts after the user message
      createdAt: new Date(Date.now() + 1200),
    },
  })
}
