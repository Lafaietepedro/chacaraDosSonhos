import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!prisma) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 200 })
    }
    const id = params.id
    const body = await request.json()
    const { status } = body as { status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' }

    if (!id || !status) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json({ ok: true, booking })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}


