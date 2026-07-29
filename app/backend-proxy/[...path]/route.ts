import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_SESSION_COOKIE, TOKEN_TTL_SECONDS } from '@/lib/services/admin-auth.service'
import { checkRateLimit, clearRateLimit, getClientIp, rateLimitHeaders } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type RouteContext = {
  params: Promise<{ path: string[] }>
}

const REQUEST_HEADERS = [
  'accept',
  'accept-language',
  'content-type',
  'if-none-match',
  'user-agent',
]

const ALLOWED_API_ROOTS = new Set([
  'auth',
  'bookings',
  'catalog',
  'contact',
  'dashboard',
])

function backendBaseUrl() {
  const value = process.env.BACKEND_BASE_URL?.trim().replace(/\/+$/, '')

  if (!value) {
    throw new Error('BACKEND_BASE_URL não configurada')
  }

  const url = new URL(value)
  if (url.protocol !== 'https:' && url.hostname !== 'localhost') {
    throw new Error('BACKEND_BASE_URL precisa usar HTTPS')
  }

  return url
}

function responseHeaders(response: Response) {
  const headers = new Headers()

  for (const name of ['content-type', 'content-disposition', 'cache-control', 'etag', 'last-modified']) {
    const value = response.headers.get(name)
    if (value) headers.set(name, value)
  }

  return headers
}

async function proxyRequest(request: NextRequest, context: RouteContext) {
  const { path } = await context.params
  const routePath = path.join('/')
  const apiRoot = path[0]

  if (!apiRoot || !ALLOWED_API_ROOTS.has(apiRoot)) {
    return NextResponse.json({ error: 'Rota não encontrada' }, { status: 404 })
  }

  if (routePath === 'auth/logout') {
    const response = NextResponse.json({ success: true })
    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })
    return response
  }

  const rateLimitKey = `admin-login:${getClientIp(request)}`
  let rateLimit: ReturnType<typeof checkRateLimit> | undefined

  if (routePath === 'auth/login' && request.method === 'POST') {
    rateLimit = checkRateLimit({
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
  }

  const destination = new URL(`/api/${routePath}`, backendBaseUrl())
  destination.search = request.nextUrl.search

  const headers = new Headers()
  for (const name of REQUEST_HEADERS) {
    const value = request.headers.get(name)
    if (value) headers.set(name, value)
  }

  const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  if (sessionToken) {
    headers.set('authorization', `Bearer ${sessionToken}`)
  } else {
    const authorization = request.headers.get('authorization')
    if (authorization && authorization !== 'Bearer null') {
      headers.set('authorization', authorization)
    }
  }

  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) headers.set('x-forwarded-for', forwardedFor)

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD'
  let originResponse: Response
  try {
    originResponse = await fetch(destination, {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      cache: 'no-store',
      redirect: 'manual',
      signal: AbortSignal.timeout(20_000),
    })
  } catch {
    return NextResponse.json(
      { error: 'Serviço temporariamente indisponível' },
      { status: 502 }
    )
  }

  if (routePath === 'auth/login') {
    const data = await originResponse.json().catch(() => ({ error: 'Resposta inválida do servidor' }))

    if (!originResponse.ok || typeof data.token !== 'string') {
      return NextResponse.json(data, {
        status: originResponse.status,
        headers: rateLimit ? rateLimitHeaders(rateLimit) : undefined,
      })
    }

    clearRateLimit(rateLimitKey)
    const { token, ...safeData } = data
    const response = NextResponse.json(safeData, { status: originResponse.status })
    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: TOKEN_TTL_SECONDS,
    })
    return response
  }

  return new NextResponse(originResponse.body, {
    status: originResponse.status,
    headers: responseHeaders(originResponse),
  })
}

export const GET = proxyRequest
export const POST = proxyRequest
export const PUT = proxyRequest
export const PATCH = proxyRequest
export const DELETE = proxyRequest
