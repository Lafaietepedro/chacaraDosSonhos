import { NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/api-auth'
import { ensureDefaultProperty } from '@/lib/services/property.service'
import type { DashboardStats } from '@/types/booking'

const emptyStats: DashboardStats = {
  totalBookings: 0,
  pendingBookings: 0,
  confirmedBookings: 0,
  cancelledBookings: 0,
  monthlyRevenue: 0,
  occupancyRate: 0,
}

const statusMap: Record<string, string> = {
  pending: 'PENDING',
  confirmed: 'CONFIRMED',
  cancelled: 'CANCELLED',
  rejected: 'REJECTED',
  completed: 'COMPLETED',
}

function parseDateParam(value: string | null, endOfDay = false) {
  if (!value) return null

  const date = new Date(`${value}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}`)
  return Number.isNaN(date.getTime()) ? null : date
}

export async function GET(request: Request) {
  try {
    // Verificar autenticação
    const authResult = verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }
    if (!prisma) {
      return NextResponse.json({ recentBookings: [], stats: emptyStats })
    }
    await ensureDefaultProperty(prisma)

    const { searchParams } = new URL(request.url)
    const statusParam = searchParams.get('status')?.toLowerCase()
    const search = searchParams.get('search')?.trim()
    const fromDate = parseDateParam(searchParams.get('from'))
    const toDate = parseDateParam(searchParams.get('to'), true)
    const take = Math.min(Number(searchParams.get('take')) || 50, 100)

    const bookingWhere: Prisma.BookingWhereInput = {}

    if (statusParam && statusParam !== 'all' && statusMap[statusParam]) {
      bookingWhere.status = statusMap[statusParam]
    }

    if (fromDate || toDate) {
      bookingWhere.startDate = {
        ...(fromDate ? { gte: fromDate } : {}),
        ...(toDate ? { lte: toDate } : {}),
      }
    }

    if (search) {
      bookingWhere.user = {
        is: {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { phone: { contains: search } },
          ],
        },
      }
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [bookings, monthly, totals, totalBookings] = await Promise.all([
      prisma.booking.findMany({
        where: bookingWhere,
        orderBy: { createdAt: 'desc' },
        take,
        include: { user: true, package: true },
      }),
      prisma.booking.aggregate({
        _sum: { totalPrice: true },
        where: { 
          createdAt: { gte: startOfMonth },
          status: 'CONFIRMED'
        },
      }),
      prisma.booking.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      prisma.booking.count(),
    ])

    const recentBookings = bookings.map((b) => ({
      id: b.id,
      customer: b.user?.name ?? 'Cliente',
      email: b.user?.email ?? '',
      phone: b.user?.phone ?? '',
      date: b.startDate ? new Date(b.startDate).toISOString() : null,
      guests: b.guests,
      extraGuests: b.extraGuests,
      packageId: b.packageId,
      packageName: b.packageNameSnapshot || b.package?.name || 'Pacote não informado',
      status: b.status.toLowerCase(),
      total: b.totalPrice,
      createdAt: b.createdAt.toISOString(),
      notes: b.notes || null
    }))

    const stats = {
      totalBookings,
      pendingBookings: totals.find((t) => t.status === 'PENDING')?._count.status ?? 0,
      confirmedBookings: totals.find((t) => t.status === 'CONFIRMED')?._count.status ?? 0,
      cancelledBookings:
        (totals.find((t) => t.status === 'CANCELLED')?._count.status ?? 0) +
        (totals.find((t) => t.status === 'REJECTED')?._count.status ?? 0),
      monthlyRevenue: monthly._sum.totalPrice ?? 0,
      occupancyRate: 0,
    }

    return NextResponse.json({ recentBookings, stats })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ recentBookings: [], stats: emptyStats }, { status: 200 })
  }
}
