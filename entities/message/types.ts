// types.ts
export const SENDER_TYPE = {
  USER:   'USER',
  READER: 'READER',
} as const

export type SenderType = (typeof SENDER_TYPE)[keyof typeof SENDER_TYPE]

export interface MessageEntity {
  id: string
  sessionId: string
  senderType: SenderType
  content: string
  createdAt: Date
}

export interface SendMessageInput {
  sessionId: string
  senderType: SenderType
  content: string
}
