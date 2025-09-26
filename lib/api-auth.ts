import { NextRequest } from 'next/server'

export function verifyAuth(request: Request): { success: boolean; username?: string; error?: string } {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, error: 'Token não fornecido' }
    }

    const token = authHeader.split(' ')[1]
    
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8')
      const [username, timestamp] = decoded.split(':')
      
      // Verificar se o token não expirou (24 horas)
      const tokenAge = Date.now() - parseInt(timestamp)
      const isExpired = tokenAge > 24 * 60 * 60 * 1000
      
      if (isExpired) {
        return { success: false, error: 'Token expirado' }
      }

      const expectedUsername = process.env.DASHBOARD_USERNAME || 'admin'
      if (username !== expectedUsername) {
        return { success: false, error: 'Token inválido' }
      }

      return { success: true, username }
    } catch {
      return { success: false, error: 'Token inválido' }
    }
  } catch {
    return { success: false, error: 'Erro interno' }
  }
}
