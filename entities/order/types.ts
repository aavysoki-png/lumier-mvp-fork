export const ORDER_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  REFUNDED: 'REFUNDED',
} as const

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS]

export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING:  ['PAID'],
  PAID:     ['REFUNDED'],
  REFUNDED: [],
}

export function isValidOrderTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_TRANSITIONS[from].includes(to)
}

export interface OrderEntity {
  id: string
  userId: string
  sessionId: string
  amount: number
  status: OrderStatus
  createdAt: Date
}

export interface CreateOrderInput {
  userId: string
  sessionId: string
  amount: number
}
