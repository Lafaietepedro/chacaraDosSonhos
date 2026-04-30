import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/api-auth'
import { upsertPackage } from '@/lib/services/package.service'
import type { PackageSettingsInput } from '@/types/booking'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = verifyAuth(request)
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: 401 })
  }

  if (!prisma) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  try {
    const { id } = await params
    const body = (await request.json()) as PackageSettingsInput
    const packageOption = await upsertPackage(prisma, body, id)
    return NextResponse.json({ package: packageOption })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Falha ao salvar pacote' },
      { status: 400 }
    )
  }
}
