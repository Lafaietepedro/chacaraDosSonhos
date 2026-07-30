import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getActiveProperty, mapPropertyToCatalog } from '@/lib/services/property.service'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    if (!prisma) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const property = await getActiveProperty(prisma)
    if (!property) {
      return NextResponse.json({ error: 'Catalog not initialized' }, { status: 503 })
    }
    return NextResponse.json(mapPropertyToCatalog(property))
  } catch (error) {
    console.error('GET /api/catalog error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
