import { NextResponse } from 'next/server'
import { createBookingRequest, BookingServiceError } from '@/lib/services/booking.service'
import { notifyBookingCreated } from '@/lib/services/notification.service'
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/rate-limit'

export async function POST(request: Request) {
  try {
    const rateLimit = checkRateLimit({
      key: `booking:${getClientIp(request)}`,
      limit: 8,
      windowMs: 10 * 60 * 1000,
    })

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Muitas solicitações em pouco tempo. Tente novamente em alguns minutos.' },
        { status: 429, headers: rateLimitHeaders(rateLimit) }
      )
    }

    const body = await request.json()
    const {
      date,
      guests,
      packageId,
      customer,
    } = body as {
      date: string
      guests: number
      packageId: string
      customer: { name: string; email: string; phone: string; notes?: string }
    }

    if (!date || !guests || !packageId || !customer?.name || !customer?.email) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const { booking, package: selectedPackage, quote } = await createBookingRequest({
      date,
      guests,
      packageId,
      customer,
    })

    const notifications = await notifyBookingCreated({
      booking,
      packageName: selectedPackage.name,
      totalAmount: quote.totalAmount,
    })
    
    return NextResponse.json({ 
      ok: true, 
      bookingId: booking.id,
      totalPrice: quote.totalAmount,
      notifications,
    })
  } catch (e) {
    console.error('POST /api/bookings error:', e)
    if (e instanceof BookingServiceError) {
      const status = e.code === 'DATE_UNAVAILABLE' ? 409 : e.code === 'DATABASE_UNAVAILABLE' ? 500 : 400
      return NextResponse.json({ error: e.message, code: e.code }, { status })
    }

    const message = e instanceof Error ? e.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
