import { prisma } from '@/lib/prisma'
import { parseLocalDate } from '@/lib/utils'
import { checkDateAvailability } from '@/lib/services/availability'
import { calculateBookingPrice } from '@/lib/services/pricing'
import { ensureDefaultProperty } from '@/lib/services/property.service'
import { buildCustomQuoteDraft } from '@/lib/services/custom-quote.service'

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
  addons?: Array<{
    id: string
    quantity: number
  }>
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

  const addonQuantities = new Map<string, number>()
  for (const requestedAddon of input.addons ?? []) {
    addonQuantities.set(
      requestedAddon.id,
      (addonQuantities.get(requestedAddon.id) ?? 0) + requestedAddon.quantity
    )
  }

  const selectedAddons = Array.from(addonQuantities.entries()).map(([addonId, quantity]) => {
    if (quantity > 20) {
      throw new BookingServiceError('INVALID_INPUT', 'Selected add-on quantity is too high')
    }

    const addon = property.extras.find((item) => item.id === addonId && item.isActive)

    if (!addon) {
      throw new BookingServiceError('INVALID_INPUT', 'Selected add-on was not found')
    }

    return {
      id: addon.id,
      name: addon.name,
      price: addon.price,
      quantity,
    }
  })

  const bookingDate = parseLocalDate(input.date)
  const quote = calculateBookingPrice({
    package: selectedPackage,
    guestCount: input.guests,
    operationalFee: property.operationalFee,
    addons: selectedAddons,
  })
  const customQuoteDraft = buildCustomQuoteDraft({
    notes: input.customer.notes,
    packageName: selectedPackage.name,
    basePrice: selectedPackage.basePrice,
    operationalFee: property.operationalFee,
    extraGuests: quote.extraGuests,
    extraGuestFee: selectedPackage.extraGuestFee,
    addons: selectedAddons,
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

    const createdBooking = await tx.booking.create({
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
        bookingExtras: selectedAddons.length > 0
          ? {
              create: selectedAddons.map((addon) => ({
                extraId: addon.id,
                quantity: addon.quantity,
              })),
            }
          : undefined,
      },
      include: {
        user: true,
        property: true,
        package: true,
        bookingExtras: {
          include: { extra: true },
        },
        customQuote: {
          include: { items: true },
        },
      },
    })

    if (customQuoteDraft) {
      await tx.customQuote.create({
        data: {
          bookingId: createdBooking.id,
          eventType: customQuoteDraft.eventType,
          desiredDuration: customQuoteDraft.desiredDuration,
          budgetRange: customQuoteDraft.budgetRange,
          requirements: customQuoteDraft.requirements,
          estimatedAmount: customQuoteDraft.estimatedAmount,
          status: 'DRAFT',
          items: {
            create: customQuoteDraft.items,
          },
        },
      })
    }

    return tx.booking.findUniqueOrThrow({
      where: { id: createdBooking.id },
      include: {
        user: true,
        property: true,
        package: true,
        bookingExtras: {
          include: { extra: true },
        },
        customQuote: {
          include: { items: true },
        },
      },
    })
  })

  return {
    booking,
    package: selectedPackage,
    quote,
  }
}
