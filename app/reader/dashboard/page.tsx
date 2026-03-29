export const dynamic = 'force-dynamic'

import { getServerSession } from '@/shared/lib/auth'
import { getReaderSessions } from '@/server/actions/reader'
import { prisma } from '@/shared/lib/prisma'
import { DashboardClient } from './DashboardClient'
import { redirect } from 'next/navigation'

export default async function ReaderDashboardPage() {
  const session = await getServerSession()
  if (!session) redirect('/reader/login')
  if (session.role !== 'READER' && session.role !== 'AUTHOR') redirect('/cabinet')

  const [sessions, reader] = await Promise.all([
    getReaderSessions(),
    prisma.tarotReader.findUnique({ where: { userId: session.id }, select: { telegramChatId: true } }),
  ])

  return <DashboardClient user={session} sessions={sessions} telegramLinked={!!reader?.telegramChatId} />
}
