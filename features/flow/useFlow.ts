'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

// ─── Step definitions ─────────────────────────────────────────────────────────

export const FLOW_STEPS = [
  'onboarding',
  'question',
  'readers',
  'checkout',
  'session-format',
  'live',
  'async-submitted',
  'async-status',
  'result',
] as const

export type FlowStep = (typeof FLOW_STEPS)[number]

const STEP_ROUTES: Record<FlowStep, string> = {
  'onboarding':       '/onboarding',
  'question':         '/question',
  'readers':          '/readers',
  'checkout':         '/checkout',
  'session-format':   '/session-format',
  'live':             '/chat',
  'async-submitted':  '/async/submitted',
  'async-status':     '/async/status',
  'result':           '/result',
}

// What each step requires to be set in the store
const STEP_GUARDS: Partial<Record<FlowStep, FlowStep[]>> = {
  'question':       ['onboarding'],
  'readers':        ['onboarding', 'question'],
  'checkout':       ['onboarding', 'question', 'readers'],
  'session-format': ['onboarding', 'question', 'readers', 'checkout'],
  'live':           ['onboarding', 'question', 'readers', 'checkout', 'session-format'],
  'async-submitted':['onboarding', 'question', 'readers', 'checkout', 'session-format'],
  'async-status':   ['onboarding', 'question', 'readers', 'checkout', 'session-format'],
  'result':         ['onboarding', 'question', 'readers', 'checkout', 'session-format'],
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface FlowStore {
  completedSteps: FlowStep[]
  currentStep: FlowStep | null

  markComplete: (step: FlowStep) => void
  setCurrentStep: (step: FlowStep) => void
  hasCompleted: (step: FlowStep) => boolean
  canAccessStep: (step: FlowStep) => boolean
  reset: () => void
}

export const useFlowStore = create<FlowStore>()(
  persist(
    (set, get) => ({
      completedSteps: [],
      currentStep: null,

      markComplete: (step) =>
        set((s) => ({
          completedSteps: s.completedSteps.includes(step)
            ? s.completedSteps
            : [...s.completedSteps, step],
        })),

      setCurrentStep: (step) => set({ currentStep: step }),

      hasCompleted: (step) => get().completedSteps.includes(step),

      canAccessStep: (step) => {
        const required = STEP_GUARDS[step]
        if (!required) return true
        const { completedSteps } = get()
        return required.every((s) => completedSteps.includes(s))
      },

      reset: () => set({ completedSteps: [], currentStep: null }),
    }),
    {
      name: 'lumina-flow',
      partialize: (s) => ({ completedSteps: s.completedSteps }),
    }
  )
)

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useFlow() {
  const router = useRouter()
  const { markComplete, setCurrentStep, hasCompleted, canAccessStep, reset } =
    useFlowStore()

  const advance = useCallback(
    (completedStep: FlowStep, nextStep: FlowStep) => {
      markComplete(completedStep)
      setCurrentStep(nextStep)
      router.push(STEP_ROUTES[nextStep])
    },
    [markComplete, setCurrentStep, router]
  )

  const goTo = useCallback(
    (step: FlowStep) => {
      if (!canAccessStep(step)) {
        // Redirect to furthest accessible step
        router.replace(STEP_ROUTES['onboarding'])
        return
      }
      setCurrentStep(step)
      router.push(STEP_ROUTES[step])
    },
    [canAccessStep, setCurrentStep, router]
  )

  const guardStep = useCallback(
    (step: FlowStep): boolean => {
      if (!canAccessStep(step)) {
        router.replace(STEP_ROUTES['onboarding'])
        return false
      }
      return true
    },
    [canAccessStep, router]
  )

  return { advance, goTo, guardStep, hasCompleted, canAccessStep, reset, STEP_ROUTES }
}
