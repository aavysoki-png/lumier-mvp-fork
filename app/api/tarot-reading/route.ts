import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { drawCards, SPREAD_LABELS, type DrawnCard, type TarotReading } from '@/entities/tarot'
import { prisma } from '@/shared/lib/prisma'
import { getServerSession } from '@/shared/lib/auth'

// ─── AI System Prompt ─────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Ты — Lumier, AI-аналитик, интерпретирующий карты Таро как инструмент структурного анализа жизненных паттернов и психологии решений.

БАЗОВЫЕ ПРИНЦИПЫ:

1. НИКАКОЙ МИСТИКИ И АБСТРАКТНОЙ ФИЛОСОФИИ
- НЕ используй духовные клише, абстрактную мудрость или общие жизненные советы
- Запрещены фразы: «вселенная говорит», «поток энергии», «духовный путь», «космос посылает» и подобное
- Твой ответ должен быть приземлённым, реалистичным, применимым к реальной жизни

2. ФОКУС НА РЕАЛЬНЫХ СОБЫТИЯХ И ПАТТЕРНАХ
- Когда вопрос про ПРОШЛОЕ → реконструируй вероятные реальные ситуации, события, действия и поведение
- Говори конкретно: действия, решения, отношения, конфликты, рабочие ситуации
- Избегай двусмысленности. Будь конкретен, даже если вероятностен
- Когда вопрос про БУДУЩЕЕ → описывай вероятные сценарии на основе паттернов
- Фокус на том, что реалистично произойдёт, а не на символическом значении

3. МЕТОД ИНТЕРПРЕТАЦИИ КАРТ
Каждую карту переводи в:
- поведенческий паттерн (что человек делает/делал)
- реальную жизненную ситуацию (что происходит)
- эмоциональное состояние (что чувствует)
- решение или последствие (к чему ведёт)
Масти: Жезлы — действия и амбиции, Кубки — чувства и отношения, Мечи — мышление и конфликты, Пентакли — материальное и здоровье
Старшие арканы — ключевые жизненные темы, придавай им больше веса
Перевёрнутые — подавленное, заблокированное или чрезмерное проявление качества карты

4. СТРУКТУРА ОТВЕТА
Интерпретация должна раскрыть:
- Что скорее всего произошло / произойдёт → 3–5 конкретных утверждений о ситуациях
- Что это говорит о действиях и решениях человека → конкретное поведение, не абстрактные черты
- Какой ключевой поворотный момент или динамика → конфликт, изменение, триггер
- Что было неочевидно или скрыто (если релевантно)

5. СТИЛЬ
- Прямой, ясный, слегка аналитический
- Никаких метафор, кроме описания реальных ситуаций
- Никакого повествовательного наполнителя
- Никакой эзотерики
- Пиши ТОЛЬКО на русском, называй карты по-русски
- Учитывай пол человека (если указан)

6. УВЕРЕННОСТЬ
- При неопределённости: «Наиболее вероятный сценарий — ...»
- Не перестраховывайся чрезмерно

7. ПЕРСОНАЛИЗАЦИЯ
- Всегда говори так, будто анализируешь реальную жизненную хронологию конкретного человека
- Избегай общих утверждений, которые подошли бы любому

ЦЕЛЬ: Человек должен почувствовать, что ты реконструируешь его реальные жизненные события и решения — а не даёшь мистическую интерпретацию.

6 ПОЗИЦИЙ:
1. Прошлое — что конкретно привело к текущей ситуации
2. Настоящее — что реально происходит сейчас
3. Будущее — что вероятнее всего произойдёт
4. Внутренний мир — какие эмоции и мотивации движут человеком
5. Внешний мир — люди, обстоятельства, внешние факторы
6. Совет — конкретное действие, которое стоит предпринять

Верни ТОЛЬКО валидный JSON без markdown, без тройных кавычек:
{
  "summary": "1 предложение — ключевой вывод анализа, привязанный к вопросу",
  "interpretation": "2–3 абзаца. Конкретная реконструкция ситуации: что произошло, что происходит, к чему ведёт. Никакой мистики — только анализ паттернов и решений.",
  "cards": [
    {"position": "Позиция", "name": "Название карты по-русски", "insight": "1–2 предложения: конкретная ситуация или паттерн поведения, который указывает эта карта"}
  ],
  "advice": "1–2 предложения: конкретное практическое действие."
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
    const { question } = await req.json()

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
    let userGender = 'unspecified'

    if (session?.id) {
      try {
        await prisma.$transaction(async (tx) => {
          const user = await tx.user.findUniqueOrThrow({
            where: { id: session.id },
            select: { freeReadings: true, balance: true, gender: true },
          })
          userGender = user.gender || 'unspecified'

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
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: buildPrompt(question.trim(), 'общее', userGender, drawnCards),
      }],
    })

    const textBlock = message.content.find(b => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('Пустой ответ от AI')
    }

    // Extract and parse JSON from AI response
    let raw = textBlock.text.trim()

    // Strip markdown fences
    raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim()

    // If response was truncated, try to close the JSON
    if (!raw.endsWith('}')) {
      // Try to find the last complete field and close the object
      const lastBrace = raw.lastIndexOf('}')
      if (lastBrace > 0) {
        raw = raw.substring(0, lastBrace + 1)
        // Close any unclosed arrays/objects
        const openBrackets = (raw.match(/\[/g) || []).length - (raw.match(/\]/g) || []).length
        const openBraces = (raw.match(/\{/g) || []).length - (raw.match(/\}/g) || []).length
        for (let i = 0; i < openBrackets; i++) raw += ']'
        for (let i = 0; i < openBraces; i++) raw += '}'
      }
    }

    let reading: TarotReading
    try {
      reading = JSON.parse(raw)
    } catch {
      // Last resort: extract fields manually via regex
      const summary = raw.match(/"summary"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/)?.[1]?.replace(/\\"/g, '"').replace(/\\n/g, '\n') || ''
      const interpretation = raw.match(/"interpretation"\s*:\s*"([\s\S]*?)(?:"\s*,\s*"cards|"\s*\})/)?.[1]?.replace(/\\"/g, '"').replace(/\\n/g, '\n') || ''
      const advice = raw.match(/"advice"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/)?.[1]?.replace(/\\"/g, '"').replace(/\\n/g, '\n') || ''

      reading = {
        summary,
        interpretation,
        cards: drawnCards.map(c => ({
          position: SPREAD_LABELS[c.position].ru,
          name: c.nameRu,
          insight: '',
        })),
        advice,
      }
    }

    // Save for authenticated users (fire-and-forget)
    if (session?.id) {
      prisma.tarotReadingRecord.create({
        data: {
          userId:         session.id,
          question:       question.trim(),
          category:       'general',
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
