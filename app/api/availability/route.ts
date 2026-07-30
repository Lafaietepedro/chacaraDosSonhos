import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/rate-limit'
import {
  getUnavailableDateKeys,
  parseAvailabilityMonth,
} from '@/lib/services/availability'
import { getActiveProperty } from '@/lib/services/property.service'

export async function GET(request: Request) {
  const rateLimit = checkRateLimit({
    key: `availability:${getClientIp(request)}`,
    limit: 120,
    windowMs: 10 * 60 * 1000,
  })

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Muitas consultas em pouco tempo. Tente novamente em alguns minutos.' },
      { status: 429, headers: rateLimitHeaders(rateLimit) }
    )
  }

  const month = new URL(request.url).searchParams.get('month')
  const range = parseAvailabilityMonth(month)

  if (!month || !range) {
    return NextResponse.json(
      { error: 'Informe um mês válido no formato YYYY-MM.' },
      { status: 400, headers: rateLimitHeaders(rateLimit) }
    )
  }

  if (!prisma) {
    return NextResponse.json(
      { error: 'Disponibilidade temporariamente indisponível.' },
      { status: 503, headers: rateLimitHeaders(rateLimit) }
    )
  }

  try {
    const property = await getActiveProperty(prisma)
    if (!property) {
      return NextResponse.json(
        { error: 'Disponibilidade ainda não inicializada.' },
        { status: 503, headers: rateLimitHeaders(rateLimit) }
      )
    }
    const unavailableDates = await getUnavailableDateKeys(
      prisma,
      property.id,
      range.from,
      range.to
    )

    return NextResponse.json(
      { month, unavailableDates },
      {
        headers: {
          ...rateLimitHeaders(rateLimit),
          'Cache-Control': 'private, no-store',
        },
      }
    )
  } catch (error) {
    console.error('GET /api/availability error:', error)
    return NextResponse.json(
      { error: 'Não foi possível consultar a disponibilidade.' },
      { status: 500, headers: rateLimitHeaders(rateLimit) }
    )
  }
}
