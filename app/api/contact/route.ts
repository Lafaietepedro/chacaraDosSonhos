import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ensureDefaultProperty } from '@/lib/services/property.service'
import { notifyContactMessage } from '@/lib/services/notification.service'
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/rate-limit'
import { contactMessageSchema } from '@/lib/validation/contact'

export async function POST(request: Request) {
  try {
    const rateLimit = checkRateLimit({
      key: `contact:${getClientIp(request)}`,
      limit: 5,
      windowMs: 10 * 60 * 1000,
    })

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Muitas mensagens em pouco tempo. Tente novamente em alguns minutos.' },
        { status: 429, headers: rateLimitHeaders(rateLimit) }
      )
    }

    if (!prisma) {
      return NextResponse.json({ error: 'Banco de dados indisponível' }, { status: 503 })
    }

    const body = await request.json()
    const parsed = contactMessageSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados de contato inválidos', issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, email, phone, subject, message } = parsed.data
    const property = await ensureDefaultProperty(prisma)
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject: subject || null,
        message,
        propertyId: property.id,
      },
    })

    const notifications = await notifyContactMessage({
      name,
      email,
      phone,
      subject,
      message,
      venueName: property.name,
      hostEmail: property.contactEmail,
    })

    return NextResponse.json({
      ok: true,
      messageId: contactMessage.id,
      notifications,
    })
  } catch (error) {
    console.error('POST /api/contact error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
