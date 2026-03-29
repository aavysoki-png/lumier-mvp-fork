import { NextRequest, NextResponse } from 'next/server'
import { createSession, getSession } from '@/server/actions'
import { getServerSession } from '@/shared/lib/auth'
import { prisma } from '@/shared/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const result = await createSession(body)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create session' }, { status: 400 })
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id') || searchParams.get('sessionId')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  // Verify ownership
  const sess = await prisma.session.findUnique({
    where: { id },
    select: { userId: true, readerId: true },
  })
  if (!sess) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const isOwner = sess.userId === session.id
  const isReader = session.readerProfile?.id === sess.readerId
  if (!isOwner && !isReader && session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const data = await getSession(id)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }
}
