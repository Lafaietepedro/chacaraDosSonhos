import { NextResponse } from 'next/server'
import { notifyWhatsAppHost } from '@/lib/notify'
import { siteConfig } from '@/lib/site'
import { createBookingRequest, BookingServiceError } from '@/lib/services/booking.service'

export async function POST(request: Request) {
  try {
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

    // Enviar notificação WhatsApp para o anfitrião
    const msg = `Nova solicitação de reserva - ${siteConfig.appName}

Data: ${booking.startDate.toLocaleDateString('pt-BR')}
Convidados: ${guests}
Valor: R$ ${quote.totalAmount.toFixed(2)}
Pacote: ${selectedPackage.name}
Cliente: ${customer.name}
Telefone: ${customer.phone}
Email: ${customer.email}
${customer.notes ? `Observações: ${customer.notes}` : ''}

Reserva criada no sistema!`

    const whatsappSent = await notifyWhatsAppHost(msg)
    
    return NextResponse.json({ 
      ok: true, 
      bookingId: booking.id,
      totalPrice: quote.totalAmount,
      whatsappSent 
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
