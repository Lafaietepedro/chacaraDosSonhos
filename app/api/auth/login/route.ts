import { NextResponse } from 'next/server'
import {
  ADMIN_SESSION_COOKIE,
  TOKEN_TTL_SECONDS,
  authenticateAdmin,
  createAdminToken,
} from '@/lib/services/admin-auth.service'
import { checkRateLimit, clearRateLimit, getClientIp, rateLimitHeaders } from '@/lib/rate-limit'

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request)
    const rateLimitKey = `admin-login:${clientIp}`
    const rateLimit = checkRateLimit({
      key: rateLimitKey,
      limit: 5,
      windowMs: 15 * 60 * 1000,
    })

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas de acesso. Aguarde alguns minutos e tente novamente.' },
        { status: 429, headers: rateLimitHeaders(rateLimit) }
      )
    }

    const body = await request.json()
    const { username: rawUsername, password } = body as { username: string; password: string }
    const username = rawUsername?.trim()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Informe usuário e senha' },
        { status: 400, headers: rateLimitHeaders(rateLimit) }
      )
    }

    const admin = await authenticateAdmin(username, password)
    if (!admin) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401, headers: rateLimitHeaders(rateLimit) }
      )
    }

    clearRateLimit(rateLimitKey)
    const session = createAdminToken(admin)
    const response = NextResponse.json({
      success: true,
      expires: session.expires,
    })
    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: session.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: TOKEN_TTL_SECONDS,
    })

    return response
  } catch (error) {
    console.error(error)
    if (error instanceof Error && error.message.includes('Credenciais administrativas')) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
