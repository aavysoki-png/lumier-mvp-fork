export const dynamic = 'force-dynamic'

import { getServerSession } from '@/shared/lib/auth'
import { getArticleForEdit } from '@/server/actions/news'
import { EditArticleClient } from './EditArticleClient'
import { redirect, notFound } from 'next/navigation'

export default async function EditArticlePage({ params }: { params: { id: string } }) {
  const session = await getServerSession()
  if (!session || session.role !== 'ADMIN') redirect('/')

  const article = await getArticleForEdit(params.id)
  if (!article) notFound()

  return <EditArticleClient article={article} />
}
