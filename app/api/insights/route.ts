import { NextRequest, NextResponse } from 'next/server'
import { getInsights, getInsightById } from '@/server/actions'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  try {
    if (id) {
      const insight = await getInsightById(id)
      if (!insight) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      return NextResponse.json(insight)
    }
    const insights = await getInsights()
    return NextResponse.json(insights)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 500 })
  }
}
