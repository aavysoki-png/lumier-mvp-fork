import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { drawCards, SPREAD_LABELS, type DrawnCard, type TarotReading } from '@/entities/tarot'
import { prisma } from '@/shared/lib/prisma'
import { getServerSession } from '@/shared/lib/auth'

// ─── AI System Prompt ─────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Ты — Lumier, профессиональный таролог-практик с глубоким знанием мировых школ таро: Rider-Waite-Smith, Марсельского таро, Тота Кроули и юнгианского символизма.

МЕТОД ТРАКТОВКИ:
- Каждую карту трактуй по классическим значениям с учётом позиции в раскладе
- Прямое положение: традиционное значение карты (Waite, Кроули)
- Перевёрнутое: заблокированная, подавленная или чрезмерная энергия карты — не «плохое», а то, что требует внимания
- ВСЕГДА привязывай трактовку к конкретному вопросу клиента — не абстрактно, а применительно к его ситуации
- Обрати внимание на масть: Жезлы — действия и амбиции, Кубки — чувства и отношения, Мечи — мышление и конфликты, Пентакли — материальное и здоровье
- Старшие арканы — ключевые жизненные темы, придавай им больше веса
- Ищи связи между картами: повторы мастей, числовые закономерности, сюжетные арки

СТИЛЬ:
- Пиши ТОЛЬКО на русском, называй карты по-русски
- Не используй англоязычные термины (summary, insight и т.д.)
- Будь конкретным и прикладным: не «вас ждут перемены», а ЧТО именно и КАК это связано с вопросом
- Максимум 2–3 коротких абзаца в интерпретации
- Читай расклад как единую историю
- Учитывай пол человека (если указан)
- Никаких гарантий, страхов и банальных общих фраз

6 ПОЗИЦИЙ:
1. Прошлое — что привело к текущей ситуации
2. Настоящее — что происходит сейчас
3. Будущее — куда направлена энергия
4. Внутренний мир — что человек чувствует, но может не осознавать
5. Внешний мир — люди, обстоятельства, внешние факторы
6. Совет — конкретное действие или направление

Верни ТОЛЬКО валидный JSON без markdown, без тройных кавычек:
{
  "summary": "1 предложение — суть расклада, привязанная к вопросу",
  "interpretation": "2–3 абзаца. Конкретная история карт в контексте вопроса клиента. Что происходит, почему, и к чему ведёт.",
  "cards": [
    {"position": "Позиция", "name": "Название карты по-русски", "insight": "1–2 предложения: что эта карта говорит конкретно про ситуацию клиента"}
  ],
  "advice": "1–2 предложения: конкретный практический совет, привязанный к вопросу."
}`

// ─── Build user prompt ────────────────────────────────────────────────────────

function buildPrompt(question: string, category: string, gender: string, cards: DrawnCard[]): string {
  const genderLabel =
    gender === 'male' ? 'мужчина' :
    gender === 'female' ? 'женщина' : 'не указан'

  const cardList = cards.map((c, i) => {
    const pos = SPREAD_LABELS[c.position]
    const state = c.isReversed ? '(перевёрнута)' : '(прямая)'
    return `${i + 1}. ${pos.ru}: ${c.nameRu} ${state}`
  }).join('\n')

  return `Пол: ${genderLabel}
Тема: ${category}
Вопрос: «${question}»

Карты:
${cardList}`
}

// Increase serverless function timeout
export const maxDuration = 30

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const { question, category, gender } = await req.json()

    if (!question || typeof question !== 'string' || question.trim().length < 3) {
      return NextResponse.json(
        { error: 'Пожалуйста, задайте вопрос (минимум 3 символа).' },
        { status: 400 },
      )
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI-сервис не настроен.' },
        { status: 500 },
      )
    }

    // ── Check free readings / balance (atomic) ────────────────────
    const READING_PRICE = 30 // рублей
    const session = await getServerSession().catch(() => null)

    if (session?.id) {
      try {
        await prisma.$transaction(async (tx) => {
          const user = await tx.user.findUniqueOrThrow({
            where: { id: session.id },
            select: { freeReadings: true, balance: true },
          })

          if (user.freeReadings > 0) {
            await tx.user.update({
              where: { id: session.id },
              data: { freeReadings: { decrement: 1 } },
            })
          } else if (user.balance >= READING_PRICE) {
            await tx.user.update({
              where: { id: session.id, balance: { gte: READING_PRICE } },
              data: { balance: { decrement: READING_PRICE } },
            })
            await tx.walletTransaction.create({
              data: { userId: session.id, amount: -READING_PRICE, type: 'reading', note: 'AI-расклад Таро' },
            })
          } else {
            throw new Error('INSUFFICIENT_BALANCE')
          }
        })
      } catch (err: unknown) {
        if (err instanceof Error && err.message === 'INSUFFICIENT_BALANCE') {
          return NextResponse.json(
            { error: 'insufficient_balance', message: `Недостаточно средств. Стоимость расклада — ${READING_PRICE} ₽. Пополните баланс.` },
            { status: 402 },
          )
        }
        throw err // re-throw unexpected errors
      }
    }

    const drawnCards = drawCards(6)

    const anthropic = new Anthropic({ apiKey })
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1200,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: buildPrompt(question.trim(), category || 'общее', gender || 'unspecified', drawnCards),
      }],
    })

    const textBlock = message.content.find(b => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('Пустой ответ от AI')
    }

    // Strip markdown fences if present
    let raw = textBlock.text.trim()
    if (raw.startsWith('```')) {
      raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim()
    }

    let reading: TarotReading
    try {
      reading = JSON.parse(raw)
    } catch {
      reading = {
        summary: '',
        interpretation: raw,
        cards: drawnCards.map(c => ({
          position: SPREAD_LABELS[c.position].ru,
          name: c.nameRu,
          insight: '',
        })),
        advice: '',
      }
    }

    // Save for authenticated users (fire-and-forget)
    if (session?.id) {
      prisma.tarotReadingRecord.create({
        data: {
          userId:         session.id,
          question:       question.trim(),
          category:       category || 'general',
          cardsJson:      JSON.stringify(drawnCards),
          summary:        reading.summary || '',
          interpretation: reading.interpretation || '',
          cardsInsight:   JSON.stringify(reading.cards || []),
          advice:         reading.advice || '',
        },
      }).catch(() => {}) // don't fail the response if save fails
    }

    return NextResponse.json({ drawnCards, reading })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Tarot reading error:', message)
    return NextResponse.json(
      { error: `Ошибка: ${message}` },
      { status: 500 },
    )
  }
}
