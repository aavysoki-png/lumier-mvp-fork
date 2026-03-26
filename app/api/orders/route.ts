import { NextRequest, NextResponse } from 'next/server'
import { createOrder, confirmPayment } from '@/server/actions'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = await createOrder(body)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 400 })
  }
}
