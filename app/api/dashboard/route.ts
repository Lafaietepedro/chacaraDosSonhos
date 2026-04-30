import { NextResponse } from 'next/server'
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

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [bookings, monthly, totals, totalBookings] = await Promise.all([
      prisma.booking.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
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

