import { Prisma, PrismaClient } from '@prisma/client'
import { ensureDefaultProperty, mapPackageToOption } from '@/lib/services/property.service'
import type { PackageSettingsInput } from '@/types/booking'

type DbClient = PrismaClient | Prisma.TransactionClient

function stringifyList(items: string[]) {
  return JSON.stringify(items.map((item) => item.trim()).filter(Boolean))
}

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}

export function validatePackageInput(input: PackageSettingsInput) {
  if (!input.name?.trim()) return 'Nome do pacote é obrigatório'
  if (!input.duration?.trim()) return 'Duração é obrigatória'
  if (!Number.isFinite(input.price) || input.price < 0) return 'Preço inválido'
  if (!Number.isFinite(input.capacity) || input.capacity < 1) return 'Capacidade inválida'
  if (!Number.isFinite(input.extraPerGuest) || input.extraPerGuest < 0) return 'Valor por convidado extra inválido'
  if (!Number.isFinite(input.sortOrder)) return 'Ordem inválida'

  return null
}

export async function upsertPackage(db: DbClient, input: PackageSettingsInput, packageId?: string) {
  const property = await ensureDefaultProperty(db)
  const validationError = validatePackageInput(input)

  if (validationError) {
    throw new Error(validationError)
  }

  const slug = slugify(input.slug || input.name)

  if (!slug) {
    throw new Error('Slug do pacote inválido')
  }

  if (packageId) {
    const existing = await db.bookingPackage.findFirst({
      where: {
        id: packageId,
        propertyId: property.id,
      },
    })

    if (!existing) {
      throw new Error('Pacote não encontrado')
    }

    const duplicate = await db.bookingPackage.findFirst({
      where: {
        propertyId: property.id,
        slug,
        id: { not: packageId },
      },
    })

    if (duplicate) {
      throw new Error('Já existe outro pacote com este identificador')
    }

    const updated = await db.bookingPackage.update({
      where: { id: packageId },
      data: {
        slug,
        name: input.name.trim(),
        description: input.description.trim() || null,
        basePrice: input.price,
        duration: input.duration.trim(),
        includedGuests: Math.round(input.capacity),
        extraGuestFee: input.extraPerGuest,
        features: stringifyList(input.features),
        notIncluded: stringifyList(input.notIncluded),
        isPopular: input.popular,
        isActive: input.isActive,
        sortOrder: Math.round(input.sortOrder),
      },
    })

    return mapPackageToOption(updated)
  }

  const created = await db.bookingPackage.create({
    data: {
      propertyId: property.id,
      slug,
      name: input.name.trim(),
      description: input.description.trim() || null,
      basePrice: input.price,
      duration: input.duration.trim(),
      includedGuests: Math.round(input.capacity),
      extraGuestFee: input.extraPerGuest,
      features: stringifyList(input.features),
      notIncluded: stringifyList(input.notIncluded),
      isPopular: input.popular,
      isActive: input.isActive,
      sortOrder: Math.round(input.sortOrder),
    },
  })

  return mapPackageToOption(created)
}
