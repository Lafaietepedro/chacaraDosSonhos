import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/api-auth'
import { assertBookingStatusTransition, isBookingStatus } from '@/lib/services/booking-status'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticação
    const authResult = verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }
    
    if (!prisma) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }
    
    const { id } = await params
    const body = await request.json()
    const { status } = body as { status: string }

    if (!id || !status || !isBookingStatus(status)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const currentBooking = await prisma.booking.findUnique({
      where: { id },
      select: { status: true },
    })

    if (!currentBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    try {
      assertBookingStatusTransition(currentBooking.status, status)
    } catch {
      return NextResponse.json({ error: 'Invalid status transition' }, { status: 409 })
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json({ ok: true, booking })
  } catch (e) {
    console.error('PATCH /api/bookings/[id] error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticação
    const authResult = verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }
    
    if (!prisma) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }
    
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 })
    }

    // Verificar se a reserva existe
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: true,
        payments: true,
        bookingExtras: true
      }
    })

    if (!existingBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Excluir a reserva (cascade delete vai remover payments e bookingExtras automaticamente)
    await prisma.booking.delete({
      where: { id }
    })

    return NextResponse.json({ 
      ok: true, 
      message: 'Reserva excluída com sucesso',
      deletedBooking: {
        id: existingBooking.id,
        customer: existingBooking.user.name,
        date: existingBooking.startDate,
        total: existingBooking.totalPrice
      }
    })
  } catch (e) {
    console.error('DELETE /api/bookings/[id] error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
