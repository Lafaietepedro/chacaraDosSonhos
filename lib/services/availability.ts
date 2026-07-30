import { Prisma, PrismaClient } from '@prisma/client'

type DbClient = PrismaClient | Prisma.TransactionClient

export type AvailabilityResult =
  | { available: true }
  | { available: false; reason: 'date_blocked' | 'already_booked' }

type DateRange = {
  startDate: Date
  endDate: Date
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function parseAvailabilityMonth(value: string | null) {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) return null

  const [year, month] = value.split('-').map(Number)
  if (month < 1 || month > 12) return null

  return {
    from: new Date(Date.UTC(year, month - 1, 1, 12)),
    to: new Date(Date.UTC(year, month, 0, 12)),
  }
}

export function listUnavailableDateKeys(ranges: DateRange[]) {
  const keys = new Set<string>()

  for (const range of ranges) {
    const current = new Date(range.startDate)
    current.setUTCHours(12, 0, 0, 0)
    const end = new Date(range.endDate)
    end.setUTCHours(12, 0, 0, 0)

    while (current <= end) {
      keys.add(dateKey(current))
      current.setUTCDate(current.getUTCDate() + 1)
    }
  }

  return Array.from(keys).sort()
}

export async function getUnavailableDateKeys(
  db: DbClient,
  propertyId: string,
  from: Date,
  to: Date
) {
  const overlap = {
    propertyId,
    startDate: { lte: to },
    endDate: { gte: from },
  }
  const [blockedDates, bookings] = await Promise.all([
    db.blockedDate.findMany({
      where: overlap,
      select: { startDate: true, endDate: true },
    }),
    db.booking.findMany({
      where: {
        ...overlap,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      select: { startDate: true, endDate: true },
    }),
  ])

  const clippedRanges = [...blockedDates, ...bookings].map((range) => ({
    startDate: range.startDate < from ? from : range.startDate,
    endDate: range.endDate > to ? to : range.endDate,
  }))

  return listUnavailableDateKeys(clippedRanges)
}

export async function checkDateAvailability(
  db: DbClient,
  propertyId: string,
  date: Date
): Promise<AvailabilityResult> {
  const blocked = await db.blockedDate.findFirst({
    where: {
      propertyId,
      startDate: { lte: date },
      endDate: { gte: date },
    },
  })

  if (blocked) {
    return { available: false, reason: 'date_blocked' }
  }

  const existing = await db.booking.findFirst({
    where: {
      propertyId,
      startDate: { lte: date },
      endDate: { gte: date },
      status: { in: ['PENDING', 'CONFIRMED'] },
    },
  })

  if (existing) {
    return { available: false, reason: 'already_booked' }
  }

  return { available: true }
}
