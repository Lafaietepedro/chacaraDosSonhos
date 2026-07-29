import { NextResponse } from 'next/server'
import { ADMIN_SESSION_COOKIE } from '@/lib/services/admin-auth.service'

export async function POST() {
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
