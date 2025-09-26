import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    if (!prisma) {
      return NextResponse.json({ recentBookings: [], stats: {
        totalBookings: 0,
        pendingBookings: 0,
        confirmedBookings: 0,
        cancelledBookings: 0,
        monthlyRevenue: 0,
        occupancyRate: 0,
      } })
    }
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [bookings, monthly] = await Promise.all([
      prisma.booking.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { user: true },
      }),
      prisma.booking.aggregate({
        _sum: { totalPrice: true },
        where: { createdAt: { gte: startOfMonth } },
      }),
    ])

    const recentBookings = bookings.map((b) => ({
      id: b.id,
      customer: b.user?.name ?? 'Cliente',
      date: b.startDate,
      guests: b.guests,
      package: '—',
      status: b.status.toLowerCase(),
      total: b.totalPrice,
    }))

    const totals = await prisma.booking.groupBy({
      by: ['status'],
      _count: { status: true },
    })

    const stats = {
      totalBookings: bookings.length,
      pendingBookings: totals.find((t) => t.status === 'PENDING')?._count.status ?? 0,
      confirmedBookings: totals.find((t) => t.status === 'CONFIRMED')?._count.status ?? 0,
      cancelledBookings: totals.find((t) => t.status === 'CANCELLED')?._count.status ?? 0,
      monthlyRevenue: monthly._sum.totalPrice ?? 0,
      occupancyRate: 0,
    }

    return NextResponse.json({ recentBookings, stats })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ recentBookings: [], stats: {} }, { status: 200 })
  }
}


