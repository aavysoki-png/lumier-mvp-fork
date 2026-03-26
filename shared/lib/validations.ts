import { z } from 'zod'

export const CreateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date of birth',
  }),
})

export const CreateQuestionSchema = z.object({
  userId: z.string().cuid(),
  text: z.string().min(10, 'Please provide more detail about your question').max(1000),
  category: z.enum(['relationships', 'career', 'spiritual', 'general', 'health', 'finance']),
})

export const CreateSessionSchema = z.object({
  userId: z.string().cuid(),
  readerId: z.string().cuid(),
  type: z.enum(['LIVE', 'ASYNC']),
})

export const CreateOrderSchema = z.object({
  userId: z.string().cuid(),
  sessionId: z.string().cuid(),
  amount: z.number().positive(),
})

export const SendMessageSchema = z.object({
  sessionId: z.string().cuid(),
  senderType: z.enum(['USER', 'READER']),
  content: z.string().min(1).max(2000),
})

export type CreateUserInput = z.infer<typeof CreateUserSchema>
export type CreateQuestionInput = z.infer<typeof CreateQuestionSchema>
export type CreateSessionInput = z.infer<typeof CreateSessionSchema>
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>
export type SendMessageInput = z.infer<typeof SendMessageSchema>
