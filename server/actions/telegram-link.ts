'use server'

import { prisma } from '@/shared/lib/prisma'
import { getServerSession } from '@/shared/lib/auth'
import { randomBytes } from 'crypto'

export async function generateTelegramLinkToken() {
  const session = await getServerSession()
  if (!session) return { error: 'Необходима авторизация' }

  const reader = await prisma.tarotReader.findUnique({ where: { userId: session.id } })
  if (!reader) return { error: 'Профиль консультанта не найден' }

  const token = randomBytes(24).toString('hex')
  const expiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  await prisma.tarotReader.update({
    where: { id: reader.id },
    data: { telegramLinkToken: token, telegramLinkExpiry: expiry },
  })

  const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'lumier_consult_bot'
  return { url: `https://t.me/${botUsername}?start=${token}` }
}
