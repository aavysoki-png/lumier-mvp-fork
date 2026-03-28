import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { drawCards, SPREAD_LABELS, type DrawnCard, type TarotReading } from '@/entities/tarot'

// ─── AI System Prompt ─────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Ты — Lumier, мудрый и чуткий таролог с глубоким психологическим пониманием.

ТВОЙ ГОЛОС:
- Спокойный, тёплый, уверенный — как доверенный наставник
- Ты раскрываешь возможности, никогда не делаешь категоричных предсказаний
- Избегай шаблонных фраз, клише и пугающих формулировок
- Пиши на русском языке, называй карты по-русски

ТВОЙ МЕТОД:
- Читай расклад ЦЕЛИКОМ — расскажи историю, которую 6 карт создают вместе
- Находи связи, напряжения и гармонии между картами
- Перевёрнутые карты — это заблокированная энергия или внутреннее сопротивление, не «плохое»
- Привязывай интерпретацию к конкретному вопросу человека

6 ПОЗИЦИЙ:
1. Прошлое — какая энергия привела к текущему моменту
2. Настоящее — что происходит прямо сейчас вокруг вопроса
3. Будущее — куда движется энергия, если текущий путь продолжится
4. Внутренний мир — что человек чувствует внутри, но может не осознавать
5. Внешний мир — люди, обстоятельства, силы, влияющие на ситуацию
6. Совет — мудрость, которую карты предлагают

ФОРМАТ ОТВЕТА — верни ТОЛЬКО валидный JSON без markdown-обёртки:
{
  "summary": "1–2 предложения — эмоциональная суть расклада",
  "interpretation": "3–5 абзацев целостной интерпретации. Не перечисляй карты по одной — расскажи ИСТОРИЮ. Разделяй абзацы двойным переносом строки.",
  "cards": [
    {
      "position": "Название позиции по-русски",
      "name": "Название карты по-русски",
      "insight": "2–3 предложения о значении карты в этой позиции"
    }
  ],
  "advice": "2–3 предложения конкретного, заземлённого совета по ситуации."
}`

// ─── Build user prompt ────────────────────────────────────────────────────────

function buildPrompt(question: string, category: string, cards: DrawnCard[]): string {
  const cardList = cards.map((c, i) => {
    const pos = SPREAD_LABELS[c.position]
    const state = c.isReversed ? 'Reversed' : 'Upright'
    return `${i + 1}. Position: ${pos.en} (${pos.ru}) — ${c.name} (${state})`
  }).join('\n')

  return `The seeker asks about: "${question}"
Category: ${category}

Cards drawn:
${cardList}

Please provide a complete reading.`
}

// Increase serverless function timeout (Vercel Pro: up to 60s, Hobby: 10s)
export const maxDuration = 30

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const { question, category } = await req.json()

    if (!question || typeof question !== 'string' || question.trim().length < 3) {
      return NextResponse.json(
        { error: 'Пожалуйста, задайте вопрос (минимум 3 символа).' },
        { status: 400 },
      )
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI service is not configured. Add ANTHROPIC_API_KEY to environment.' },
        { status: 500 },
      )
    }

    // Draw 6 cards
    const drawnCards = drawCards(6)

    // Call Claude
    const anthropic = new Anthropic({ apiKey })
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2500,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: buildPrompt(question.trim(), category || 'general', drawnCards),
      }],
    })

    // Extract text from response
    const textBlock = message.content.find(b => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text in AI response')
    }

    let reading: TarotReading
    try {
      reading = JSON.parse(textBlock.text)
    } catch {
      // If Claude didn't return clean JSON, wrap in a fallback structure
      reading = {
        summary: 'Карты раскрыли свои тайны.',
        interpretation: textBlock.text,
        cards: drawnCards.map(c => ({
          position: SPREAD_LABELS[c.position].ru,
          name: c.name,
          insight: '',
        })),
        advice: '',
      }
    }

    return NextResponse.json({ drawnCards, reading })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Tarot reading error:', message, err)
    return NextResponse.json(
      { error: `Ошибка: ${message}` },
      { status: 500 },
    )
  }
}
