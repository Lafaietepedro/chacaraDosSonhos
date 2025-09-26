import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { notifyWhatsAppHost } from '@/lib/notify'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      date,
      guests,
      packageId,
      extras, // ignored for now
      customer,
      totalPrice,
    } = body as {
      date: string
      guests: number
      packageId: string
      extras?: string[]
      customer: { name: string; email: string; phone: string; notes?: string }
      totalPrice: number
    }

    if (!date || !guests || !packageId || !customer?.name || !customer?.email) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const hasDb = Boolean(process.env.DATABASE_URL)
    let bookingId: string | undefined
    if (hasDb && prisma) {
      // Ensure a property exists (create one default if not)
      let property = await prisma.property.findFirst()
      if (!property) {
        property = await prisma.property.create({
          data: {
            name: 'Espaço Vip JR',
            description: 'Espaço para eventos',
            capacity: 150,
            basePrice: 800,
            address: 'Estrada da Chácara, 123 - SP',
          },
        })
      }

      // Find or create customer user
      let user = await prisma.user.findUnique({ where: { email: customer.email } })
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: customer.email,
            name: customer.name,
            phone: customer.phone,
            role: 'GUEST',
          },
        })
      }

      const booking = await prisma.booking.create({
        data: {
          startDate: new Date(date),
          endDate: new Date(date),
          guests,
          totalPrice,
          status: 'PENDING',
          notes: customer.notes,
          userId: user.id,
          propertyId: property.id,
        },
      })
      bookingId = booking.id
    }

    const msg = `Nova reserva recebida!\nData: ${new Date(date).toLocaleDateString('pt-BR')}\nConvidados: ${guests}\nValor: R$ ${totalPrice.toFixed(2)}\nCliente: ${customer.name} (${customer.phone})`
    await notifyWhatsAppHost(msg)

    return NextResponse.json({ ok: true, bookingId: bookingId ?? null })
  } catch (e) {
    console.error('POST /api/bookings error:', e)
    const message = e instanceof Error ? e.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


