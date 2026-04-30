import { Prisma, PrismaClient } from '@prisma/client'
import { bookingPackages, siteConfig } from '@/lib/site'
import type { CatalogResponse, PackageOption } from '@/types/booking'

type DbClient = PrismaClient | Prisma.TransactionClient

export type PropertyWithPackages = Prisma.PropertyGetPayload<{
  include: { packages: true }
}>

function stringifyList(items: readonly string[]) {
  return JSON.stringify(items)
}

function parseList(value: string | null | undefined) {
  if (!value) return []

  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

export function mapPackageToOption(pkg: {
  id: string
  slug: string
  name: string
  description: string | null
  basePrice: number
  duration: string
  includedGuests: number
  extraGuestFee: number
  features: string
  notIncluded: string
  isPopular: boolean
  isActive?: boolean
  sortOrder?: number
}): PackageOption {
  return {
    id: pkg.id,
    slug: pkg.slug,
    name: pkg.name,
    price: pkg.basePrice,
    duration: pkg.duration,
    capacity: pkg.includedGuests,
    extraPerGuest: pkg.extraGuestFee,
    description: pkg.description ?? '',
    features: parseList(pkg.features),
    notIncluded: parseList(pkg.notIncluded),
    popular: pkg.isPopular,
    isActive: pkg.isActive,
    sortOrder: pkg.sortOrder,
  }
}

export function mapPropertyToCatalog(property: PropertyWithPackages): CatalogResponse {
  return {
    property: {
      id: property.id,
      name: property.name,
      description: property.description,
      capacity: property.capacity,
      basePrice: property.basePrice,
      operationalFee: property.operationalFee,
      contactEmail: property.contactEmail,
      contactPhone: property.contactPhone,
      address: property.address,
    },
    packages: property.packages.map(mapPackageToOption),
  }
}

export async function ensureDefaultProperty(db: DbClient): Promise<PropertyWithPackages> {
  let property = await db.property.findFirst({
    where: { isActive: true },
    include: {
      packages: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  if (!property) {
    property = await db.property.create({
      data: {
        name: siteConfig.venueName,
        description: siteConfig.appDescription,
        capacity: siteConfig.capacity,
        basePrice: bookingPackages[0].price,
        operationalFee: siteConfig.cleaningFee,
        contactEmail: siteConfig.email,
        contactPhone: siteConfig.phone,
        address: `${siteConfig.address} - ${siteConfig.city}`,
        packages: {
          create: bookingPackages.map((pkg, index) => ({
            slug: pkg.id,
            name: pkg.name,
            description: pkg.description,
            basePrice: pkg.price,
            duration: pkg.duration,
            includedGuests: pkg.capacity,
            extraGuestFee: pkg.extraPerGuest,
            features: stringifyList(pkg.features),
            notIncluded: stringifyList(pkg.notIncluded),
            isPopular: pkg.popular,
            sortOrder: index,
          })),
        },
      },
      include: {
        packages: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    })
  }

  const currentProperty = property

  if (currentProperty.packages.length === 0) {
    await Promise.all(
      bookingPackages.map((pkg, index) =>
        db.bookingPackage.upsert({
          where: {
            propertyId_slug: {
              propertyId: currentProperty.id,
              slug: pkg.id,
            },
          },
          update: {},
          create: {
            propertyId: currentProperty.id,
            slug: pkg.id,
            name: pkg.name,
            description: pkg.description,
            basePrice: pkg.price,
            duration: pkg.duration,
            includedGuests: pkg.capacity,
            extraGuestFee: pkg.extraPerGuest,
            features: stringifyList(pkg.features),
            notIncluded: stringifyList(pkg.notIncluded),
            isPopular: pkg.popular,
            sortOrder: index,
          },
        })
      )
    )

    property = await db.property.findUniqueOrThrow({
      where: { id: currentProperty.id },
      include: {
        packages: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    })
  }

  return property
}
