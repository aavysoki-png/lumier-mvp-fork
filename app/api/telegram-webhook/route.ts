import { NextResponse } from 'next/server'
import { prisma } from '@/shared/lib/prisma'
import { sendTelegramMessage } from '@/shared/lib/telegram'
import { randomBytes } from 'crypto'

// ─── Webhook secret verification ──────────────────────────────────────────────

function verifyWebhook(req: Request): boolean {
  const secret = req.headers.get('x-telegram-bot-api-secret-token')
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET
  if (!expected) return true // If not configured, allow (backwards compat)
  return secret === expected
}

// ─── POST handler ─────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  if (!verifyWebhook(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const update = await req.json()
    const message = update?.message
    if (!message?.text || !message?.chat?.id) {
      return NextResponse.json({ ok: true })
    }

    const chatId = String(message.chat.id)
    const text = message.text.trim()

    // ─── /start command: link Telegram via secure token ───────
    if (text.startsWith('/start')) {
      const parts = text.split(' ')
      const linkToken = parts[1]

      if (!linkToken) {
        await sendTelegramMessage(chatId,
          '👋 Добро пожаловать в Lumier!\n\n' +
          'Чтобы подключить аккаунт, перейдите в кабинет консультанта и нажмите «Подключить Telegram».'
        )
        return NextResponse.json({ ok: true })
      }

      // Find reader by secure linking token (not userId)
      const reader = await prisma.tarotReader.findFirst({
        where: { telegramLinkToken: linkToken },
      })

      if (!reader) {
        await sendTelegramMessage(chatId, '❌ Ссылка недействительна или истекла. Запросите новую в кабинете.')
        return NextResponse.json({ ok: true })
      }

      // Check token expiry (10 minutes)
      if (reader.telegramLinkExpiry && reader.telegramLinkExpiry < new Date()) {
        await sendTelegramMessage(chatId, '❌ Ссылка истекла. Запросите новую в кабинете консультанта.')
        return NextResponse.json({ ok: true })
      }

      await prisma.tarotReader.update({
        where: { id: reader.id },
        data: {
          telegramChatId: chatId,
          telegramLinkToken: null,    // Invalidate token after use
          telegramLinkExpiry: null,
        },
      })

      await sendTelegramMessage(chatId,
        `✅ Telegram подключён!\n\n` +
        `Вы будете получать сообщения от клиентов. Отвечайте — клиент увидит в приложении.\n\n` +
        `Профиль: ${reader.name}`
      )
      return NextResponse.json({ ok: true })
    }

    // ─── Regular message: reader replying to a client ─────────
    const reader = await prisma.tarotReader.findFirst({
      where: { telegramChatId: chatId },
      include: { sessions: { where: { status: 'ACTIVE' }, orderBy: { updatedAt: 'desc' }, take: 1 } },
    })

    if (!reader) {
      await sendTelegramMessage(chatId, '⚠️ Telegram не привязан. Подключите его в кабинете.')
      return NextResponse.json({ ok: true })
    }

    const activeSession = reader.sessions[0]
    if (!activeSession) {
      await sendTelegramMessage(chatId, 'ℹ️ Нет активных сессий.')
      return NextResponse.json({ ok: true })
    }

    await prisma.message.create({
      data: { sessionId: activeSession.id, senderType: 'READER', content: text },
    })

    await sendTelegramMessage(chatId, '✓ Доставлено')
    return NextResponse.json({ ok: true })

  } catch (err) {
    console.error('Telegram webhook error:', err)
    return NextResponse.json({ ok: true })
  }
}
