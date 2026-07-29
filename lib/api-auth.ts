import { verifyAdminRequest } from '@/lib/services/admin-auth.service'

export function verifyAuth(request: Request): { success: boolean; username?: string; adminId?: string; error?: string } {
  try {
    return verifyAdminRequest(request)
  } catch {
    return { success: false, error: 'Erro interno' }
  }
}
