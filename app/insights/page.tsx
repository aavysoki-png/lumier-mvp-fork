export const dynamic = 'force-dynamic'

import { getInsights } from '@/server/actions'
import { InsightsClient } from './InsightsClient'

export default async function InsightsPage() {
  const articles = await getInsights()
  return <InsightsClient articles={articles} />
}
