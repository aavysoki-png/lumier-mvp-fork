import { NextRequest, NextResponse } from 'next/server'
import { sendMessage, getMessages } from '@/server/actions'
import { getServerSession } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()

    // Verify user owns this session
    const sess = await prisma.session.findUnique({
      where: { id: body.sessionId },
      select: { userId: true, readerId: true },
    })
    if (!sess) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

    // Client or reader can send
    const isOwner = sess.userId === session.id
    const isReader = session.readerProfile?.id === sess.readerId
    if (!isOwner && !isReader && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const result = await sendMessage(body)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 400 })
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('sessionId')
  if (!sessionId) return NextResponse.json({ error: 'sessionId required' }, { status: 400 })

  // Verify user owns this session
  const sess = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { userId: true, readerId: true },
  })
  if (!sess) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const isOwner = sess.userId === session.id
  const isReader = session.readerProfile?.id === sess.readerId
  if (!isOwner && !isReader && session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const messages = await getMessages(sessionId)
    return NextResponse.json(messages)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}
