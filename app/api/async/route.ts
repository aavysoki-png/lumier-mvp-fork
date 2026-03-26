import { NextRequest, NextResponse } from 'next/server'
import { getAsyncStatus, createAsyncReading } from '@/server/actions'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('sessionId')
  if (!sessionId) return NextResponse.json({ error: 'sessionId required' }, { status: 400 })
  try {
    const reading = await getAsyncStatus(sessionId)
    if (!reading) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(reading)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json()
    const result = await createAsyncReading(sessionId)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create async reading' }, { status: 400 })
  }
}
