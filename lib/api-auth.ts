import { verifyAuthorizationHeader } from '@/lib/services/admin-auth.service'

export function verifyAuth(request: Request): { success: boolean; username?: string; adminId?: string; error?: string } {
  try {
    return verifyAuthorizationHeader(request.headers.get('authorization'))
  } catch {
    return { success: false, error: 'Erro interno' }
  }
}
