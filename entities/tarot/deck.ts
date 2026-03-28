import { DeckCard, DrawnCard, SPREAD_ORDER } from './types'

// ─── Full 78-card Tarot Deck ──────────────────────────────────────────────────

const MAJOR_ARCANA: DeckCard[] = [
  { id: 0,  name: 'The Fool',            arcana: 'major' },
  { id: 1,  name: 'The Magician',        arcana: 'major' },
  { id: 2,  name: 'The High Priestess',  arcana: 'major' },
  { id: 3,  name: 'The Empress',         arcana: 'major' },
  { id: 4,  name: 'The Emperor',         arcana: 'major' },
  { id: 5,  name: 'The Hierophant',      arcana: 'major' },
  { id: 6,  name: 'The Lovers',          arcana: 'major' },
  { id: 7,  name: 'The Chariot',         arcana: 'major' },
  { id: 8,  name: 'Strength',            arcana: 'major' },
  { id: 9,  name: 'The Hermit',          arcana: 'major' },
  { id: 10, name: 'Wheel of Fortune',    arcana: 'major' },
  { id: 11, name: 'Justice',             arcana: 'major' },
  { id: 12, name: 'The Hanged Man',      arcana: 'major' },
  { id: 13, name: 'Death',               arcana: 'major' },
  { id: 14, name: 'Temperance',          arcana: 'major' },
  { id: 15, name: 'The Devil',           arcana: 'major' },
  { id: 16, name: 'The Tower',           arcana: 'major' },
  { id: 17, name: 'The Star',            arcana: 'major' },
  { id: 18, name: 'The Moon',            arcana: 'major' },
  { id: 19, name: 'The Sun',             arcana: 'major' },
  { id: 20, name: 'Judgement',           arcana: 'major' },
  { id: 21, name: 'The World',           arcana: 'major' },
]

function minorSuit(suit: DeckCard['suit'], startId: number): DeckCard[] {
  const ranks = [
    'Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven',
    'Eight', 'Nine', 'Ten', 'Page', 'Knight', 'Queen', 'King',
  ]
  const suitName = suit!.charAt(0).toUpperCase() + suit!.slice(1)
  return ranks.map((rank, i) => ({
    id: startId + i,
    name: `${rank} of ${suitName}`,
    arcana: 'minor' as const,
    suit,
  }))
}

export const FULL_DECK: DeckCard[] = [
  ...MAJOR_ARCANA,
  ...minorSuit('wands',     22),
  ...minorSuit('cups',      36),
  ...minorSuit('swords',    50),
  ...minorSuit('pentacles', 64),
]

// ─── Card Selection ───────────────────────────────────────────────────────────

/** Fisher–Yates shuffle, then take first N */
export function drawCards(count: number = 6): DrawnCard[] {
  const pool = [...FULL_DECK]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, count).map((card, idx) => ({
    ...card,
    isReversed: Math.random() < 0.3,
    position: SPREAD_ORDER[idx],
  }))
}
