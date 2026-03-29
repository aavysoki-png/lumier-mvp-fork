'use server'

import { prisma } from '@/shared/lib/prisma'
import { getServerSession } from '@/shared/lib/auth'
import { revalidatePath } from 'next/cache'

export async function getWalletInfo() {
  const session = await getServerSession()
  if (!session) return null

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { balance: true, freeReadings: true },
  })

  const transactions = await prisma.walletTransaction.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return { balance: user?.balance ?? 0, freeReadings: user?.freeReadings ?? 0, transactions }
}

export async function topUpBalance(amount: number) {
  const session = await getServerSession()
  if (!session) return { error: 'Необходима авторизация' }
  if (amount <= 0 || amount > 100000) return { error: 'Некорректная сумма' }

  await prisma.user.update({
    where: { id: session.id },
    data: { balance: { increment: amount } },
  })

  await prisma.walletTransaction.create({
    data: {
      userId: session.id,
      amount,
      type: 'topup',
      note: 'Пополнение баланса',
    },
  })

  revalidatePath('/cabinet')
  return { success: `Баланс пополнен на ${amount} ₽` }
}

// Admin: add balance to any user
export async function adminTopUp(userId: string, amount: number) {
  const session = await getServerSession()
  if (!session || session.role !== 'ADMIN') return { error: 'Forbidden' }

  await prisma.user.update({
    where: { id: userId },
    data: { balance: { increment: amount } },
  })

  await prisma.walletTransaction.create({
    data: { userId, amount, type: 'topup', note: 'Пополнение администратором' },
  })

  return { success: true }
}
