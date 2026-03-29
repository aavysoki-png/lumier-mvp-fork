export const dynamic = 'force-dynamic'

import { getServerSession } from '@/shared/lib/auth'
import { getClientSessions } from '@/server/actions/cabinet'
import { getUserTarotReadings } from '@/server/actions/tarot'
import { getWalletInfo } from '@/server/actions/wallet'
import { CabinetClient } from './CabinetClient'
import { redirect } from 'next/navigation'

export default async function CabinetPage() {
  const session = await getServerSession()
  if (!session) redirect('/login')
  if (session.role !== 'CLIENT') redirect('/reader/dashboard')

  const [sessions, tarotHistory, wallet] = await Promise.all([
    getClientSessions(),
    getUserTarotReadings(),
    getWalletInfo(),
  ])

  return <CabinetClient user={session} sessions={sessions} tarotHistory={tarotHistory} wallet={wallet} />
}
