import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password } = body as { username: string; password: string }

    const expectedUsername = process.env.DASHBOARD_USERNAME || 'admin'
    const expectedPassword = process.env.DASHBOARD_PASSWORD || 'admin123'

    if (username === expectedUsername && password === expectedPassword) {
      // Token simples para sessão (em produção, usar JWT real)
      const token = Buffer.from(`${username}:${Date.now()}`).toString('base64')
      
      return NextResponse.json({ 
        success: true, 
        token: token,
        expires: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
      })
    }

    return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
