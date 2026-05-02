import { Prisma, PrismaClient } from '@prisma/client'
import { ensureDefaultProperty, mapAddonToOption } from '@/lib/services/property.service'
import type { AddonSettingsInput } from '@/types/booking'

type DbClient = PrismaClient | Prisma.TransactionClient

function normalizeAddonInput(input: AddonSettingsInput) {
  const name = input.name.trim()
  const description = input.description.trim()

  if (!name) {
    throw new Error('Nome do adicional é obrigatório')
  }

  if (!Number.isFinite(input.price) || input.price < 0) {
    throw new Error('Preço do adicional inválido')
  }

  return {
    name,
    description: description || null,
    price: input.price,
    isActive: input.isActive,
  }
}

export async function upsertAddon(db: DbClient, input: AddonSettingsInput, addonId?: string) {
  const property = await ensureDefaultProperty(db)
  const data = normalizeAddonInput(input)

  const duplicate = await db.extra.findFirst({
    where: {
      propertyId: property.id,
      name: data.name,
      ...(addonId ? { NOT: { id: addonId } } : {}),
    },
  })

  if (duplicate) {
    throw new Error('Já existe um adicional com esse nome')
  }

  if (addonId) {
    const existing = await db.extra.findFirst({
      where: {
        id: addonId,
        propertyId: property.id,
      },
    })

    if (!existing) {
      throw new Error('Adicional não encontrado')
    }

    const updated = await db.extra.update({
      where: { id: addonId },
      data,
    })

    return mapAddonToOption(updated)
  }

  const created = await db.extra.create({
    data: {
      ...data,
      propertyId: property.id,
    },
  })

  return mapAddonToOption(created)
}
