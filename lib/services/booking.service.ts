import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { parseLocalDate } from '@/lib/utils'
import { checkDateAvailability } from '@/lib/services/availability'
import { calculateBookingPrice, isGuestCountWithinCapacity, pricesMatch } from '@/lib/services/pricing'
import { ensureDefaultProperty } from '@/lib/services/property.service'
import { buildCustomQuoteDraft } from '@/lib/services/custom-quote.service'

export class BookingServiceError extends Error {
  constructor(
    public code: 'DATABASE_UNAVAILABLE' | 'PACKAGE_NOT_FOUND' | 'DATE_UNAVAILABLE' | 'INVALID_INPUT' | 'CATALOG_CHANGED',
    message: string
  ) {
    super(message)
  }
}

const MAX_TRANSACTION_ATTEMPTS = 3

function isRetryableTransactionConflict(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034'
}

export type CreateBookingInput = {
  date: string
  guests: number
  packageId: string
  expectedTotal: number
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
  const database = prisma

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

  const bookingDate = parseLocalDate(input.date)

  const createBookingInTransaction = () =>
    database.$transaction(async (tx) => {
      const property = await ensureDefaultProperty(tx)
      if (!isGuestCountWithinCapacity(input.guests, property.capacity)) {
        throw new BookingServiceError(
          'INVALID_INPUT',
          `O espaço comporta no máximo ${property.capacity} convidados.`
        )
      }

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
        return { id: addon.id, name: addon.name, price: addon.price, quantity }
      })

      const quote = calculateBookingPrice({
        package: selectedPackage,
        guestCount: input.guests,
        operationalFee: property.operationalFee,
        addons: selectedAddons,
      })
      if (!pricesMatch(input.expectedTotal, quote.totalAmount)) {
        throw new BookingServiceError(
          'CATALOG_CHANGED',
          'Os valores do catálogo foram atualizados. Revise a estimativa e envie novamente.'
        )
      }

      const customQuoteDraft = buildCustomQuoteDraft({
        notes: input.customer.notes,
        packageName: selectedPackage.name,
        basePrice: selectedPackage.basePrice,
        operationalFee: property.operationalFee,
        extraGuests: quote.extraGuests,
        extraGuestFee: selectedPackage.extraGuestFee,
        addons: selectedAddons,
      })

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

      const booking = await tx.booking.findUniqueOrThrow({
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

      return { booking, selectedPackage, quote }
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    })

  let result: Awaited<ReturnType<typeof createBookingInTransaction>> | null = null

  for (let attempt = 1; attempt <= MAX_TRANSACTION_ATTEMPTS; attempt += 1) {
    try {
      result = await createBookingInTransaction()
      break
    } catch (error) {
      if (!isRetryableTransactionConflict(error)) throw error
      if (attempt === MAX_TRANSACTION_ATTEMPTS) {
        throw new BookingServiceError(
          'DATE_UNAVAILABLE',
          'A data acabou de receber outra solicitação. Escolha uma nova data.'
        )
      }
    }
  }

  if (!result) {
    throw new BookingServiceError('DATE_UNAVAILABLE', 'Não foi possível garantir a disponibilidade da data.')
  }

  return {
    booking: result.booking,
    package: result.selectedPackage,
    quote: result.quote,
  }
}
