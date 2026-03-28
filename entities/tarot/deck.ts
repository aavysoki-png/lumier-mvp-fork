import { DeckCard, DrawnCard, SPREAD_ORDER } from './types'

// ─── Major Arcana ─────────────────────────────────────────────────────────────

const MAJOR_ARCANA: DeckCard[] = [
  { id: 0,  name: 'The Fool',            nameRu: 'Шут',               arcana: 'major' },
  { id: 1,  name: 'The Magician',        nameRu: 'Маг',               arcana: 'major' },
  { id: 2,  name: 'The High Priestess',  nameRu: 'Верховная Жрица',   arcana: 'major' },
  { id: 3,  name: 'The Empress',         nameRu: 'Императрица',       arcana: 'major' },
  { id: 4,  name: 'The Emperor',         nameRu: 'Император',         arcana: 'major' },
  { id: 5,  name: 'The Hierophant',      nameRu: 'Иерофант',          arcana: 'major' },
  { id: 6,  name: 'The Lovers',          nameRu: 'Влюблённые',        arcana: 'major' },
  { id: 7,  name: 'The Chariot',         nameRu: 'Колесница',         arcana: 'major' },
  { id: 8,  name: 'Strength',            nameRu: 'Сила',              arcana: 'major' },
  { id: 9,  name: 'The Hermit',          nameRu: 'Отшельник',         arcana: 'major' },
  { id: 10, name: 'Wheel of Fortune',    nameRu: 'Колесо Фортуны',   arcana: 'major' },
  { id: 11, name: 'Justice',             nameRu: 'Справедливость',    arcana: 'major' },
  { id: 12, name: 'The Hanged Man',      nameRu: 'Повешенный',        arcana: 'major' },
  { id: 13, name: 'Death',               nameRu: 'Смерть',            arcana: 'major' },
  { id: 14, name: 'Temperance',          nameRu: 'Умеренность',       arcana: 'major' },
  { id: 15, name: 'The Devil',           nameRu: 'Дьявол',            arcana: 'major' },
  { id: 16, name: 'The Tower',           nameRu: 'Башня',             arcana: 'major' },
  { id: 17, name: 'The Star',            nameRu: 'Звезда',            arcana: 'major' },
  { id: 18, name: 'The Moon',            nameRu: 'Луна',              arcana: 'major' },
  { id: 19, name: 'The Sun',             nameRu: 'Солнце',            arcana: 'major' },
  { id: 20, name: 'Judgement',           nameRu: 'Суд',               arcana: 'major' },
  { id: 21, name: 'The World',           nameRu: 'Мир',               arcana: 'major' },
]

// ─── Minor Arcana generator ──────────────────────────────────────────────────

const SUIT_RU_GENITIVE: Record<string, string> = {
  wands: 'Жезлов', cups: 'Кубков', swords: 'Мечей', pentacles: 'Пентаклей',
}

const RANK_RU = [
  'Туз', 'Двойка', 'Тройка', 'Четвёрка', 'Пятёрка', 'Шестёрка', 'Семёрка',
  'Восьмёрка', 'Девятка', 'Десятка', 'Паж', 'Рыцарь', 'Королева', 'Король',
]

const RANK_EN = [
  'Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven',
  'Eight', 'Nine', 'Ten', 'Page', 'Knight', 'Queen', 'King',
]

function minorSuit(suit: DeckCard['suit'], startId: number): DeckCard[] {
  const suitEn = suit!.charAt(0).toUpperCase() + suit!.slice(1)
  const suitRu = SUIT_RU_GENITIVE[suit!]
  return RANK_EN.map((rank, i) => ({
    id: startId + i,
    name: `${rank} of ${suitEn}`,
    nameRu: `${RANK_RU[i]} ${suitRu}`,
    arcana: 'minor' as const,
    suit,
  }))
}

// ─── Full 78-card deck ────────────────────────────────────────────────────────

export const FULL_DECK: DeckCard[] = [
  ...MAJOR_ARCANA,
  ...minorSuit('wands',     22),
  ...minorSuit('cups',      36),
  ...minorSuit('swords',    50),
  ...minorSuit('pentacles', 64),
]

// ─── Major Arcana symbols (for card UI) ───────────────────────────────────────

export const MAJOR_SYMBOLS: Record<number, string> = {
  0: '○', 1: '∞', 2: '☽', 3: '♀', 4: '♂', 5: '⛊', 6: '♡', 7: '⚡',
  8: '∞', 9: '☆', 10: '☸', 11: '⚖', 12: '⊗', 13: '♰', 14: '△',
  15: '⛧', 16: '↯', 17: '✦', 18: '☾', 19: '☀', 20: '⚜', 21: '◉',
}

// ─── Roman numerals for Major Arcana ──────────────────────────────────────────

export const ROMAN: Record<number, string> = {
  0: '0', 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII',
  8: 'VIII', 9: 'IX', 10: 'X', 11: 'XI', 12: 'XII', 13: 'XIII', 14: 'XIV',
  15: 'XV', 16: 'XVI', 17: 'XVII', 18: 'XVIII', 19: 'XIX', 20: 'XX', 21: 'XXI',
}

// ─── Card Selection ───────────────────────────────────────────────────────────

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
