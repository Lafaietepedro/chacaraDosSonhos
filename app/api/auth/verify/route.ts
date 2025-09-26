import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function GET() {
  try {
    const headersList = headers()
    const authorization = headersList.get('authorization')

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    const token = authorization.split(' ')[1]
    
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8')
      const [username, timestamp] = decoded.split(':')
      
      // Verificar se o token não expirou (24 horas)
      const tokenAge = Date.now() - parseInt(timestamp)
      const isExpired = tokenAge > 24 * 60 * 60 * 1000
      
      if (isExpired) {
        return NextResponse.json({ error: 'Token expirado' }, { status: 401 })
      }

      const expectedUsername = process.env.DASHBOARD_USERNAME || 'admin'
      if (username !== expectedUsername) {
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
      }

      return NextResponse.json({ success: true, username })
    } catch {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
