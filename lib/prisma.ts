import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let client: PrismaClient | undefined

// Only initialize Prisma if DATABASE_URL is configured
if (process.env.DATABASE_URL) {
  client = globalForPrisma.prisma
  if (!client) {
    client = new PrismaClient()
    if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = client
  }
}

export const prisma = client
