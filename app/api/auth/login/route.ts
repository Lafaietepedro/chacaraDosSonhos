import { NextResponse } from 'next/server'
import { authenticateAdmin, createAdminToken } from '@/lib/services/admin-auth.service'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password } = body as { username: string; password: string }

    if (!username || !password) {
      return NextResponse.json({ error: 'Informe usuário e senha' }, { status: 400 })
    }

    const admin = await authenticateAdmin(username, password)
    if (!admin) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      ...createAdminToken(admin),
    })
  } catch (error) {
    console.error(error)
    if (error instanceof Error && error.message.includes('Credenciais administrativas')) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
