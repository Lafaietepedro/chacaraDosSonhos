import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/api-auth'
import { hashPassword, verifyPassword } from '@/lib/services/admin-auth.service'

export async function PATCH(request: Request) {
  try {
    const authResult = verifyAuth(request)
    if (!authResult.success || !authResult.adminId) {
      return NextResponse.json({ error: authResult.error || 'Token inválido' }, { status: 401 })
    }

    if (!prisma) {
      return NextResponse.json({ error: 'Banco de dados indisponível' }, { status: 503 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body as {
      currentPassword?: string
      newPassword?: string
    }

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Informe a senha atual e a nova senha' }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'A nova senha deve ter pelo menos 8 caracteres' }, { status: 400 })
    }

    const admin = await prisma.adminUser.findUnique({
      where: { id: authResult.adminId },
    })

    if (!admin || !admin.isActive) {
      return NextResponse.json({ error: 'Administrador não encontrado' }, { status: 404 })
    }

    if (!verifyPassword(currentPassword, admin.passwordHash)) {
      return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 401 })
    }

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { passwordHash: hashPassword(newPassword) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
