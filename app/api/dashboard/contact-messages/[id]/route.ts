import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/api-auth'

const allowedStatuses = ['NEW', 'READ', 'ARCHIVED'] as const

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    if (!prisma) {
      return NextResponse.json({ error: 'Banco de dados indisponível' }, { status: 503 })
    }

    const body = await request.json() as { status?: string }
    const status = body.status?.toUpperCase()

    if (!status || !allowedStatuses.includes(status as typeof allowedStatuses[number])) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
    }

    const contactMessage = await prisma.contactMessage.update({
      where: { id: params.id },
      data: { status },
    })

    return NextResponse.json({
      contactMessage: {
        id: contactMessage.id,
        status: contactMessage.status,
      },
    })
  } catch (error) {
    console.error('PATCH /api/dashboard/contact-messages/[id] error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
