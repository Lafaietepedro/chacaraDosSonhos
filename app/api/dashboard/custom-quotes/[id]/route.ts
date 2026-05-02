import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/api-auth'
import { ensureDefaultProperty } from '@/lib/services/property.service'
import type { CustomQuoteStatus, DashboardCustomQuote } from '@/types/booking'

const allowedStatuses: CustomQuoteStatus[] = ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED']

function isCustomQuoteStatus(value: unknown): value is CustomQuoteStatus {
  return typeof value === 'string' && allowedStatuses.includes(value as CustomQuoteStatus)
}

function mapCustomQuote(quote: {
  id: string
  eventType: string | null
  desiredDuration: string | null
  budgetRange: string | null
  requirements: string | null
  estimatedAmount: number | null
  finalAmount: number | null
  status: string
  items: Array<{
    id: string
    label: string
    quantity: number
    unit: string
    unitPrice: number
    total: number
    source: string | null
  }>
}): DashboardCustomQuote {
  return {
    id: quote.id,
    eventType: quote.eventType,
    desiredDuration: quote.desiredDuration,
    budgetRange: quote.budgetRange,
    requirements: quote.requirements,
    estimatedAmount: quote.estimatedAmount,
    finalAmount: quote.finalAmount,
    status: isCustomQuoteStatus(quote.status) ? quote.status : 'DRAFT',
    items: quote.items.map((item) => ({
      id: item.id,
      label: item.label,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      total: item.total,
      source: item.source,
    })),
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = verifyAuth(request)
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: 401 })
  }

  if (!prisma) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  try {
    const { id } = await params
    const body = await request.json() as {
      status?: unknown
      finalAmount?: unknown
    }

    if (!id || !isCustomQuoteStatus(body.status)) {
      return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
    }

    const finalAmount = body.finalAmount === null || body.finalAmount === ''
      ? null
      : Number(body.finalAmount)

    if (finalAmount !== null && (!Number.isFinite(finalAmount) || finalAmount < 0)) {
      return NextResponse.json({ error: 'Valor final inválido' }, { status: 400 })
    }

    const property = await ensureDefaultProperty(prisma)
    const currentQuote = await prisma.customQuote.findUnique({
      where: { id },
      select: {
        id: true,
        booking: {
          select: { propertyId: true },
        },
      },
    })

    if (!currentQuote || currentQuote.booking.propertyId !== property.id) {
      return NextResponse.json({ error: 'Proposta não encontrada' }, { status: 404 })
    }

    const quote = await prisma.customQuote.update({
      where: { id },
      data: {
        status: body.status,
        finalAmount,
      },
      include: {
        items: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    return NextResponse.json({ customQuote: mapCustomQuote(quote) })
  } catch (error) {
    console.error('PATCH /api/dashboard/custom-quotes/[id] error:', error)
    return NextResponse.json({ error: 'Falha ao salvar proposta' }, { status: 500 })
  }
}
