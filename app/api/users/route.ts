import { NextRequest, NextResponse } from 'next/server'
import { createUser, getUser } from '@/server/actions'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = await createUser(body)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 400 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  try {
    const user = await getUser(id)
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(user)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}
