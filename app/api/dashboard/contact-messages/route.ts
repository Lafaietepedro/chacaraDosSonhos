import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/api-auth'
import { ensureDefaultProperty } from '@/lib/services/property.service'

export async function GET(request: Request) {
  try {
    const authResult = verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    if (!prisma) {
      return NextResponse.json({ contactMessages: [] })
    }

    const property = await ensureDefaultProperty(prisma)
    const contactMessages = await prisma.contactMessage.findMany({
      where: { propertyId: property.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({
      contactMessages: contactMessages.map((message) => ({
        id: message.id,
        name: message.name,
        email: message.email,
        phone: message.phone,
        subject: message.subject,
        message: message.message,
        status: message.status,
        createdAt: message.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('GET /api/dashboard/contact-messages error:', error)
    return NextResponse.json({ contactMessages: [] }, { status: 200 })
  }
}
