import { prisma } from '@/shared/lib/prisma'
import { InvalidStateError, NotFoundError } from '@/server/errors'
import type { CreateOrderInput, OrderStatus } from './types'
import { isValidOrderTransition } from './types'

export async function createOrder(input: CreateOrderInput) {
  return prisma.order.create({
    data: {
      userId: input.userId,
      sessionId: input.sessionId,
      amount: input.amount,
      status: 'PENDING',
    },
  })
}

export async function markPaid(orderId: string): Promise<void> {
  await _transition(orderId, 'PAID')
  // Simulate brief processing
  await new Promise((r) => setTimeout(r, 600))
}

export async function markRefunded(orderId: string): Promise<void> {
  await _transition(orderId, 'REFUNDED')
}

export async function getOrder(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) throw new NotFoundError('Order', orderId)
  return order
}

async function _transition(orderId: string, to: OrderStatus) {
  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) throw new NotFoundError('Order', orderId)

  const from = order.status as OrderStatus
  if (!isValidOrderTransition(from, to)) {
    throw new InvalidStateError(`Order cannot transition from ${from} to ${to}`)
  }

  return prisma.order.update({ where: { id: orderId }, data: { status: to } })
}
