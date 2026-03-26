export const dynamic = 'force-dynamic'

import { getInsights } from '@/server/actions'
import { InsightsClient } from './InsightsClient'

export default async function InsightsPage() {
  const insights = await getInsights()
  return <InsightsClient insights={insights} />
}
