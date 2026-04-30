import { Prisma, PrismaClient } from '@prisma/client'

type DbClient = PrismaClient | Prisma.TransactionClient

export type AvailabilityResult =
  | { available: true }
  | { available: false; reason: 'date_blocked' | 'already_booked' }

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
