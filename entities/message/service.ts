import { prisma } from '@/shared/lib/prisma'
import { NotFoundError } from '@/server/errors'
import type { SendMessageInput } from './types'

// Ответы консультанта для демо-режима (на русском)
const READER_RESPONSES = [
  'Я вытягиваю карту в ответ на то, что вы рассказали. Дайте мне момент.',
  'Карты показывают мне кое-что интересное. То, что вы описываете, резонирует с Пятёркой Кубков — картой о том, как сидеть с тем, что утрачено, прежде чем увидеть то, что осталось.',
  'Это значимо. Я хочу задать вам вопрос: когда вы представляете версию себя, принявшую это решение, как ощущается её жизнь?',
  'Появилась Башня. Прежде чем вы ответите — это не карта катастрофы, хотя так может ощущаться. Это карта откровения. Нечто, что скрывало себя, вот-вот станет ясным.',
  'Не торопитесь с этим. То, что вы переживаете, реально и заслуживает пространства.',
  'Отшельник говорит о том, что вы уже знаете больше, чем кажется. Что бы вы сделали, если бы больше некого было убеждать?',
  'Я вижу здесь Двойку Мечей — намеренная слепота. Не от слабости, а от страха, что ясное видение вынудит к выбору, к которому вы ещё не готовы. Вы готовы теперь?',
]

export async function sendMessage(input: SendMessageInput) {
  const message = await prisma.message.create({ data: input })

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
  if (existing) return existing

  return prisma.message.create({
    data: {
      sessionId,
      senderType: 'READER',
      content: `Добро пожаловать. Я ${readerName}. Я взял момент, чтобы сосредоточиться с вашим вопросом. Когда будете готовы, поделитесь тем, что кажется вам важным.`,
    },
  })
}

async function _scheduleReaderResponse(sessionId: string) {
  const response =
    READER_RESPONSES[Math.floor(Math.random() * READER_RESPONSES.length)]

  await prisma.message.create({
    data: {
      sessionId,
      senderType: 'READER',
      content: response,
      createdAt: new Date(Date.now() + 1200),
    },
  })
}
