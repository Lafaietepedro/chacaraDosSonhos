import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ensureDefaultProperty } from '@/lib/services/property.service'
import { notifyContactMessage } from '@/lib/services/notification.service'
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/rate-limit'

type ContactPayload = {
  name?: string
  email?: string
  phone?: string
  subject?: string
  message?: string
}

function clean(value?: string) {
  return value?.trim() ?? ''
}

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

    const body = await request.json() as ContactPayload
    const name = clean(body.name)
    const email = clean(body.email).toLowerCase()
    const phone = clean(body.phone)
    const subject = clean(body.subject)
    const message = clean(body.message)

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Informe nome, email e mensagem' }, { status: 400 })
    }

    if (!email.includes('@')) {
      return NextResponse.json({ error: 'Informe um email válido' }, { status: 400 })
    }

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
