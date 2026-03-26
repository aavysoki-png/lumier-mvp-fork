import { getInsightById, getInsights } from '@/server/actions'
import { InsightDetailClient } from './InsightDetailClient'
import { notFound } from 'next/navigation'

// Safe fallback if DB unavailable at build time
export async function generateStaticParams() {
  try {
    const insights = await getInsights()
    return insights.map((i) => ({ id: i.id }))
  } catch {
    return []
  }
}

// Force dynamic rendering so it always has DB access at runtime
export const dynamic = 'force-dynamic'

export default async function InsightDetailPage({ params }: { params: { id: string } }) {
  const insight = await getInsightById(params.id)
  if (!insight) notFound()
  return <InsightDetailClient insight={insight} />
}
