import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/api-auth'
import { ensureDefaultProperty, mapAddonToOption } from '@/lib/services/property.service'
import { upsertAddon } from '@/lib/services/addon.service'
import type { AddonSettingsInput } from '@/types/booking'

export async function GET(request: Request) {
  const authResult = verifyAuth(request)
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: 401 })
  }

  if (!prisma) {
    return NextResponse.json({ addons: [] })
  }

  const property = await ensureDefaultProperty(prisma)
  const addons = await prisma.extra.findMany({
    where: { propertyId: property.id },
    orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
  })

  return NextResponse.json({ addons: addons.map(mapAddonToOption) })
}

export async function POST(request: Request) {
  const authResult = verifyAuth(request)
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: 401 })
  }

  if (!prisma) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  try {
    const body = (await request.json()) as AddonSettingsInput
    const addon = await upsertAddon(prisma, body)
    return NextResponse.json({ addon })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Falha ao salvar adicional' },
      { status: 400 }
    )
  }
}
