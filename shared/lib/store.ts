import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface UserState {
  id: string | null
  name: string | null
  dateOfBirth: string | null
}

interface QuestionState {
  id: string | null
  text: string | null
  category: string | null
}

interface ReaderContext {
  id: string | null
  name: string | null
  specialization: string | null
  price: number | null
  tier: 'FOUNDATION' | 'SENIOR' | 'MASTER' | null
}

interface SessionContext {
  id: string | null
  orderId: string | null
  type: 'LIVE' | 'ASYNC' | null
}

interface AppStore {
  user: UserState
  question: QuestionState
  reader: ReaderContext
  session: SessionContext

  setUser: (user: UserState) => void
  setQuestion: (q: Partial<QuestionState>) => void
  setReader: (r: Partial<ReaderContext>) => void
  setSession: (s: Partial<SessionContext>) => void
  clearSession: () => void
  reset: () => void
}

const emptyUser: UserState = { id: null, name: null, dateOfBirth: null }
const emptyQuestion: QuestionState = { id: null, text: null, category: null }
const emptyReader: ReaderContext = { id: null, name: null, specialization: null, price: null, tier: null }
const emptySession: SessionContext = { id: null, orderId: null, type: null }

// Safe storage that works on server (returns empty, never throws)
const safeStorage = createJSONStorage(() => {
  if (typeof window === 'undefined') {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    }
  }
  return localStorage
})

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      user:     emptyUser,
      question: emptyQuestion,
      reader:   emptyReader,
      session:  emptySession,

      setUser:     (user)  => set({ user }),
      setQuestion: (q)     => set((s) => ({ question: { ...s.question, ...q } })),
      setReader:   (r)     => set((s) => ({ reader:   { ...s.reader,   ...r } })),
      setSession:  (sess)  => set((s) => ({ session:  { ...s.session,  ...sess } })),

      clearSession: () => set({ question: emptyQuestion, reader: emptyReader, session: emptySession }),
      reset:        () => set({ user: emptyUser, question: emptyQuestion, reader: emptyReader, session: emptySession }),
    }),
    {
      name: 'lumina-app-state',
      storage: safeStorage,
      partialize: (s) => ({
        user: s.user,
        question: s.question,
        reader: s.reader,
        session: s.session,
      }),
    }
  )
)
