import { prisma } from '@/lib/prisma'
import { parseLocalDate } from '@/lib/utils'
import { checkDateAvailability } from '@/lib/services/availability'
import { calculateBookingPrice } from '@/lib/services/pricing'
import { ensureDefaultProperty } from '@/lib/services/property.service'

export class BookingServiceError extends Error {
  constructor(
    public code: 'DATABASE_UNAVAILABLE' | 'PACKAGE_NOT_FOUND' | 'DATE_UNAVAILABLE' | 'INVALID_INPUT',
    message: string
  ) {
    super(message)
  }
}

export type CreateBookingInput = {
  date: string
  guests: number
  packageId: string
  customer: {
    name: string
    email: string
    phone: string
    notes?: string
  }
}

export async function createBookingRequest(input: CreateBookingInput) {
  if (!prisma) {
    throw new BookingServiceError('DATABASE_UNAVAILABLE', 'Database not configured')
  }

  if (
    !input.date ||
    !input.packageId ||
    !Number.isFinite(input.guests) ||
    input.guests < 1 ||
    !input.customer?.name ||
    !input.customer?.email
  ) {
    throw new BookingServiceError('INVALID_INPUT', 'Invalid booking payload')
  }

  const property = await ensureDefaultProperty(prisma)
  const selectedPackage = property.packages.find(
    (pkg) => pkg.id === input.packageId || pkg.slug === input.packageId
  )

  if (!selectedPackage) {
    throw new BookingServiceError('PACKAGE_NOT_FOUND', 'Selected package was not found')
  }

  const bookingDate = parseLocalDate(input.date)
  const quote = calculateBookingPrice({
    package: selectedPackage,
    guestCount: input.guests,
    operationalFee: property.operationalFee,
  })

  const booking = await prisma.$transaction(async (tx) => {
    const availability = await checkDateAvailability(tx, property.id, bookingDate)
    if (!availability.available) {
      throw new BookingServiceError('DATE_UNAVAILABLE', availability.reason)
    }

    const user = await tx.user.upsert({
      where: { email: input.customer.email },
      update: {
        name: input.customer.name,
        phone: input.customer.phone,
      },
      create: {
        email: input.customer.email,
        name: input.customer.name,
        phone: input.customer.phone,
        role: 'GUEST',
      },
    })

    return tx.booking.create({
      data: {
        startDate: bookingDate,
        endDate: bookingDate,
        guests: input.guests,
        extraGuests: quote.extraGuests,
        totalPrice: quote.totalAmount,
        status: 'PENDING',
        packageId: selectedPackage.id,
        packageNameSnapshot: selectedPackage.name,
        basePriceSnapshot: selectedPackage.basePrice,
        extraGuestFeeSnapshot: selectedPackage.extraGuestFee,
        operationalFeeSnapshot: property.operationalFee,
        notes: input.customer.notes,
        userId: user.id,
        propertyId: property.id,
      },
      include: {
        user: true,
        property: true,
        package: true,
      },
    })
  })

  return {
    booking,
    package: selectedPackage,
    quote,
  }
}
