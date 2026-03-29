import { NextResponse } from 'next/server'
import { prisma } from '@/shared/lib/prisma'
import { sendTelegramMessage } from '@/shared/lib/telegram'

// Telegram sends updates here when reader sends a message to the bot

export async function POST(req: Request) {
  try {
    const update = await req.json()
    const message = update?.message
    if (!message?.text || !message?.chat?.id) {
      return NextResponse.json({ ok: true })
    }

    const chatId = String(message.chat.id)
    const text = message.text.trim()

    // ─── /start command: link Telegram to reader account ──────────
    if (text.startsWith('/start')) {
      const parts = text.split(' ')
      const linkToken = parts[1] // /start <userId>

      if (!linkToken) {
        await sendTelegramMessage(chatId,
          '👋 Добро пожаловать в Lumier!\n\n' +
          'Чтобы подключить аккаунт, перейдите в кабинет консультанта на сайте и нажмите «Подключить Telegram».'
        )
        return NextResponse.json({ ok: true })
      }

      // Link Telegram chat to reader profile
      const reader = await prisma.tarotReader.findFirst({
        where: { userId: linkToken },
      })

      if (!reader) {
        await sendTelegramMessage(chatId, '❌ Аккаунт консультанта не найден.')
        return NextResponse.json({ ok: true })
      }

      await prisma.tarotReader.update({
        where: { id: reader.id },
        data: { telegramChatId: chatId },
      })

      await sendTelegramMessage(chatId,
        `✅ Telegram подключён!\n\nВы будете получать сообщения от клиентов прямо сюда. Отвечайте — и клиент увидит ваш ответ в приложении.\n\nВаш профиль: ${reader.name}`
      )
      return NextResponse.json({ ok: true })
    }

    // ─── Regular message: reader replying to a client ─────────────
    const reader = await prisma.tarotReader.findFirst({
      where: { telegramChatId: chatId },
      include: { sessions: { where: { status: 'ACTIVE' }, orderBy: { updatedAt: 'desc' }, take: 1 } },
    })

    if (!reader) {
      await sendTelegramMessage(chatId,
        '⚠️ Ваш Telegram не привязан к аккаунту консультанта. Подключите его в кабинете на сайте.'
      )
      return NextResponse.json({ ok: true })
    }

    const activeSession = reader.sessions[0]
    if (!activeSession) {
      await sendTelegramMessage(chatId,
        'ℹ️ Нет активных сессий. Сообщение не доставлено.'
      )
      return NextResponse.json({ ok: true })
    }

    // Save message to DB
    await prisma.message.create({
      data: {
        sessionId: activeSession.id,
        senderType: 'READER',
        content: text,
      },
    })

    await sendTelegramMessage(chatId, '✓ Сообщение доставлено клиенту')
    return NextResponse.json({ ok: true })

  } catch (err) {
    console.error('Telegram webhook error:', err)
    return NextResponse.json({ ok: true }) // always return 200 to Telegram
  }
}
