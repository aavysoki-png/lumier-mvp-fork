import { z } from 'zod'

// ─── Request DTOs (Zod schemas) ───────────────────────────────────────────────

export const CreateUserDTO = z.object({
  name: z.string().min(2).max(100).trim(),
  dateOfBirth: z.string().refine((v) => !isNaN(Date.parse(v)), {
    message: 'Invalid date of birth',
  }),
})

export const CreateQuestionDTO = z.object({
  userId: z.string().cuid(),
  text: z.string().min(10).max(1000).trim(),
  category: z.enum(['relationships', 'career', 'spiritual', 'general', 'health', 'finance']),
})

export const CreateSessionDTO = z.object({
  userId: z.string().cuid(),
  readerId: z.string().cuid(),
  type: z.enum(['LIVE', 'ASYNC']),
})

export const UpdateSessionTypeDTO = z.object({
  sessionId: z.string().cuid(),
  type: z.enum(['LIVE', 'ASYNC']),
})

export const CreateOrderDTO = z.object({
  userId: z.string().cuid(),
  sessionId: z.string().cuid(),
  amount: z.number().positive(),
})

export const SendMessageDTO = z.object({
  sessionId: z.string().cuid(),
  senderType: z.enum(['USER', 'READER']),
  content: z.string().min(1).max(2000).trim(),
})

export const CreateReadingDTO = z.object({
  sessionId: z.string().cuid(),
})

export const CompleteReadingDTO = z.object({
  readingId: z.string().cuid(),
  resultText: z.string().min(1),
})

// ─── Inferred input types ─────────────────────────────────────────────────────

export type CreateUserInput     = z.infer<typeof CreateUserDTO>
export type CreateQuestionInput = z.infer<typeof CreateQuestionDTO>
export type CreateSessionInput  = z.infer<typeof CreateSessionDTO>
export type CreateOrderInput    = z.infer<typeof CreateOrderDTO>
export type SendMessageInput    = z.infer<typeof SendMessageDTO>
export type CreateReadingInput  = z.infer<typeof CreateReadingDTO>
export type CompleteReadingInput = z.infer<typeof CompleteReadingDTO>

// ─── Response shapes ─────────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  data: T
  success: true
}

export interface ApiError {
  error: { code: string; message: string; fields?: Record<string, string> }
  success: false
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

export function success<T>(data: T): ApiSuccess<T> {
  return { data, success: true }
}
