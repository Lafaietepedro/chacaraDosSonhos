import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/api-auth'
import { ensureDefaultProperty, mapPackageToOption } from '@/lib/services/property.service'
import { upsertPackage } from '@/lib/services/package.service'
import type { PackageSettingsInput } from '@/types/booking'

export async function GET(request: Request) {
  const authResult = verifyAuth(request)
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: 401 })
  }

  if (!prisma) {
    return NextResponse.json({ packages: [] })
  }

  const property = await ensureDefaultProperty(prisma)
  const packages = await prisma.bookingPackage.findMany({
    where: { propertyId: property.id },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  })

  return NextResponse.json({ packages: packages.map(mapPackageToOption) })
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
    const body = (await request.json()) as PackageSettingsInput
    const packageOption = await upsertPackage(prisma, body)
    return NextResponse.json({ package: packageOption })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Falha ao salvar pacote' },
      { status: 400 }
    )
  }
}
