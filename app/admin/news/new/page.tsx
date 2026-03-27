import { getServerSession } from '@/shared/lib/auth'
import { NewArticleClient } from './NewArticleClient'
import { redirect } from 'next/navigation'

export default async function NewArticlePage() {
  const session = await getServerSession()
  if (!session || session.role !== 'ADMIN') redirect('/')

  return <NewArticleClient />
}
