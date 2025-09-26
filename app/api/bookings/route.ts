import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { notifyWhatsAppHost } from '@/lib/notify'
import { parseLocalDate } from '@/lib/utils'

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

    let bookingId: string | undefined

    // Ensure a property exists (create one default if not)
    let property = await prisma?.property.findFirst()
    if (!property && prisma) {
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
    let user = await prisma?.user.findUnique({ where: { email: customer.email } })
    if (!user && prisma) {
      user = await prisma.user.create({
        data: {
          email: customer.email,
          name: customer.name,
          phone: customer.phone,
          role: 'GUEST',
        },
      })
    }

    if (prisma && property && user) {
      // Criar data corrigindo problema de timezone
      const bookingDate = parseLocalDate(date)
      
      const booking = await prisma.booking.create({
        data: {
          startDate: bookingDate,
          endDate: bookingDate,
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

    // Enviar notificação WhatsApp para a proprietária
    const bookingDisplayDate = parseLocalDate(date)
    const msg = `🏡 *Nova reserva - Espaço Vip JR*

📅 Data: ${bookingDisplayDate.toLocaleDateString('pt-BR')}
👥 Convidados: ${guests}
💰 Valor: R$ ${totalPrice.toFixed(2)}
📦 Pacote: ${packageId}
👤 Cliente: ${customer.name}
📱 Telefone: ${customer.phone}
📧 Email: ${customer.email}
${customer.notes ? `📝 Observações: ${customer.notes}` : ''}

Reserva ${bookingId ? `criada no sistema!` : 'processada com sucesso!'}`

    const whatsappSent = await notifyWhatsAppHost(msg)
    
    return NextResponse.json({ 
      ok: true, 
      bookingId: bookingId ?? null,
      whatsappSent 
    })
  } catch (e) {
    console.error('POST /api/bookings error:', e)
    const message = e instanceof Error ? e.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


