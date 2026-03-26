import { NextRequest, NextResponse } from 'next/server'
import { sendMessage, getMessages } from '@/server/actions'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = await sendMessage(body)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 400 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('sessionId')
  if (!sessionId) return NextResponse.json({ error: 'sessionId required' }, { status: 400 })
  try {
    const messages = await getMessages(sessionId)
    return NextResponse.json(messages)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}
