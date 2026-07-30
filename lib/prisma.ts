import { PrismaClient } from '@prisma/client'
import { resolveDatabaseEnv } from '@/lib/database-env'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let client: PrismaClient | undefined

function createPrismaClient() {
  const { databaseUrl } = resolveDatabaseEnv(process.env)
  return databaseUrl
    ? new PrismaClient({ datasources: { db: { url: databaseUrl } } })
    : new PrismaClient()
}

try {
  if (process.env.NODE_ENV !== 'production') {
    if (globalForPrisma.prisma) {
      client = globalForPrisma.prisma
    } else {
      client = createPrismaClient()
      globalForPrisma.prisma = client
    }
  } else {
    client = createPrismaClient()
  }
} catch (error) {
  console.warn('Prisma client initialization failed:', error)
  client = undefined
}

export const prisma = client
