import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto'
import type { AdminUser, Prisma, PrismaClient } from '@prisma/client'
import { prisma } from '@/lib/prisma'

const TOKEN_TTL_SECONDS = 24 * 60 * 60
const HASH_PREFIX = 'scrypt'
const HASH_KEY_LENGTH = 64

type DbClient = PrismaClient | Prisma.TransactionClient

type TokenPayload = {
  sub: string
  email: string
  name: string
  iat: number
  exp: number
}

export type AuthResult =
  | { success: true; username: string; adminId: string }
  | { success: false; error: string }

function getBootstrapCredentials() {
  const username = process.env.DASHBOARD_USERNAME || (process.env.NODE_ENV === 'production' ? undefined : 'admin')
  const password = process.env.DASHBOARD_PASSWORD || (process.env.NODE_ENV === 'production' ? undefined : 'admin123')

  return { username, password }
}

function getTokenSecret() {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET

  if (secret) return secret
  if (process.env.NODE_ENV === 'production') {
    throw new Error('AUTH_SECRET não configurado')
  }

  return 'venue-eventos-development-secret'
}

function base64url(input: string | Buffer) {
  return Buffer.from(input).toString('base64url')
}

function sign(value: string) {
  return createHmac('sha256', getTokenSecret()).update(value).digest('base64url')
}

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  if (leftBuffer.length !== rightBuffer.length) return false
  return timingSafeEqual(leftBuffer, rightBuffer)
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('base64url')
  const hash = scryptSync(password, salt, HASH_KEY_LENGTH).toString('base64url')

  return `${HASH_PREFIX}:${salt}:${hash}`
}

export function verifyPassword(password: string, passwordHash: string) {
  const [prefix, salt, storedHash] = passwordHash.split(':')
  if (prefix !== HASH_PREFIX || !salt || !storedHash) return false

  const hash = scryptSync(password, salt, HASH_KEY_LENGTH).toString('base64url')
  return safeCompare(hash, storedHash)
}

export function createAdminToken(admin: Pick<AdminUser, 'id' | 'email' | 'name'>) {
  const now = Math.floor(Date.now() / 1000)
  const payload: TokenPayload = {
    sub: admin.id,
    email: admin.email,
    name: admin.name,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
  }
  const encodedPayload = base64url(JSON.stringify(payload))
  const signature = sign(encodedPayload)

  return {
    token: `${encodedPayload}.${signature}`,
    expires: payload.exp * 1000,
  }
}

export function verifyAdminToken(token: string): AuthResult {
  const [encodedPayload, signature] = token.split('.')
  if (!encodedPayload || !signature) {
    return { success: false, error: 'Token inválido' }
  }

  const expectedSignature = sign(encodedPayload)
  if (!safeCompare(signature, expectedSignature)) {
    return { success: false, error: 'Token inválido' }
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8')) as Partial<TokenPayload>
    const now = Math.floor(Date.now() / 1000)

    if (!payload.sub || !payload.email || !payload.name || !payload.exp || payload.exp < now) {
      return { success: false, error: payload.exp && payload.exp < now ? 'Token expirado' : 'Token inválido' }
    }

    return { success: true, username: payload.email, adminId: payload.sub }
  } catch {
    return { success: false, error: 'Token inválido' }
  }
}

export function verifyAuthorizationHeader(authHeader: string | null): AuthResult {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { success: false, error: 'Token não fornecido' }
  }

  return verifyAdminToken(authHeader.slice('Bearer '.length))
}

export async function ensureBootstrapAdmin(db: DbClient) {
  const adminCount = await db.adminUser.count()
  if (adminCount > 0) return null

  const { username, password } = getBootstrapCredentials()
  if (!username || !password) {
    throw new Error('Credenciais administrativas não configuradas')
  }

  return db.adminUser.create({
    data: {
      email: username,
      name: 'Administrador',
      passwordHash: hashPassword(password),
    },
  })
}

export async function authenticateAdmin(username: string, password: string) {
  if (!prisma) {
    throw new Error('Banco de dados indisponível')
  }

  await ensureBootstrapAdmin(prisma)

  const admin = await prisma.adminUser.findUnique({
    where: { email: username },
  })

  if (!admin || !admin.isActive || !verifyPassword(password, admin.passwordHash)) {
    return null
  }

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
  })

  return admin
}
