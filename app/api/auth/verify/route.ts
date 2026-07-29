import { NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/services/admin-auth.service'

export async function GET(request: Request) {
  try {
    const authResult = verifyAdminRequest(request)

    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    return NextResponse.json({ success: true, username: authResult.username })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
