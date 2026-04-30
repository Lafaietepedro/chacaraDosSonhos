import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ensureDefaultProperty, mapPropertyToCatalog } from '@/lib/services/property.service'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    if (!prisma) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const property = await ensureDefaultProperty(prisma)
    return NextResponse.json(mapPropertyToCatalog(property))
  } catch (error) {
    console.error('GET /api/catalog error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
