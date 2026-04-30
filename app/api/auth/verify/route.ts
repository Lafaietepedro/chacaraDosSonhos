import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { verifyAuthorizationHeader } from '@/lib/services/admin-auth.service'

export async function GET() {
  try {
    const headersList = headers()
    const authResult = verifyAuthorizationHeader(headersList.get('authorization'))

    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    return NextResponse.json({ success: true, username: authResult.username })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
