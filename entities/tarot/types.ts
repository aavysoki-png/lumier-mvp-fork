// ─── Tarot Data Types ─────────────────────────────────────────────────────────

export interface DeckCard {
  id: number
  name: string
  arcana: 'major' | 'minor'
  suit?: 'wands' | 'cups' | 'swords' | 'pentacles'
}

export interface DrawnCard extends DeckCard {
  isReversed: boolean
  position: SpreadPosition
}

export type SpreadPosition =
  | 'past'
  | 'present'
  | 'future'
  | 'internal'
  | 'external'
  | 'guidance'

export const SPREAD_LABELS: Record<SpreadPosition, { ru: string; en: string }> = {
  past:     { ru: 'Прошлое',         en: 'Past Influence' },
  present:  { ru: 'Настоящее',       en: 'Present State' },
  future:   { ru: 'Будущее',         en: 'Future Direction' },
  internal: { ru: 'Внутренний мир',  en: 'Internal World' },
  external: { ru: 'Внешний мир',     en: 'External World' },
  guidance: { ru: 'Совет',           en: 'Guidance' },
}

export const SPREAD_ORDER: SpreadPosition[] = [
  'past', 'present', 'future', 'internal', 'external', 'guidance',
]

export const SUIT_SYMBOLS: Record<string, string> = {
  wands:     '⟡',
  cups:      '◇',
  swords:    '△',
  pentacles: '☆',
}

export interface CardInsight {
  position: string
  name: string
  insight: string
}

export interface TarotReading {
  summary: string
  interpretation: string
  cards: CardInsight[]
  advice: string
}

export interface TarotResponse {
  drawnCards: DrawnCard[]
  reading: TarotReading
}
