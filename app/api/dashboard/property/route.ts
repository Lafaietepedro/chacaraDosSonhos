import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/api-auth'
import { ensureDefaultProperty, mapPropertyToCatalog } from '@/lib/services/property.service'
import type { PropertySettingsInput } from '@/types/booking'

function unauthorized(request: Request) {
  const authResult = verifyAuth(request)
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: 401 })
  }

  return null
}

export async function GET(request: Request) {
  const authError = unauthorized(request)
  if (authError) return authError

  if (!prisma) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  const property = await ensureDefaultProperty(prisma)
  return NextResponse.json(mapPropertyToCatalog(property))
}

export async function PATCH(request: Request) {
  const authError = unauthorized(request)
  if (authError) return authError

  if (!prisma) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  const body = (await request.json()) as PropertySettingsInput

  if (!body.name?.trim() || !body.description?.trim() || !body.address?.trim()) {
    return NextResponse.json({ error: 'Nome, descrição e endereço são obrigatórios' }, { status: 400 })
  }

  if (!Number.isFinite(body.capacity) || body.capacity < 1) {
    return NextResponse.json({ error: 'Capacidade inválida' }, { status: 400 })
  }

  if (!Number.isFinite(body.operationalFee) || body.operationalFee < 0) {
    return NextResponse.json({ error: 'Taxa operacional inválida' }, { status: 400 })
  }

  const property = await ensureDefaultProperty(prisma)
  const updated = await prisma.property.update({
    where: { id: property.id },
    data: {
      name: body.name.trim(),
      description: body.description.trim(),
      capacity: Math.round(body.capacity),
      operationalFee: body.operationalFee,
      contactEmail: body.contactEmail.trim() || null,
      contactPhone: body.contactPhone.trim() || null,
      address: body.address.trim(),
    },
    include: {
      packages: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
      extras: {
        where: { isActive: true },
        orderBy: { name: 'asc' },
      },
    },
  })

  return NextResponse.json(mapPropertyToCatalog(updated))
}
