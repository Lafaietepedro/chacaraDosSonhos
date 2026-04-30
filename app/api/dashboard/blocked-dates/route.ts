import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/api-auth'
import { parseLocalDate } from '@/lib/utils'
import { ensureDefaultProperty } from '@/lib/services/property.service'

export async function GET(request: Request) {
  const authResult = verifyAuth(request)
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: 401 })
  }

  if (!prisma) {
    return NextResponse.json({ blockedDates: [] })
  }

  const property = await ensureDefaultProperty(prisma)
  const blockedDates = await prisma.blockedDate.findMany({
    where: { propertyId: property.id },
    orderBy: { startDate: 'asc' },
  })

  return NextResponse.json({
    blockedDates: blockedDates.map((blockedDate) => ({
      id: blockedDate.id,
      startDate: blockedDate.startDate.toISOString(),
      endDate: blockedDate.endDate.toISOString(),
      reason: blockedDate.reason,
    })),
  })
}

export async function POST(request: Request) {
  const authResult = verifyAuth(request)
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: 401 })
  }

  if (!prisma) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  const body = await request.json()
  const { date, reason } = body as { date: string; reason?: string }

  if (!date) {
    return NextResponse.json({ error: 'Date is required' }, { status: 400 })
  }

  const property = await ensureDefaultProperty(prisma)
  const blockedDate = parseLocalDate(date)

  let record = await prisma.blockedDate.findFirst({
    where: {
      propertyId: property.id,
      startDate: blockedDate,
      endDate: blockedDate,
    },
  })

  if (!record) {
    record = await prisma.blockedDate.create({
      data: {
        propertyId: property.id,
        startDate: blockedDate,
        endDate: blockedDate,
        reason: reason || null,
      },
    })
  } else if (record.reason !== (reason || null)) {
    record = await prisma.blockedDate.update({
      where: { id: record.id },
      data: { reason: reason || null },
    })
  }

  return NextResponse.json({
    blockedDate: {
      id: record.id,
      startDate: record.startDate.toISOString(),
      endDate: record.endDate.toISOString(),
      reason: record.reason,
    },
  })
}
