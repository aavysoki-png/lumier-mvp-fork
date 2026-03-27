export const dynamic = 'force-dynamic'

import { getServerSession } from '@/shared/lib/auth'
import { getAllArticlesAdmin } from '@/server/actions/news'
import { AdminNewsClient } from './AdminNewsClient'
import { redirect } from 'next/navigation'

export default async function AdminNewsPage() {
  const session = await getServerSession()
  if (!session || session.role !== 'ADMIN') redirect('/')

  const articles = await getAllArticlesAdmin()
  return <AdminNewsClient articles={articles} />
}
