import { NextResponse } from 'next/server'
import { getReaders } from '@/server/actions'

export async function GET() {
  try {
    const readers = await getReaders()
    return NextResponse.json(readers)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch readers' }, { status: 500 })
  }
}
