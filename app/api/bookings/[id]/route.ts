import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/api-auth'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticação
    const authResult = verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }
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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticação
    const authResult = verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }
    if (!prisma) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 200 })
    }
    
    const id = params.id

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

    console.log(`🗑️ Reserva excluída: ${id} - Cliente: ${existingBooking.user.name}`)

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
    console.error('Erro ao excluir reserva:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}


